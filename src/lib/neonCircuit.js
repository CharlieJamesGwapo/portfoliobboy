// ============================================================================
// Neon Circuit — a genuinely 3D arcade racer.
//
// Every other game in this arcade draws 2D canvas gameplay and parks a Three.js
// scene behind it as wallpaper. This one is the real thing: a perspective
// chase camera, a directional light casting real shadow maps onto the road,
// physically-shaded metal, exponential fog, and instanced geometry pools.
//
// Written against raw three.js rather than @react-three/fiber on purpose:
//
//   - A reconciler in a 60 fps loop is overhead this does not need. Nothing in
//     the scene graph is declarative — the whole game is a fixed pool of
//     objects whose transforms are rewritten each frame.
//   - It keeps the chunk off r3f-vendor. three-vendor is already shared with
//     the hero, so the marginal download for this game is a few kB.
//   - Disposal is explicit, which matters when the player exits to the lobby
//     and back repeatedly; browsers cap live WebGL contexts per page.
//
// The world scrolls past a stationary player rather than the player advancing
// down a long track. Over a few minutes at 70 u/s a moving player would drift
// far enough out that float32 positions start to visibly quantise; scrolling
// the world keeps every coordinate near the origin indefinitely.
// ============================================================================
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  FogExp2,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  Quaternion,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

// --- tuning ----------------------------------------------------------------
const ROAD_HALF = 7.4 // playable half-width, in world units
const SPAWN_Z = -190 // where obstacles and orbs enter the world
const DESPAWN_Z = 14 // just behind the camera
const START_SPEED = 30
const MAX_SPEED = 78
const SPEED_RAMP = 0.62 // units/sec gained per second survived
const STEER_ACCEL = 46
const STEER_DAMP = 6.5
const MAX_STEER = 19
const GRAVITY = -54
const JUMP_VELOCITY = 16.5
const START_LIVES = 3
const INVULNERABLE_TIME = 1.7
const ORB_SCORE = 50

const OBSTACLE_POOL = 44
const ORB_POOL = 30
const PYLON_POOL = 36
const BUILDING_POOL = 40

/**
 * Pick a quality tier from what the device advertises.
 *
 * Shadow maps are the single most expensive thing in this scene, so they are
 * the first thing dropped. The hints are Chromium-only; absent values are
 * treated as "capable" rather than blocking Safari and Firefox out of the
 * good-looking version.
 */
export function detectQuality() {
  if (typeof window === 'undefined') return { tier: 'low', dpr: 1, shadows: false, shadowSize: 512 }

  const cores = navigator.hardwareConcurrency
  const memory = navigator.deviceMemory
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 820

  const weak =
    (typeof cores === 'number' && cores <= 4) ||
    (typeof memory === 'number' && memory <= 4) ||
    (coarse && small)

  if (weak) return { tier: 'low', dpr: 1, shadows: false, shadowSize: 512 }
  if (coarse || small) return { tier: 'medium', dpr: 1.25, shadows: true, shadowSize: 1024 }
  return { tier: 'high', dpr: 1.6, shadows: true, shadowSize: 2048 }
}

/**
 * The road surface, painted once into a 2D canvas and scrolled by animating
 * the texture offset.
 *
 * This is why the road needs no geometry updates at all: one static plane, one
 * draw call, and the sensation of speed comes from `offset.y`. Building it out
 * of moving segments would cost a pool, a recycle pass, and a lot more
 * overdraw for an identical result.
 */
function makeRoadTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0a0d18'
  ctx.fillRect(0, 0, size, size)

  // Subtle asphalt noise so the surface catches the light instead of reading
  // as flat colour under the directional lamp.
  ctx.fillStyle = 'rgba(255,255,255,0.022)'
  for (let i = 0; i < 900; i += 1) {
    ctx.fillRect((i * 97) % size, (i * 61) % size, 2, 2)
  }

  // Edge lines
  ctx.fillStyle = 'rgba(103, 224, 193, 0.55)'
  ctx.fillRect(10, 0, 6, size)
  ctx.fillRect(size - 16, 0, 6, size)

  // Dashed centre lane markers
  ctx.fillStyle = 'rgba(245, 242, 233, 0.5)'
  for (let lane = 1; lane <= 2; lane += 1) {
    const x = (size / 3) * lane - 3
    for (let y = 0; y < size; y += 128) ctx.fillRect(x, y, 6, 70)
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1, 26)
  texture.anisotropy = 4
  return texture
}

