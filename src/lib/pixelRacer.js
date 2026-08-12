// ============================================================================
// Pixel Racer — 3D circuit engine.
//
// Replaces the original top-down 2D version, which drew the track with
// ctx.ellipse() and parked a Three.js starfield behind it. This is a real
// circuit: a procedurally generated closed course with varying curvature,
// built as an actual road mesh, raced by a kinematic car model against three
// AI opponents, under a directional light casting shadows.
//
// Same architecture as the Neon Circuit engine: raw three.js, no reconciler in
// the frame loop, pre-allocated scratch objects, and a step(dt) entry point so
// physics, lap detection and AI can be driven at a fixed timestep in tests
// rather than eyeballed against a live loop.
//
// The gameplay contract from the 2D version is preserved exactly — three laps,
// AI rivals, collectable skill badges that grant a boost, and a best-lap time
// in milliseconds — because the arcade lobby, the leaderboard and the stored
// `arcade_best_racing` key all depend on it.
// ============================================================================
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
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
  Points,
  Quaternion,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'

export const LAPS_TO_WIN = 3

// --- track shape -----------------------------------------------------------
const SAMPLES = 480
const BASE_RADIUS = 128
const ROAD_HALF_WIDTH = 9.5

// --- car handling ----------------------------------------------------------
const TOP_SPEED = 46
const AI_TOP_SPEED = 42.5
const BOOST_MULTIPLIER = 1.28
const ACCEL = 27
const BRAKE = 46
const REVERSE_SPEED = -12
const ROAD_DRAG = 0.55
const GRASS_DRAG = 5.4
const GRASS_SPEED_CAP = 17
const STEER_RATE = 2.05
// Cross-track gain for the AI's Stanley steering controller.
const STANLEY_GAIN = 2.6
const BOOST_MS = 3200

const randomRange = (min, max) => min + Math.random() * (max - min)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * Build a closed circuit centreline.
 *
 * The radius is modulated by a few harmonics of the angle, which produces a
 * course with real corners of differing severity — long sweepers and tight
 * hairpins — instead of the perfect oval the 2D version used. Fixed
 * coefficients rather than random ones: a track people can learn is far more
 * satisfying to lap than a different one every session.
 */
function buildTrack() {
  const points = []
  for (let i = 0; i < SAMPLES; i += 1) {
    const t = (i / SAMPLES) * Math.PI * 2
    const radius = BASE_RADIUS * (1 + 0.2 * Math.sin(2 * t) + 0.12 * Math.sin(3 * t + 1.1) - 0.06 * Math.cos(5 * t))
    points.push({ x: Math.cos(t) * radius, z: Math.sin(t) * radius })
  }

  // Tangents from neighbouring samples, normals as the tangent rotated 90°.
  // Both are needed to lay the road ribbon and to measure how far off-course a
  // car is.
  let length = 0
  for (let i = 0; i < SAMPLES; i += 1) {
    const previous = points[(i - 1 + SAMPLES) % SAMPLES]
    const next = points[(i + 1) % SAMPLES]
    const tx = next.x - previous.x
    const tz = next.z - previous.z
    const magnitude = Math.hypot(tx, tz) || 1
    points[i].tx = tx / magnitude
    points[i].tz = tz / magnitude
    points[i].nx = -points[i].tz
    points[i].nz = points[i].tx
    points[i].s = length
    length += Math.hypot(points[(i + 1) % SAMPLES].x - points[i].x, points[(i + 1) % SAMPLES].z - points[i].z)
  }

  // Curvature per sample, used by the AI to decide how hard to brake before a
  // corner. Measured as the heading change between adjacent tangents.
  for (let i = 0; i < SAMPLES; i += 1) {
    const next = points[(i + 1) % SAMPLES]
    const dot = clamp(points[i].tx * next.tx + points[i].tz * next.tz, -1, 1)
    points[i].curvature = Math.acos(dot)
  }

  return { points, length }
}

function makeRoadTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#171b26'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  for (let i = 0; i < 500; i += 1) ctx.fillRect((i * 79) % size, (i * 53) % size, 2, 2)
  // Centre dashes. u runs across the road, so the dash sits at u = 0.5.
  ctx.fillStyle = 'rgba(245,242,233,0.35)'
  ctx.fillRect(size / 2 - 2, 0, 4, size * 0.45)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.anisotropy = 4
  return texture
}

function makeKerbTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ff5470'
  ctx.fillRect(0, 0, 8, 4)
  ctx.fillStyle = '#f5f2e9'
  ctx.fillRect(0, 4, 8, 4)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

/** Lay a flat ribbon between two offsets either side of the centreline. */
function buildRibbon(points, totalLength, innerOffset, outerOffset, y, repeatAlong) {
  const vertexCount = SAMPLES * 2 + 2
  const positions = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const normals = new Float32Array(vertexCount * 3)

  for (let i = 0; i <= SAMPLES; i += 1) {
    const point = points[i % SAMPLES]
    const base = i * 6
    positions[base] = point.x + point.nx * innerOffset
    positions[base + 1] = y
    positions[base + 2] = point.z + point.nz * innerOffset
    positions[base + 3] = point.x + point.nx * outerOffset
    positions[base + 4] = y
    positions[base + 5] = point.z + point.nz * outerOffset

    // The closing vertex duplicates sample 0 positionally but must continue
    // the arc-length coordinate, otherwise the texture wraps back to 0 and
    // the final segment shows a compressed band of stripes.
    const v = (i === SAMPLES ? totalLength : point.s) / repeatAlong
    uvs[i * 4] = 0
    uvs[i * 4 + 1] = v
    uvs[i * 4 + 2] = 1
    uvs[i * 4 + 3] = v

    for (let n = 0; n < 2; n += 1) {
      normals[base + n * 3] = 0
      normals[base + n * 3 + 1] = 1
      normals[base + n * 3 + 2] = 0
    }
  }

  const indices = []
  for (let i = 0; i < SAMPLES; i += 1) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setIndex(indices)
  return geometry
}

function buildCarMesh(bodyColor, accentColor, castShadow) {
  const car = new Group()
  const body = new Mesh(
    new BoxGeometry(2.0, 0.55, 3.6),
    new MeshStandardMaterial({ color: bodyColor, roughness: 0.42, metalness: 0.2 }),
  )
  body.position.y = 0.62
  const cabin = new Mesh(
    new BoxGeometry(1.35, 0.5, 1.5),
    new MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.5, roughness: 0.3 }),
  )
  cabin.position.set(0, 1.08, -0.2)
  const wing = new Mesh(
    new BoxGeometry(2.1, 0.12, 0.5),
    new MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.8, roughness: 0.4 }),
  )
  wing.position.set(0, 1.05, 1.7)

  const wheelGeometry = new CylinderGeometry(0.46, 0.46, 0.38, 12)
  const wheelMaterial = new MeshStandardMaterial({ color: 0x14161f, roughness: 0.85 })
  for (const [wx, wz] of [[-1.0, -1.2], [1.0, -1.2], [-1.0, 1.3], [1.0, 1.3]]) {
    const wheel = new Mesh(wheelGeometry, wheelMaterial)
    // Cylinders are built along Y; rotate onto the X axis so they roll.
    wheel.rotation.z = Math.PI / 2
    wheel.position.set(wx, 0.46, wz)
    wheel.castShadow = castShadow
    car.add(wheel)
  }

  for (const part of [body, cabin, wing]) {
    part.castShadow = castShadow
    car.add(part)
  }
  return car
}

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

