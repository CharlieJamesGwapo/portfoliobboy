// ============================================================================
// heroWebgl — the Three.js upgrade for the hero graphic.
//
// This module is *only* ever reached through a dynamic import, and only after
// the 2D canvas has already painted (see HeroSystemsScene.jsx). Three.js never
// touches the landing page's critical path, so the LCP stays where it was when
// the hero was 2D-only, and the WebGL scene fades in on top a moment later.
//
// Named imports (not `import * as THREE`) so Rollup can tree-shake the
// three-quarters of Three.js this scene doesn't use — loaders, controls,
// post-processing, the whole animation system.
//
// The projection maths is deliberately the same shape as hero2d.js: the same
// yaw/pitch drive both renderers, so the crossfade between them is a dissolve
// between two views of one graph rather than a jump cut.
// ============================================================================
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { HERO_COLORS } from './heroGraph'

// Node sprites: a soft additive disc with a hot centre. Doing this in a shader
// rather than with a texture keeps the module free of any binary asset, so
// there is no second network request after the JS lands.
const NODE_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Slow individual breathing so the constellation never looks frozen.
    float pulse = 1.0 + sin(uTime * 1.4 + aSeed * 6.2831) * 0.09;
    // gl_PointSize is in *framebuffer* pixels, not CSS pixels, so uPixelRatio
    // has to be applied here.
    //
    // The sprite carries its own glow (see the fragment shader), so its
    // diameter is the diameter of the *glow*, not of the dot — roughly 29 CSS
    // px for a satellite. SIZE_SCALE was calibrated against the 2D fallback by
    // matching lit-pixel coverage across the frame: too small and the graph
    // reads as sparse specks next to the 2D version it dissolves from, too
    // large and the additive blending sums every overlap into one white mass.
    const float SIZE_SCALE = 30.0;
    gl_PointSize = aSize * pulse * uPixelRatio * (SIZE_SCALE / -mvPosition.z);
    vDepth = clamp((-mvPosition.z - 2.2) / 3.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const NODE_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.08, d);
    float halo = pow(smoothstep(0.5, 0.0, d), 2.2);
    // Further nodes dim, which is the whole depth cue on an additive scene
    // with no fog and no lighting.
    //
    // These weights are held down on purpose. Under additive blending the
    // contributions of overlapping sprites sum, so values that look correct
    // for one isolated node clip to flat white wherever three of them meet —
    // and the graph's whole point is that nodes cluster.
    float alpha = (core * 0.6 + halo * 0.36) * mix(1.0, 0.35, vDepth) * uOpacity;
    vec3 color = vColor + core * 0.3;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/**
 * Mount a Three.js hero scene into `canvas`.
 *
 * @returns a controller with the same shape as the 2D renderer, plus
 *          `onContextLost` so the caller can fall back to 2D if the GPU
 *          drops the context (common when a laptop switches graphics cards).
 */