// Engine trail: additive points with a soft radial falloff, shaded rather than
// textured so the module stays free of binary assets.
const TRAIL_VERTEX = /* glsl */ `
  attribute float aLife;
  uniform float uPixelRatio;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (6.0 + aLife * 26.0) * uPixelRatio * (12.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const TRAIL_FRAGMENT = /* glsl */ `
  precision mediump float;
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 2.0) * vLife * 0.85;
    vec3 color = mix(vec3(1.0, 0.45, 0.25), vec3(0.42, 0.92, 0.85), vLife);
    gl_FragColor = vec4(color * a, a);
  }
`

const randomRange = (min, max) => min + Math.random() * (max - min)

export function createNeonCircuit(canvas, options = {}) {
  const { onHud, onGameOver, onPickup, onCrash, quality = detectQuality() } = options

  let renderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: quality.tier === 'high', powerPreference: 'high-performance' })
  } catch {
    return null
  }

  renderer.setClearColor(0x05060f, 1)
  if (quality.shadows) {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
  }

  const scene = new Scene()
  scene.fog = new FogExp2(0x05060f, 0.0125)

  const camera = new PerspectiveCamera(64, 1, 0.5, 320)
  camera.position.set(0, 4.6, 10.4)

  // --- lighting ------------------------------------------------------------
  // Kept low: hemisphere light fills shadowed faces uniformly, so raising it
  // washes out the directional lamp's shadows, which are the main thing
  // selling the scene as 3D rather than as flat art.
  scene.add(new HemisphereLight(0x2a3a6a, 0x05060f, 0.34))

  const sun = new DirectionalLight(0xffffff, 1.45)
  // High and slightly to the side, but level with the craft in z. Placing it
  // behind the camera threw the ship's shadow away down the road where the
  // craft itself hid it; from here the shadow lands just beside the hull,
  // which is the cheapest and strongest cue that this is a real 3D scene.
  sun.position.set(8, 20, -2)
  if (quality.shadows) {
    sun.castShadow = true
    sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize)
    // The shadow camera is deliberately tiny — it only ever needs to cover the
    // ship and the few obstacles near it. A frustum sized to the whole visible
    // road would spread the same texels over 200 units and produce mush.
    const s = sun.shadow.camera
    s.left = -16
    s.right = 16
    s.top = 16
    s.bottom = -16
    s.near = 1
    s.far = 60
    s.updateProjectionMatrix()
    sun.shadow.bias = -0.0012
    sun.shadow.normalBias = 0.02
  }
  scene.add(sun)
  scene.add(sun.target)

  const rimLeft = new PointLight(0x67e0c1, 26, 26, 2)
  rimLeft.position.set(-5, 2.4, 1)
  scene.add(rimLeft)
  const rimRight = new PointLight(0xff5fb0, 22, 26, 2)
  rimRight.position.set(5, 2.4, -2)
  scene.add(rimRight)

  // --- road ----------------------------------------------------------------
  const roadTexture = makeRoadTexture()
  const roadMaterial = new MeshStandardMaterial({ map: roadTexture, roughness: 0.62, metalness: 0.12 })
  const road = new Mesh(new PlaneGeometry(ROAD_HALF * 2 + 1.4, 420), roadMaterial)
  road.rotation.x = -Math.PI / 2
  road.position.set(0, 0, -180)
  road.receiveShadow = quality.shadows
  scene.add(road)

  const railGeometry = new BoxGeometry(0.36, 0.72, 420)
  const railMaterial = new MeshStandardMaterial({
    color: 0x0e2a30,
    emissive: 0x27d3a8,
    emissiveIntensity: 1.5,
    roughness: 0.35,
    metalness: 0.5,
  })
  for (const side of [-1, 1]) {
    const rail = new Mesh(railGeometry, railMaterial)
    rail.position.set(side * (ROAD_HALF + 0.6), 0.36, -180)
    scene.add(rail)
  }

  // --- instanced pools -----------------------------------------------------
  // Everything that repeats is one InstancedMesh: obstacles, orbs, pylons and
  // the skyline are four draw calls total instead of ~150.
  // Scratch objects, allocated once. Every transform in the frame loop is
  // composed through these — a `new Vector3()` per instance per frame would
  // hand the GC ~5000 objects a second and show up as periodic stutter.
  const matrix = new Matrix4()
  const position = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3(1, 1, 1)
  const IDENTITY_QUAT = new Quaternion()
  const UP = new Vector3(0, 1, 0)
  const LOOK_AT = new Vector3()

  const hide = (mesh, index) => {
    // Collapsing to zero scale is cheaper than rebuilding the instance count,
    // and keeps indices stable so the pools can stay simple arrays.
    matrix.compose(position.set(0, -999, 0), IDENTITY_QUAT, scale.set(0.0001, 0.0001, 0.0001))
    mesh.setMatrixAt(index, matrix)
  }

  const obstacleMaterial = new MeshStandardMaterial({
    color: 0x2a0f1c,
    emissive: 0xff3d6e,
    emissiveIntensity: 0.9,
    roughness: 0.4,
    metalness: 0.35,
  })
  const obstacles = new InstancedMesh(new BoxGeometry(1, 1, 1), obstacleMaterial, OBSTACLE_POOL)
  obstacles.instanceMatrix.setUsage(DynamicDrawUsage)
  obstacles.castShadow = quality.shadows
  obstacles.frustumCulled = false
  scene.add(obstacles)

  const orbMaterial = new MeshStandardMaterial({
    color: 0x0b3f38,
    emissive: 0x8ff0d8,
    emissiveIntensity: 2.1,
    roughness: 0.25,
    metalness: 0.2,
  })
  const orbs = new InstancedMesh(new IcosahedronGeometry(0.52, 0), orbMaterial, ORB_POOL)
  orbs.instanceMatrix.setUsage(DynamicDrawUsage)
  orbs.frustumCulled = false
  scene.add(orbs)

  const pylonMaterial = new MeshStandardMaterial({
    color: 0x121a2c,
    emissive: 0x3d6ef0,
    emissiveIntensity: 1.1,
    roughness: 0.5,
    metalness: 0.4,
  })
  const pylons = new InstancedMesh(new BoxGeometry(0.5, 5.2, 0.5), pylonMaterial, PYLON_POOL)
  pylons.instanceMatrix.setUsage(DynamicDrawUsage)
  pylons.frustumCulled = false
  scene.add(pylons)

  const buildingMaterial = new MeshStandardMaterial({
    color: 0x080c18,
    emissive: 0x1b2f66,
    emissiveIntensity: 0.7,
    roughness: 0.8,
    metalness: 0.1,
  })
  const buildings = new InstancedMesh(new BoxGeometry(1, 1, 1), buildingMaterial, BUILDING_POOL)
  buildings.instanceMatrix.setUsage(DynamicDrawUsage)
  buildings.frustumCulled = false
  scene.add(buildings)

  // --- the ship ------------------------------------------------------------
  const ship = new Group()
  // Low metalness on purpose. A metallic surface derives almost all of its
  // colour from reflected surroundings, and this scene has no environment map
  // to reflect — at metalness 0.86 the hull rendered as a black silhouette.
  // Keeping it mostly dielectric lets the directional light actually shade it.
  const hullMaterial = new MeshStandardMaterial({ color: 0xeef3f2, roughness: 0.36, metalness: 0.25 })
  const accentMaterial = new MeshStandardMaterial({
    color: 0x0d2b2f,
    emissive: 0x67e0c1,
    emissiveIntensity: 1.6,
    roughness: 0.3,
    metalness: 0.5,
  })
  const thrusterMaterial = new MeshStandardMaterial({
    color: 0x3a1508,
    emissive: 0xff8a4c,
    emissiveIntensity: 3,
    roughness: 0.4,
  })

  const hullGeometry = new BoxGeometry(1.24, 0.3, 2.3)
  const hull = new Mesh(hullGeometry, hullMaterial)
  hull.position.y = 0.42
  const noseGeometry = new ConeGeometry(0.52, 1.25, 4)
  const nose = new Mesh(noseGeometry, hullMaterial)
  nose.rotation.set(-Math.PI / 2, 0, Math.PI / 4)
  nose.position.set(0, 0.42, -1.6)
  const canopyGeometry = new SphereGeometry(0.42, 14, 10)
  const canopy = new Mesh(canopyGeometry, accentMaterial)
  canopy.scale.set(1, 0.62, 1.5)
  canopy.position.set(0, 0.62, -0.1)
  const podGeometry = new BoxGeometry(0.3, 0.26, 1.35)
  const podLeft = new Mesh(podGeometry, accentMaterial)
  podLeft.position.set(-0.82, 0.36, 0.2)
  const podRight = new Mesh(podGeometry, accentMaterial)
  podRight.position.set(0.82, 0.36, 0.2)
  const thrusterGeometry = new BoxGeometry(0.26, 0.2, 0.24)
  const thrusterLeft = new Mesh(thrusterGeometry, thrusterMaterial)
  thrusterLeft.position.set(-0.4, 0.42, 1.2)
  const thrusterRight = new Mesh(thrusterGeometry, thrusterMaterial)
  thrusterRight.position.set(0.4, 0.42, 1.2)

  for (const part of [hull, nose, canopy, podLeft, podRight, thrusterLeft, thrusterRight]) {
    part.castShadow = quality.shadows
    ship.add(part)
  }
  scene.add(ship)

  // --- engine trail --------------------------------------------------------
  const TRAIL_COUNT = quality.tier === 'low' ? 90 : 190
  const trailPositions = new Float32Array(TRAIL_COUNT * 3)
  const trailLife = new Float32Array(TRAIL_COUNT)
  const trailVelocity = new Float32Array(TRAIL_COUNT * 3)
  const trailGeometry = new BufferGeometry()
  const trailPositionAttribute = new BufferAttribute(trailPositions, 3)
  trailPositionAttribute.setUsage(DynamicDrawUsage)
  const trailLifeAttribute = new BufferAttribute(trailLife, 1)
  trailLifeAttribute.setUsage(DynamicDrawUsage)
  trailGeometry.setAttribute('position', trailPositionAttribute)
  trailGeometry.setAttribute('aLife', trailLifeAttribute)
  const trailMaterial = new ShaderMaterial({
    uniforms: { uPixelRatio: { value: 1 } },
    vertexShader: TRAIL_VERTEX,
    fragmentShader: TRAIL_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const trail = new Points(trailGeometry, trailMaterial)
  trail.frustumCulled = false
  scene.add(trail)
  let trailCursor = 0

  // --- starfield -----------------------------------------------------------
  const STAR_COUNT = quality.tier === 'low' ? 220 : 520
  const starPositions = new Float32Array(STAR_COUNT * 3)
  for (let i = 0; i < STAR_COUNT; i += 1) {
    starPositions[i * 3] = randomRange(-160, 160)
    starPositions[i * 3 + 1] = randomRange(12, 90)
    starPositions[i * 3 + 2] = randomRange(-300, 20)
  }
  const starGeometry = new BufferGeometry()
  starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  const starMaterial = new ShaderMaterial({
    uniforms: { uPixelRatio: { value: 1 } },
    vertexShader: `
      uniform float uPixelRatio;
      varying float vLife;
      void main() {
        vLife = 1.0;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.2 * uPixelRatio;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      precision mediump float;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * 0.75, smoothstep(0.5, 0.0, d) * 0.8);
      }
    `,
    transparent: true,
    depthWrite: false,
    // Stars sit behind the fog but must not be dimmed by it, or the sky goes
    // completely black and the horizon loses its edge.
    fog: false,
    blending: AdditiveBlending,
  })
  const stars = new Points(starGeometry, starMaterial)
  stars.frustumCulled = false
  scene.add(stars)

  // --- game state ----------------------------------------------------------
  const obstaclePool = []
  const orbPool = []
  const pylonPool = []
  const buildingPool = []

  const state = {
    running: false,
    over: false,
    speed: START_SPEED,
    distance: 0,
    orbsCollected: 0,
    lives: START_LIVES,
    x: 0,
    vx: 0,
    y: 0,
    vy: 0,
    airborne: false,
    invulnerable: 0,
    elapsed: 0,
    roadOffset: 0,
    shake: 0,
  }

  const input = { left: false, right: false, jump: false, brake: false }

  function resetPools() {
    obstaclePool.length = 0
    for (let i = 0; i < OBSTACLE_POOL; i += 1) {
      obstaclePool.push({ active: false, x: 0, z: 0, w: 1, h: 1, d: 1, spin: 0 })
      hide(obstacles, i)
    }
    orbPool.length = 0
    for (let i = 0; i < ORB_POOL; i += 1) {
      orbPool.push({ active: false, x: 0, z: 0, phase: 0 })
      hide(orbs, i)
    }
    pylonPool.length = 0
    for (let i = 0; i < PYLON_POOL; i += 1) {
      const side = i % 2 === 0 ? -1 : 1
      pylonPool.push({ x: side * (ROAD_HALF + 1.6), z: -((i / 2) | 0) * 11 - 6 })
    }
    buildingPool.length = 0
    for (let i = 0; i < BUILDING_POOL; i += 1) {
      const side = i % 2 === 0 ? -1 : 1
      buildingPool.push({
        x: side * randomRange(18, 52),
        z: -((i / 2) | 0) * 15 - 20,
        w: randomRange(4, 11),
        h: randomRange(8, 34),
      })
    }
    obstacles.instanceMatrix.needsUpdate = true
    orbs.instanceMatrix.needsUpdate = true
  }

  function reset() {
    state.running = false
    state.over = false
    state.speed = START_SPEED
    state.distance = 0
    state.orbsCollected = 0
    state.lives = START_LIVES
    state.x = 0
    state.vx = 0
    state.y = 0
    state.vy = 0
    state.airborne = false
    state.invulnerable = 0
    state.elapsed = 0
    state.shake = 0
    trailLife.fill(0)
    resetPools()
    pushHud(true)
  }

  // --- spawning ------------------------------------------------------------
  let spawnCooldown = 0
  let orbCooldown = 1.4

  function spawnObstacle() {
    const slot = obstaclePool.find((item) => !item.active)
    if (!slot) return
    // A tall block must be steered around; a low one can also be jumped. The
    // mix shifts toward tall as speed climbs, so late-game demands steering
    // rather than letting the player hold jump forever.
    const tallChance = 0.35 + (state.speed - START_SPEED) / (MAX_SPEED - START_SPEED) * 0.3
    const tall = Math.random() < tallChance
    slot.active = true
    slot.w = randomRange(1.1, 2.3)
    // Placed by its *edges*, so an obstacle can reach all the way to either
    // rail. Insetting the centre by a fixed margin instead left a safe lane
    // hard against each wall: parking on the rail survived a full minute with
    // a single hit, because nothing ever spawned far enough out to reach it.
    slot.x = randomRange(-ROAD_HALF + slot.w / 2, ROAD_HALF - slot.w / 2)
    slot.z = SPAWN_Z
    slot.h = tall ? randomRange(2.1, 3.1) : randomRange(0.55, 0.85)
    slot.d = randomRange(1.1, 2.0)
    slot.spin = randomRange(-0.6, 0.6)
  }

  function spawnOrb() {
    const slot = orbPool.find((item) => !item.active)
    if (!slot) return
    slot.active = true
    slot.x = randomRange(-ROAD_HALF + 1, ROAD_HALF - 1)
    slot.z = SPAWN_Z
    slot.phase = Math.random() * Math.PI * 2
  }

  // --- HUD -----------------------------------------------------------------
  // React never re-renders per frame. HUD numbers are pushed on a timer, and
  // only when a value the player can actually read has changed.
  let hudTimer = 0
  let lastHud = { score: -1, speed: -1, lives: -1, orbs: -1 }

  function currentScore() {
    return Math.floor(state.distance) + state.orbsCollected * ORB_SCORE
  }

  function pushHud(force) {
    const next = {
      score: currentScore(),
      speed: Math.round(state.speed * 3.6),
      lives: state.lives,
      orbs: state.orbsCollected,
    }
    if (
      !force &&
      next.score === lastHud.score &&
      next.speed === lastHud.speed &&
      next.lives === lastHud.lives &&
      next.orbs === lastHud.orbs
    ) {
      return
    }
    lastHud = next
    onHud?.(next)
  }

  // --- collision -----------------------------------------------------------
  const SHIP_HALF_W = 0.62
  const SHIP_HALF_D = 1.15
  const SHIP_HEIGHT = 0.72

  function handleCollisions() {
    for (let i = 0; i < obstaclePool.length; i += 1) {
      const item = obstaclePool[i]
      // Only things beside the ship can be hit; skip the rest before doing any
      // real work. At 44 obstacles this is the difference between 44 full
      // overlap tests per frame and about three.
      if (!item.active || item.z < -6 || item.z > 4) continue
      if (state.invulnerable > 0) continue
      const overlapX = Math.abs(item.x - state.x) < item.w / 2 + SHIP_HALF_W
      const overlapZ = Math.abs(item.z) < item.d / 2 + SHIP_HALF_D
      if (!overlapX || !overlapZ) continue
      // A jump only clears the block if the hull is genuinely above it.
      if (state.y > item.h) continue

      item.active = false
      hide(obstacles, i)
      state.lives -= 1
      state.invulnerable = INVULNERABLE_TIME
      state.speed = Math.max(START_SPEED, state.speed * 0.62)
      state.shake = 0.55
      onCrash?.()
      if (state.lives <= 0) {
        state.over = true
        state.running = false
        onGameOver?.({ score: currentScore(), distance: Math.floor(state.distance), orbs: state.orbsCollected })
      }
      pushHud(true)
      break
    }

    for (let i = 0; i < orbPool.length; i += 1) {
      const item = orbPool[i]
      if (!item.active || item.z < -5 || item.z > 4) continue
      if (Math.abs(item.x - state.x) > 1.35) continue
      if (Math.abs(item.z) > 1.7) continue
      if (Math.abs(state.y - 0.5) > 1.6) continue
      item.active = false
      hide(orbs, i)
      state.orbsCollected += 1
      onPickup?.()
    }
  }

  // --- per-frame update ----------------------------------------------------
  function update(dt) {
    state.elapsed += dt
    state.speed = Math.min(MAX_SPEED, state.speed + SPEED_RAMP * dt)
    const speed = input.brake ? state.speed * 0.55 : state.speed
    state.distance += speed * dt
    if (state.invulnerable > 0) state.invulnerable = Math.max(0, state.invulnerable - dt)
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 1.6)

    // Steering: acceleration plus damping rather than direct positioning, so
    // the craft carries momentum and the camera has something to bank against.
    const steer = (input.left ? -1 : 0) + (input.right ? 1 : 0)
    state.vx += steer * STEER_ACCEL * dt
    state.vx -= state.vx * Math.min(1, STEER_DAMP * dt)
    state.vx = Math.max(-MAX_STEER, Math.min(MAX_STEER, state.vx))
    state.x += state.vx * dt
    if (state.x < -ROAD_HALF) {
      state.x = -ROAD_HALF
      state.vx *= -0.28
    } else if (state.x > ROAD_HALF) {
      state.x = ROAD_HALF
      state.vx *= -0.28
    }

    // Jump
    if (input.jump && !state.airborne) {
      state.airborne = true
      state.vy = JUMP_VELOCITY
    }
    if (state.airborne) {
      state.vy += GRAVITY * dt
      state.y += state.vy * dt
      if (state.y <= 0) {
        state.y = 0
        state.vy = 0
        state.airborne = false
      }
    }

    // Scroll the world
    const travel = speed * dt
    state.roadOffset += travel * 0.0132
    roadTexture.offset.y = -state.roadOffset

    spawnCooldown -= dt
    orbCooldown -= dt
    if (spawnCooldown <= 0) {
      spawnObstacle()
      // Spacing is expressed in *metres of track*, not seconds, and converted
      // to a delay using the current speed. Holding the gap constant in time
      // would make the course thin out as it accelerated; holding it constant
      // in distance keeps the density the player sees identical at 30 u/s and
      // at 78, so the difficulty comes from reaction time rather than from the
      // track quietly emptying out.
      spawnCooldown = randomRange(26, 58) / speed
    }
    if (orbCooldown <= 0) {
      spawnOrb()
      orbCooldown = randomRange(22, 46) / speed
    }

    // Obstacles
    for (let i = 0; i < obstaclePool.length; i += 1) {
      const item = obstaclePool[i]
      if (!item.active) continue
      item.z += travel
      if (item.z > DESPAWN_Z) {
        item.active = false
        hide(obstacles, i)
        continue
      }
      quaternion.setFromAxisAngle(UP, item.spin * state.elapsed * 0.35)
      matrix.compose(
        position.set(item.x, item.h / 2, item.z),
        quaternion,
        scale.set(item.w, item.h, item.d),
      )
      obstacles.setMatrixAt(i, matrix)
    }
    obstacles.instanceMatrix.needsUpdate = true

    // Orbs
    for (let i = 0; i < orbPool.length; i += 1) {
      const item = orbPool[i]
      if (!item.active) continue
      item.z += travel
      if (item.z > DESPAWN_Z) {
        item.active = false
        hide(orbs, i)
        continue
      }
      const bob = 0.95 + Math.sin(state.elapsed * 3 + item.phase) * 0.22
      quaternion.setFromAxisAngle(UP, state.elapsed * 2.2 + item.phase)
      matrix.compose(position.set(item.x, bob, item.z), quaternion, scale.set(1, 1, 1))
      orbs.setMatrixAt(i, matrix)
    }
    orbs.instanceMatrix.needsUpdate = true

    // Pylons and skyline recycle on a fixed pitch — no pooling logic needed
    // because they never despawn, they just wrap.
    for (let i = 0; i < pylonPool.length; i += 1) {
      const item = pylonPool[i]
      item.z += travel
      if (item.z > DESPAWN_Z) item.z -= (PYLON_POOL / 2) * 11
      matrix.compose(position.set(item.x, 2.6, item.z), IDENTITY_QUAT, scale.set(1, 1, 1))
      pylons.setMatrixAt(i, matrix)
    }
    pylons.instanceMatrix.needsUpdate = true

    for (let i = 0; i < buildingPool.length; i += 1) {
      const item = buildingPool[i]
      item.z += travel * 0.82 // slight parallax against the road
      if (item.z > DESPAWN_Z) {
        item.z -= (BUILDING_POOL / 2) * 15
        item.h = randomRange(8, 34)
        item.w = randomRange(4, 11)
      }
      matrix.compose(position.set(item.x, item.h / 2, item.z), IDENTITY_QUAT, scale.set(item.w, item.h, item.w))
      buildings.setMatrixAt(i, matrix)
    }
    buildings.instanceMatrix.needsUpdate = true

    handleCollisions()

    // Ship transform: bank into the turn, pitch with vertical velocity.
    ship.position.set(state.x, state.y, 0)
    ship.rotation.z = -state.vx * 0.045
    ship.rotation.x = -state.vy * 0.012
    ship.visible = state.invulnerable <= 0 || Math.floor(state.elapsed * 14) % 2 === 0

    // Engine trail — emit from the thrusters, drift backwards.
    const emit = quality.tier === 'low' ? 1 : 2
    for (let n = 0; n < emit; n += 1) {
      const index = trailCursor % TRAIL_COUNT
      trailCursor += 1
      trailPositions[index * 3] = state.x + (n === 0 ? -0.4 : 0.4)
      trailPositions[index * 3 + 1] = state.y + 0.42
      trailPositions[index * 3 + 2] = 1.3
      trailVelocity[index * 3] = randomRange(-1.2, 1.2)
      trailVelocity[index * 3 + 1] = randomRange(0.4, 1.8)
      trailVelocity[index * 3 + 2] = randomRange(9, 15)
      trailLife[index] = 1
    }
    for (let i = 0; i < TRAIL_COUNT; i += 1) {
      if (trailLife[i] <= 0) continue
      trailLife[i] = Math.max(0, trailLife[i] - dt * 1.9)
      trailPositions[i * 3] += trailVelocity[i * 3] * dt
      trailPositions[i * 3 + 1] += trailVelocity[i * 3 + 1] * dt
      trailPositions[i * 3 + 2] += trailVelocity[i * 3 + 2] * dt
    }
    trailPositionAttribute.needsUpdate = true
    trailLifeAttribute.needsUpdate = true

    // Chase camera: lag behind the ship laterally, widen the field of view
    // with speed, and roll slightly into the turn. The lag is what makes the
    // craft feel like it has mass.
    const speedRatio = (state.speed - START_SPEED) / (MAX_SPEED - START_SPEED)
    const targetFov = 64 + speedRatio * 16
    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 2.4)
    const shakeX = state.shake > 0 ? randomRange(-state.shake, state.shake) * 0.6 : 0
    const shakeY = state.shake > 0 ? randomRange(-state.shake, state.shake) * 0.4 : 0
    camera.position.x += (state.x * 0.55 + shakeX - camera.position.x) * Math.min(1, dt * 4.2)
    camera.position.y += (4.6 + state.y * 0.55 + shakeY - camera.position.y) * Math.min(1, dt * 5)
    camera.rotation.z += (-state.vx * 0.012 - camera.rotation.z) * Math.min(1, dt * 3)
    camera.updateProjectionMatrix()
    LOOK_AT.set(state.x * 0.35, 1.4 + state.y * 0.4, -18)
    const roll = camera.rotation.z
    camera.lookAt(LOOK_AT)
    camera.rotation.z = roll // lookAt clears roll; reapply the bank

    // Keep the shadow frustum glued to the ship, otherwise the small camera
    // slides off it and every shadow vanishes.
    sun.position.set(state.x + 8, 20, -2)
    sun.target.position.set(state.x, 0, -2)
    sun.target.updateMatrixWorld()

    rimLeft.position.set(state.x - 4.5, 2.2, 1)
    rimRight.position.set(state.x + 4.5, 2.2, -2)

    hudTimer += dt
    if (hudTimer > 0.1) {
      hudTimer = 0
      pushHud(false)
    }
  }

  // --- loop ----------------------------------------------------------------
  let frame = null
  let last = 0

  function tick(now) {
    frame = null
    // Clamped so a backgrounded tab or a long GC pause cannot teleport the
    // world forward and drop the player into an obstacle they never saw.
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
    last = now
    if (state.running) update(dt)
    renderer.render(scene, camera)
    if (state.running) frame = requestAnimationFrame(tick)
  }

  function start() {
    if (state.running) return
    reset()
    state.running = true
    last = 0
    frame = requestAnimationFrame(tick)
  }

  function resume() {
    if (state.running || state.over) return
    state.running = true
    last = 0
    frame = requestAnimationFrame(tick)
  }

  function pause() {
    state.running = false
    if (frame !== null) {
      cancelAnimationFrame(frame)
      frame = null
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.dpr)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(rect.width, rect.height, false)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    trailMaterial.uniforms.uPixelRatio.value = pixelRatio
    starMaterial.uniforms.uPixelRatio.value = pixelRatio
    renderer.render(scene, camera)
  }

  const handleContextLost = (event) => {
    event.preventDefault()
    pause()
  }
  canvas.addEventListener('webglcontextlost', handleContextLost)

  reset()
  resize()

  return {
    start,
    pause,
    resume,
    resize,
    // Advance the simulation by an exact timestep and draw one frame, without
    // involving requestAnimationFrame. This is what makes the game testable:
    // physics, spawning, collision and scoring can all be driven at a fixed dt
    // and asserted on, instead of being eyeballed against a live loop.
    step: (dt = 1 / 60) => {
      update(dt)
      renderer.render(scene, camera)
    },
    setInput: (key, value) => { input[key] = value },
    getState: () => ({ ...state, score: currentScore() }),
    quality,
    dispose: () => {
      pause()
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
      })
      for (const material of [
        roadMaterial, railMaterial, obstacleMaterial, orbMaterial, pylonMaterial,
        buildingMaterial, hullMaterial, accentMaterial, thrusterMaterial,
        trailMaterial, starMaterial,
      ]) {
        material.dispose()
      }
      roadTexture.dispose()
      renderer.dispose()
      renderer.forceContextLoss?.()
    },
  }
}