export function createPixelRacer(canvas, options = {}) {
  const {
    skills = [],
    onHud,
    onFinish,
    onLap,
    onPickup,
    quality = detectQuality(),
  } = options

  let renderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: quality.tier === 'high', powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setClearColor(0x05070f, 1)
  if (quality.shadows) {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
  }

  const scene = new Scene()
  scene.fog = new FogExp2(0x05070f, 0.0042)
  const camera = new PerspectiveCamera(62, 1, 0.5, 700)

  scene.add(new HemisphereLight(0x33406e, 0x05070f, 0.42))
  const sun = new DirectionalLight(0xffffff, 1.5)
  sun.position.set(40, 60, 20)
  if (quality.shadows) {
    sun.castShadow = true
    sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize)
    const s = sun.shadow.camera
    s.left = -34; s.right = 34; s.top = 34; s.bottom = -34; s.near = 1; s.far = 160
    s.updateProjectionMatrix()
    sun.shadow.bias = -0.0011
    sun.shadow.normalBias = 0.03
  }
  scene.add(sun)
  scene.add(sun.target)

  // --- track ---------------------------------------------------------------
  const track = buildTrack()
  const { points } = track

  const roadTexture = makeRoadTexture()
  roadTexture.repeat.set(1, 1)
  const roadMaterial = new MeshStandardMaterial({ map: roadTexture, roughness: 0.7, metalness: 0.06, side: DoubleSide })
  const road = new Mesh(buildRibbon(points, track.length, -ROAD_HALF_WIDTH, ROAD_HALF_WIDTH, 0, 9), roadMaterial)
  road.receiveShadow = quality.shadows
  scene.add(road)

  const kerbTexture = makeKerbTexture()
  const kerbMaterial = new MeshStandardMaterial({
    map: kerbTexture,
    emissiveMap: kerbTexture,
    emissive: 0xffffff,
    emissiveIntensity: 0.55,
    roughness: 0.5,
    side: DoubleSide,
  })
  const kerbLeft = new Mesh(buildRibbon(points, track.length, ROAD_HALF_WIDTH, ROAD_HALF_WIDTH + 1.5, 0.03, 4), kerbMaterial)
  const kerbRight = new Mesh(buildRibbon(points, track.length, -ROAD_HALF_WIDTH - 1.5, -ROAD_HALF_WIDTH, 0.03, 4), kerbMaterial)
  scene.add(kerbLeft)
  scene.add(kerbRight)

  // Ground plane well below the kerbs so leaving the track reads as leaving a
  // raised circuit rather than driving onto nothing.
  const groundMaterial = new MeshStandardMaterial({ color: 0x0a1420, roughness: 1, side: DoubleSide })
  const ground = new Mesh(buildRibbon(points, track.length, -ROAD_HALF_WIDTH - 70, ROAD_HALF_WIDTH + 70, -0.35, 40), groundMaterial)
  ground.receiveShadow = quality.shadows
  scene.add(ground)

  // Start/finish gantry line across the road at sample 0.
  const startLine = new Mesh(
    new BoxGeometry(ROAD_HALF_WIDTH * 2, 0.04, 1.6),
    new MeshStandardMaterial({ color: 0xf5f2e9, emissive: 0xf5f2e9, emissiveIntensity: 0.5, roughness: 0.4 }),
  )
  startLine.position.set(points[0].x, 0.05, points[0].z)
  startLine.rotation.y = Math.atan2(points[0].tx, points[0].tz)
  scene.add(startLine)

  // Barrier posts, instanced. One draw call for the whole circuit.
  const POST_STRIDE = 6
  const postCount = Math.floor(SAMPLES / POST_STRIDE) * 2
  const posts = new InstancedMesh(
    new BoxGeometry(0.4, 2.2, 0.4),
    new MeshStandardMaterial({ color: 0x101a2e, emissive: 0x3f7bff, emissiveIntensity: 1.1, roughness: 0.5 }),
    postCount,
  )
  posts.frustumCulled = false
  scene.add(posts)

  // --- scratch objects (allocated once) ------------------------------------
  const matrix = new Matrix4()
  const vector = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3(1, 1, 1)
  const IDENTITY_QUAT = new Quaternion()
  const cameraTarget = new Vector3()
  const UP = new Vector3(0, 1, 0)

  let postIndex = 0
  for (let i = 0; i < SAMPLES; i += POST_STRIDE) {
    for (const side of [1, -1]) {
      const point = points[i]
      const offset = side * (ROAD_HALF_WIDTH + 2.4)
      matrix.compose(
        vector.set(point.x + point.nx * offset, 1.1, point.z + point.nz * offset),
        IDENTITY_QUAT,
        scale.set(1, 1, 1),
      )
      posts.setMatrixAt(postIndex, matrix)
      postIndex += 1
    }
  }
  posts.instanceMatrix.needsUpdate = true

  // --- skill badges --------------------------------------------------------
  const badgeMaterial = new MeshStandardMaterial({
    color: 0x0b3f38,
    emissive: 0x8ff0d8,
    emissiveIntensity: 2,
    roughness: 0.25,
  })
  const badgeCount = Math.max(1, skills.length)
  const badges = new InstancedMesh(new IcosahedronGeometry(0.85, 0), badgeMaterial, badgeCount)
  badges.instanceMatrix.setUsage(DynamicDrawUsage)
  badges.frustumCulled = false
  scene.add(badges)

  const badgeState = skills.map((name, index) => {
    // Spread evenly around the circuit, alternating side of the racing line so
    // collecting them all actually requires moving across the road.
    const sample = Math.floor(((index + 0.5) / badgeCount) * SAMPLES) % SAMPLES
    const point = points[sample]
    const offset = (index % 2 === 0 ? 1 : -1) * ROAD_HALF_WIDTH * 0.45
    return {
      name,
      sample,
      x: point.x + point.nx * offset,
      z: point.z + point.nz * offset,
      collected: false,
    }
  })

  // --- stars ---------------------------------------------------------------
  const STAR_COUNT = quality.tier === 'low' ? 260 : 620
  const starPositions = new Float32Array(STAR_COUNT * 3)
  for (let i = 0; i < STAR_COUNT; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = randomRange(180, 420)
    starPositions[i * 3] = Math.cos(angle) * radius
    starPositions[i * 3 + 1] = randomRange(30, 220)
    starPositions[i * 3 + 2] = Math.sin(angle) * radius
  }
  const starGeometry = new BufferGeometry()
  starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  const starMaterial = new ShaderMaterial({
    uniforms: { uPixelRatio: { value: 1 } },
    vertexShader: `
      uniform float uPixelRatio;
      void main() {
        gl_PointSize = 2.0 * uPixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(vec3(0.78, 0.86, 1.0) * 0.8, smoothstep(0.5, 0.0, d) * 0.85);
      }
    `,
    transparent: true,
    depthWrite: false,
    fog: false,
    blending: AdditiveBlending,
  })
  const stars = new Points(starGeometry, starMaterial)
  stars.frustumCulled = false
  scene.add(stars)

  // --- cars ----------------------------------------------------------------
  const AI_COLORS = [
    [0xff6b6b, 0xffb3b3],
    [0xffd166, 0xfff0c2],
    [0xb388ff, 0xe2d4ff],
  ]

  function makeCar(index) {
    const isPlayer = index === 0
    const [bodyColor, accentColor] = isPlayer ? [0x67e0c1, 0xffffff] : AI_COLORS[(index - 1) % AI_COLORS.length]
    const mesh = buildCarMesh(bodyColor, accentColor, quality.shadows)
    scene.add(mesh)
    return {
      mesh,
      isPlayer,
      x: 0,
      z: 0,
      heading: 0,
      speed: 0,
      sample: 0,
      lap: 0,
      finished: false,
      halfway: false,
      offTrack: false,
      topSpeed: isPlayer ? TOP_SPEED : AI_TOP_SPEED * randomRange(0.96, 1.03),
      lane: isPlayer ? 0 : randomRange(-0.5, 0.5),
    }
  }

  const cars = [makeCar(0), makeCar(1), makeCar(2), makeCar(3)]
  const player = cars[0]

  // --- state ---------------------------------------------------------------
  const state = {
    running: false,
    finished: false,
    elapsedMs: 0,
    lapStartMs: 0,
    bestLapMs: 0,
    lastLapMs: 0,
    boostUntilMs: 0,
    collected: 0,
    position: 1,
  }

  const input = { throttle: false, brake: false, left: false, right: false }

  function placeOnGrid() {
    cars.forEach((car, index) => {
      // Stagger the grid backwards from the line, alternating sides.
      const sample = (SAMPLES - index * 5) % SAMPLES
      const point = points[sample]
      const offset = (index % 2 === 0 ? 1 : -1) * 3.2
      car.x = point.x + point.nx * offset
      car.z = point.z + point.nz * offset
      car.heading = Math.atan2(point.tx, point.tz)
      car.speed = 0
      car.sample = sample
      car.lap = 0
      car.finished = false
      car.halfway = false
      car.offTrack = false
    })
  }

  function reset() {
    state.running = false
    state.finished = false
    state.elapsedMs = 0
    state.lapStartMs = 0
    state.bestLapMs = 0
    state.lastLapMs = 0
    state.boostUntilMs = 0
    state.collected = 0
    state.position = 1
    badgeState.forEach((badge) => { badge.collected = false })
    placeOnGrid()
    updateBadgeInstances(0)
    syncCarMeshes()
    updateCamera(1)
  }

  /**
   * Nearest centreline sample, searched locally around the car's last known
   * position. A full scan of 480 samples for each of four cars every frame is
   * ~2000 distance tests; the window makes it ~50, and the car cannot move far
   * enough in one frame to escape it.
   */
  function nearestSample(car) {
    let bestIndex = car.sample
    let bestDistance = Infinity
    for (let offset = -12; offset <= 24; offset += 1) {
      const index = (car.sample + offset + SAMPLES) % SAMPLES
      const point = points[index]
      const dx = car.x - point.x
      const dz = car.z - point.z
      const distance = dx * dx + dz * dz
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    }
    return bestIndex
  }

  function lateralOffset(car, sample) {
    const point = points[sample]
    return (car.x - point.x) * point.nx + (car.z - point.z) * point.nz
  }

  function stepCar(car, dt, ms) {
    if (car.finished) {
      car.speed = Math.max(0, car.speed - BRAKE * dt)
    } else if (car.isPlayer) {
      if (input.throttle) car.speed += ACCEL * dt
      if (input.brake) car.speed -= BRAKE * dt
      if (!input.throttle && !input.brake) car.speed -= ROAD_DRAG * 2 * dt
    } else {
      // AI steering: a Stanley controller — correct the heading against the
      // track tangent, plus a term that pulls the car back onto its line.
      //
      // Pure pursuit (aim at a point N samples ahead) was tried first and is a
      // trap on a closed circuit: a short lookahead runs wide at the hairpins,
      // a long one cuts the corner, and every car ended up in the grass at
      // 4.6 m/s — the equilibrium of full throttle against grass drag. Stanley
      // has no lookahead to mistune. The cross-track term is divided by speed,
      // so corrections are gentle at pace and firm when crawling back on.
      const anchor = points[car.sample]
      const trackHeading = Math.atan2(anchor.tx, anchor.tz)
      let headingError = trackHeading - car.heading
      while (headingError > Math.PI) headingError -= Math.PI * 2
      while (headingError < -Math.PI) headingError += Math.PI * 2

      // Off the road, abandon the racing-line offset and aim for the centre.
      const lane = car.offTrack ? 0 : car.lane
      const lateralError = lateralOffset(car, car.sample) - lane * ROAD_HALF_WIDTH
      const crossTrack = Math.atan2(STANLEY_GAIN * lateralError, Math.max(8, Math.abs(car.speed)))
      car.heading += clamp(headingError + crossTrack, -STEER_RATE * dt, STEER_RATE * dt)

      // No corner-speed limiter. The circuit's tightest radius is 37.5 m,
      // which at this steering rate is holdable up to ~77 m/s — comfortably
      // above the 42.5 top speed, so every corner is flat out. An earlier
      // curvature-based limiter was capping the field at roughly half pace to
      // solve a problem the geometry does not have; the spread between rivals
      // comes from their per-car top speed instead.
      car.speed += ACCEL * dt
    }

    const boosting = car.isPlayer && ms < state.boostUntilMs
    const ceiling = (car.offTrack ? GRASS_SPEED_CAP : car.topSpeed) * (boosting ? BOOST_MULTIPLIER : 1)
    car.speed = clamp(car.speed, REVERSE_SPEED, ceiling)
    car.speed -= car.speed * (car.offTrack ? GRASS_DRAG : ROAD_DRAG) * dt

    if (car.isPlayer) {
      // Steering authority scales with speed: a stationary car cannot pivot on
      // the spot, which is what stops the controls feeling like a cursor.
      const grip = clamp(Math.abs(car.speed) / 12, 0, 1)
      const steer = (input.left ? 1 : 0) - (input.right ? 1 : 0)
      car.heading += steer * STEER_RATE * grip * dt * Math.sign(car.speed || 1)
    }

    car.x += Math.sin(car.heading) * car.speed * dt
    car.z += Math.cos(car.heading) * car.speed * dt

    const previousSample = car.sample
    car.sample = nearestSample(car)
    car.offTrack = Math.abs(lateralOffset(car, car.sample)) > ROAD_HALF_WIDTH

    // Lap counting. Requires having reached the far side of the circuit before
    // a wrap counts, so nudging back and forth over the line does nothing.
    if (car.sample > SAMPLES * 0.45 && car.sample < SAMPLES * 0.6) car.halfway = true
    const wrapped = previousSample > SAMPLES * 0.85 && car.sample < SAMPLES * 0.15
    if (wrapped && car.halfway && !car.finished) {
      car.halfway = false
      car.lap += 1
      if (car.isPlayer) {
        const lapTime = ms - state.lapStartMs
        state.lastLapMs = lapTime
        if (state.bestLapMs === 0 || lapTime < state.bestLapMs) state.bestLapMs = lapTime
        state.lapStartMs = ms
        onLap?.({ lap: car.lap, lapMs: lapTime, bestMs: state.bestLapMs })
      }
      if (car.lap >= LAPS_TO_WIN) car.finished = true
    }
  }

  function updateBadgeInstances(ms) {
    for (let i = 0; i < badgeState.length; i += 1) {
      const badge = badgeState[i]
      if (badge.collected) {
        matrix.compose(vector.set(0, -999, 0), IDENTITY_QUAT, scale.set(0.0001, 0.0001, 0.0001))
      } else {
        quaternion.setFromAxisAngle(UP, ms * 0.002 + i)
        matrix.compose(
          vector.set(badge.x, 1.5 + Math.sin(ms * 0.003 + i) * 0.3, badge.z),
          quaternion,
          scale.set(1, 1, 1),
        )
      }
      badges.setMatrixAt(i, matrix)
    }
    badges.instanceMatrix.needsUpdate = true
  }

  function syncCarMeshes() {
    for (const car of cars) {
      car.mesh.position.set(car.x, 0, car.z)
      car.mesh.rotation.y = car.heading
    }
  }

  function updateCamera(blend) {
    // Chase camera in the car's own frame: behind and above, looking at a
    // point ahead of the nose so corners open up before they arrive.
    const back = 13.5
    const height = 6.2
    const targetX = player.x - Math.sin(player.heading) * back
    const targetZ = player.z - Math.cos(player.heading) * back
    camera.position.x += (targetX - camera.position.x) * blend
    camera.position.y += (height - camera.position.y) * blend
    camera.position.z += (targetZ - camera.position.z) * blend
    cameraTarget.set(
      player.x + Math.sin(player.heading) * 12,
      1.6,
      player.z + Math.cos(player.heading) * 12,
    )
    camera.lookAt(cameraTarget)
  }

  // --- HUD throttling ------------------------------------------------------
  let hudTimer = 0
  function pushHud() {
    onHud?.({
      lap: Math.min(player.lap + 1, LAPS_TO_WIN),
      timeMs: state.elapsedMs,
      lastLapMs: state.lastLapMs,
      bestLapMs: state.bestLapMs,
      speed: Math.round(Math.abs(player.speed) * 3.6),
      boost: state.elapsedMs < state.boostUntilMs,
      offTrack: player.offTrack,
      position: state.position,
      collected: state.collected,
      total: badgeState.length,
    })
  }

  function update(dt) {
    state.elapsedMs += dt * 1000
    const ms = state.elapsedMs

    for (const car of cars) stepCar(car, dt, ms)

    // Badge pickup — player only.
    for (const badge of badgeState) {
      if (badge.collected) continue
      const dx = badge.x - player.x
      const dz = badge.z - player.z
      if (dx * dx + dz * dz > 12) continue
      badge.collected = true
      state.collected += 1
      onPickup?.(badge.name)
      if (state.collected === badgeState.length) state.boostUntilMs = ms + BOOST_MS
    }
    updateBadgeInstances(ms)

    // Race position: laps first, then progress around the current lap.
    const ranking = cars
      .map((car) => ({ car, progress: car.lap * SAMPLES + car.sample }))
      .sort((a, b) => b.progress - a.progress)
    state.position = ranking.findIndex((entry) => entry.car.isPlayer) + 1

    syncCarMeshes()
    updateCamera(Math.min(1, dt * 5.5))

    sun.position.set(player.x + 40, 60, player.z + 20)
    sun.target.position.set(player.x, 0, player.z)
    sun.target.updateMatrixWorld()

    if (player.finished && !state.finished) {
      state.finished = true
      state.running = false
      onFinish?.({
        position: state.position,
        totalMs: Math.round(ms),
        bestLapMs: Math.round(state.bestLapMs || ms / LAPS_TO_WIN),
        collected: state.collected,
        total: badgeState.length,
      })
    }

    hudTimer += dt
    if (hudTimer > 0.1) {
      hudTimer = 0
      pushHud()
    }
  }

  // --- loop ----------------------------------------------------------------
  let frame = null
  let last = 0

  function tick(now) {
    frame = null
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

  function pause() {
    state.running = false
    if (frame !== null) {
      cancelAnimationFrame(frame)
      frame = null
    }
  }

  function resume() {
    if (state.running || state.finished) return
    state.running = true
    last = 0
    frame = requestAnimationFrame(tick)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.dpr)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(rect.width, rect.height, false)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
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
    step: (dt = 1 / 60) => {
      update(dt)
      renderer.render(scene, camera)
    },
    setInput: (key, value) => { input[key] = value },
    getState: () => ({
      ...state,
      lap: player.lap,
      sample: player.sample,
      speed: player.speed,
      offTrack: player.offTrack,
      x: player.x,
      z: player.z,
      standings: cars.map((car) => ({
        isPlayer: car.isPlayer,
        lap: car.lap,
        sample: car.sample,
        finished: car.finished,
        // Included so AI behaviour is measurable, not inferred: an opponent
        // that quietly spends the race in the gravel is invisible otherwise.
        speed: car.speed,
        offTrack: car.offTrack,
      })),
    }),
    quality,
    trackLength: track.length,
    dispose: () => {
      pause()
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          for (const material of materials) material.dispose()
        }
      })
      roadTexture.dispose()
      kerbTexture.dispose()
      starMaterial.dispose()
      renderer.dispose()
      renderer.forceContextLoss?.()
    },
  }
}