export function createHeroWebGL(canvas, graph, options = {}) {
  const { maxPixelRatio = 1.6, onContextLost } = options
  const { nodes, edges, core } = graph

  let renderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: maxPixelRatio <= 1.25,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    })
  } catch {
    // Software rasterisers and blocklisted drivers land here. The caller keeps
    // the 2D canvas, which is the better experience on that hardware anyway.
    return null
  }

  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  // 60° with the camera pulled back to ~6 units reproduces the depth falloff
  // of the 2D projection closely enough that the dissolve is invisible.
  const camera = new PerspectiveCamera(60, 1, 0.1, 40)
  camera.position.set(0, 0, 4.35)

  const group = new Group()
  scene.add(group)

  // --- nodes ---------------------------------------------------------------
  const count = nodes.length
  const nodePositions = new Float32Array(count * 3)
  const nodeSizes = new Float32Array(count)
  const nodeSeeds = new Float32Array(count)
  const nodeColors = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 1) {
    const node = nodes[i]
    nodePositions[i * 3] = node.x
    nodePositions[i * 3 + 1] = node.y
    nodePositions[i * 3 + 2] = node.z
    // The core is only ~1.4× a satellite. Anything larger saturates to white
    // under additive blending and loses the coral that identifies it.
    nodeSizes[i] = (node.core ? 9 : 6.5) * node.size
    nodeSeeds[i] = node.seed
    const color = node.core ? HERO_COLORS.coral : HERO_COLORS.mint
    nodeColors[i * 3] = color[0]
    nodeColors[i * 3 + 1] = color[1]
    nodeColors[i * 3 + 2] = color[2]
  }

  const nodeGeometry = new BufferGeometry()
  nodeGeometry.setAttribute('position', new BufferAttribute(nodePositions, 3))
  nodeGeometry.setAttribute('aSize', new BufferAttribute(nodeSizes, 1))
  nodeGeometry.setAttribute('aSeed', new BufferAttribute(nodeSeeds, 1))
  nodeGeometry.setAttribute('aColor', new BufferAttribute(nodeColors, 3))

  const nodeMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
    },
    vertexShader: NODE_VERTEX,
    fragmentShader: NODE_FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
  })

  const nodePoints = new Points(nodeGeometry, nodeMaterial)
  // No frustum culling: the bounding sphere is tiny and always on screen, so
  // the per-frame test is pure overhead — and it can wrongly cull the whole
  // cloud once point sizes grow past the sphere.
  nodePoints.frustumCulled = false
  group.add(nodePoints)

  // --- edges ---------------------------------------------------------------
  const edgePositions = new Float32Array(edges.length * 6)
  const edgeColors = new Float32Array(edges.length * 6)
  const mint = new Color(...HERO_COLORS.mint)
  const coral = new Color(...HERO_COLORS.coral)

  edges.forEach((edge, index) => {
    for (let end = 0; end < 2; end += 1) {
      const node = nodes[edge[end]]
      const base = index * 6 + end * 3
      edgePositions[base] = node.x
      edgePositions[base + 1] = node.y
      edgePositions[base + 2] = node.z
      // Lines into the core warm toward coral, so the eye is led to it.
      const color = edge[end] === core ? coral : mint
      edgeColors[base] = color.r
      edgeColors[base + 1] = color.g
      edgeColors[base + 2] = color.b
    }
  })

  const edgeGeometry = new BufferGeometry()
  edgeGeometry.setAttribute('position', new Float32BufferAttribute(edgePositions, 3))
  edgeGeometry.setAttribute('color', new Float32BufferAttribute(edgeColors, 3))

  const edgeMaterial = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
  })

  const edgeLines = new LineSegments(edgeGeometry, edgeMaterial)
  edgeLines.frustumCulled = false
  group.add(edgeLines)

  // --- travelling signals --------------------------------------------------
  // One packet per edge, riding from end to end. Positions are rewritten on
  // the CPU each frame; at this count that is a few hundred float writes,
  // far cheaper than a second draw call's worth of shader plumbing.
  const signals = edges.map((edge, index) => ({
    edge,
    speed: 0.09 + (index % 5) * 0.018,
    offset: (index * 0.37) % 1,
  }))

  const signalPositions = new Float32Array(signals.length * 3)
  const signalSizes = new Float32Array(signals.length)
  const signalSeeds = new Float32Array(signals.length)
  const signalColors = new Float32Array(signals.length * 3)
  for (let i = 0; i < signals.length; i += 1) {
    // Packets are hard little dots, not glowing nodes, so their sprite is
    // roughly a sixth of a satellite's.
    signalSizes[i] = 1.0
    signalSeeds[i] = 0
    signalColors[i * 3] = HERO_COLORS.signal[0]
    signalColors[i * 3 + 1] = HERO_COLORS.signal[1]
    signalColors[i * 3 + 2] = HERO_COLORS.signal[2]
  }

  const signalGeometry = new BufferGeometry()
  const signalPositionAttribute = new BufferAttribute(signalPositions, 3)
  signalPositionAttribute.setUsage(DynamicDrawUsage)
  signalGeometry.setAttribute('position', signalPositionAttribute)
  signalGeometry.setAttribute('aSize', new BufferAttribute(signalSizes, 1))
  signalGeometry.setAttribute('aSeed', new BufferAttribute(signalSeeds, 1))
  signalGeometry.setAttribute('aColor', new BufferAttribute(signalColors, 3))

  const signalMaterial = nodeMaterial.clone()
  signalMaterial.uniforms = {
    uTime: nodeMaterial.uniforms.uTime,
    uPixelRatio: nodeMaterial.uniforms.uPixelRatio,
    uOpacity: { value: 0.95 },
  }

  const signalPoints = new Points(signalGeometry, signalMaterial)
  signalPoints.frustumCulled = false
  group.add(signalPoints)

  // --- ambient dust ---------------------------------------------------------
  // A wider, dimmer shell behind the graph. It exists purely to give the scene
  // depth the 2D fallback cannot fake: hundreds of sub-pixel points whose size
  // and brightness fall off with distance read as volume rather than as a flat
  // diagram. One extra draw call, no per-frame CPU work.
  const DUST_COUNT = 220
  const dustPositions = new Float32Array(DUST_COUNT * 3)
  const dustSizes = new Float32Array(DUST_COUNT)
  const dustSeeds = new Float32Array(DUST_COUNT)
  const dustColors = new Float32Array(DUST_COUNT * 3)

  // Same deterministic generator idea as the graph: a fixed sequence, so the
  // dust does not reshuffle on every reload.
  let dustSeed = 0x9e3779b9
  const nextRandom = () => {
    dustSeed = (dustSeed + 0x6d2b79f5) >>> 0
    let t = Math.imul(dustSeed ^ (dustSeed >>> 15), 1 | dustSeed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  for (let i = 0; i < DUST_COUNT; i += 1) {
    const theta = nextRandom() * Math.PI * 2
    const phi = Math.acos(2 * nextRandom() - 1)
    // Just outside the graph's own radius (~1.3), so the dust surrounds it and
    // bleeds off the frame edges instead of sitting entirely outside the view.
    const radius = 1.05 + nextRandom() * 1.1
    dustPositions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius * 1.3
    dustPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.75
    dustPositions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * radius
    dustSizes[i] = 0.35 + nextRandom() * 0.5
    dustSeeds[i] = nextRandom()
    const tint = 0.32 + nextRandom() * 0.22
    dustColors[i * 3] = HERO_COLORS.mint[0] * tint
    dustColors[i * 3 + 1] = HERO_COLORS.mint[1] * tint
    dustColors[i * 3 + 2] = HERO_COLORS.mint[2] * tint
  }

  const dustGeometry = new BufferGeometry()
  dustGeometry.setAttribute('position', new BufferAttribute(dustPositions, 3))
  dustGeometry.setAttribute('aSize', new BufferAttribute(dustSizes, 1))
  dustGeometry.setAttribute('aSeed', new BufferAttribute(dustSeeds, 1))
  dustGeometry.setAttribute('aColor', new BufferAttribute(dustColors, 3))

  const dustMaterial = nodeMaterial.clone()
  dustMaterial.uniforms = {
    uTime: nodeMaterial.uniforms.uTime,
    uPixelRatio: nodeMaterial.uniforms.uPixelRatio,
    uOpacity: { value: 0 },
  }

  const dustPoints = new Points(dustGeometry, dustMaterial)
  dustPoints.frustumCulled = false
  group.add(dustPoints)

  // --- orbit rings ----------------------------------------------------------
  // Two tilted rings that counter-rotate around the graph. They echo the CSS
  // orbits behind the hero copy, and because they are real 3D geometry they
  // pass in front of and behind the nodes as they turn — the single strongest
  // depth cue in the scene, and the one thing the 2D projection cannot do.
  const RING_SEGMENTS = 128
  const buildRing = (radius, tiltX, tiltZ) => {
    const positions = new Float32Array(RING_SEGMENTS * 6)
    for (let i = 0; i < RING_SEGMENTS; i += 1) {
      for (let end = 0; end < 2; end += 1) {
        const angle = ((i + end) / RING_SEGMENTS) * Math.PI * 2
        const base = i * 6 + end * 3
        positions[base] = Math.cos(angle) * radius
        positions[base + 1] = 0
        positions[base + 2] = Math.sin(angle) * radius
      }
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    const material = new LineBasicMaterial({
      color: new Color(...HERO_COLORS.mint),
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const ring = new LineSegments(geometry, material)
    ring.rotation.set(tiltX, 0, tiltZ)
    ring.frustumCulled = false
    group.add(ring)
    return { ring, geometry, material, baseTiltX: tiltX, baseTiltZ: tiltZ }
  }

  const rings = [buildRing(1.45, 1.18, 0.22), buildRing(1.86, 1.42, -0.34)]

  // --- render loop plumbing ------------------------------------------------
  let time = 0
  const pointer = { x: 0, y: 0 }
  let pixelRatio = 1

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(rect.width, rect.height, false)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    nodeMaterial.uniforms.uPixelRatio.value = pixelRatio

    // Fit by scaling the graph, not by moving the camera.
    //
    // Dollying back to fit a portrait frame also flattens the perspective,
    // which is the one thing this scene exists to provide. Holding the camera
    // still and scaling the group keeps the depth spread — near nodes stay
    // near — while matching the 2D renderer's framing, where a node at radius
    // 1 lands 40% of the way across the frame's shorter axis.
    const halfHeight = camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
    const halfMin = Math.min(halfHeight * camera.aspect, halfHeight)
    group.scale.setScalar(0.8 * halfMin)
  }

  const render = () => {
    nodeMaterial.uniforms.uTime.value = time

    const yaw = Math.sin(time * 0.12) * 0.3 + pointer.x * 0.42
    const pitch = -0.08 + pointer.y * 0.2
    group.rotation.set(pitch, yaw, 0)

    // Counter-rotating, at different rates, so the two rings never line up
    // into a single readable shape.
    rings[0].ring.rotation.y = time * 0.11
    rings[1].ring.rotation.y = -time * 0.07

    for (let i = 0; i < signals.length; i += 1) {
      const signal = signals[i]
      const from = nodes[signal.edge[0]]
      const to = nodes[signal.edge[1]]
      const t = (time * signal.speed + signal.offset) % 1
      signalPositions[i * 3] = from.x + (to.x - from.x) * t
      signalPositions[i * 3 + 1] = from.y + (to.y - from.y) * t
      signalPositions[i * 3 + 2] = from.z + (to.z - from.z) * t
    }
    signalPositionAttribute.needsUpdate = true

    renderer.render(scene, camera)
  }

  const handleContextLost = (event) => {
    event.preventDefault()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', handleContextLost)

  resize()

  return {
    render,
    resize,
    setTime: (value) => { time = value },
    setPointer: (x, y) => { pointer.x = x; pointer.y = y },
    setOpacity: (value) => {
      const opacity = clamp01(value)
      nodeMaterial.uniforms.uOpacity.value = opacity
      signalMaterial.uniforms.uOpacity.value = opacity * 0.95
      edgeMaterial.opacity = 0.3 * opacity
      // The dust and the rings have no counterpart in the 2D renderer, so they
      // are faded on a curve that keeps them near-invisible for the first half
      // of the handover. They arrive as the graph settles instead of popping
      // in against the 2D frame and breaking the dissolve.
      const lateFade = clamp01((opacity - 0.45) / 0.55)
      dustMaterial.uniforms.uOpacity.value = lateFade * 0.75
      rings[0].material.opacity = lateFade * 0.16
      rings[1].material.opacity = lateFade * 0.11
    },
    dispose: () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      nodeGeometry.dispose()
      edgeGeometry.dispose()
      signalGeometry.dispose()
      dustGeometry.dispose()
      rings.forEach((entry) => {
        entry.geometry.dispose()
        entry.material.dispose()
      })
      nodeMaterial.dispose()
      signalMaterial.dispose()
      dustMaterial.dispose()
      edgeMaterial.dispose()
      renderer.dispose()
      // Without this the GPU context lingers until GC, and browsers cap the
      // number of live contexts per page — mount/unmount cycles would
      // eventually start failing to create one at all.
      renderer.forceContextLoss?.()
    },
  }
}
