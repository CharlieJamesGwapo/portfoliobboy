// ============================================================================
// voiceOrbWebgl — the Three.js upgrade for the Voice Studio orb.
//
// Reached only through a dynamic import (see voice/VoiceOrb3D.jsx), after the
// CSS orb has painted, so three.js never lands on the critical path. Named
// imports keep the tree-shaken chunk small, and the module ships no textures:
// the particles are drawn entirely in shaders.
//
// A sphere of particles breathes slowly while idle. When a recording plays,
// the measured loudness (voiceActivity.js) swells the surface, speeds the
// ripple and warms the colour, so the orb visibly speaks with the audio.
// ============================================================================
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'

const VERTEX = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uLevel;
  uniform float uPixelRatio;
  varying float vLift;
  varying float vSeed;

  // Cheap layered ripple: enough organic motion for a 2k-point sphere,
  // without pulling a full simplex-noise implementation into the chunk.
  float ripple(vec3 p, float t) {
    return sin(p.x * 3.1 + t) * sin(p.y * 2.7 + t * 1.3) * sin(p.z * 3.4 + t * 0.7)
      + 0.5 * sin(p.y * 6.0 - t * 1.9 + aSeed * 6.2831);
  }

  void main() {
    float speed = 0.6 + uLevel * 2.4;
    float lift = ripple(position, uTime * speed);
    float amplitude = 0.05 + uLevel * 0.32;
    vec3 displaced = position * (1.0 + lift * amplitude);
    vLift = lift;
    vSeed = aSeed;
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    // About 2-5 CSS px at rest, larger while speaking; perspective shrinks
    // the far side so the sphere reads as a volume.
    float size = (2.4 + aSeed * 2.6) * (1.0 + uLevel * 0.9);
    gl_PointSize = size * uPixelRatio * (3.6 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uCool;
  uniform vec3 uWarm;
  uniform float uLevel;
  uniform float uOpacity;
  varying float vLift;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float heat = clamp(vLift * 0.5 + 0.5, 0.0, 1.0) * (0.25 + uLevel * 0.75);
    vec3 color = mix(uCool, uWarm, heat);
    gl_FragColor = vec4(color, glow * (0.55 + 0.45 * vSeed) * uOpacity);
  }
`

// Evenly spread points on a unit sphere (Fibonacci lattice).
function sphere(count) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions[i * 3] = Math.cos(theta) * radius
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(theta) * radius
    seeds[i] = Math.random()
  }
  return { positions, seeds }
}

export function createVoiceOrb(canvas, { getLevel, maxPixelRatio = 1.75, compact = false, onContextLost } = {}) {
  let renderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' })
  } catch {
    return null
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(38, 1, 0.1, 20)
  camera.position.z = 3.6

  const { positions, seeds } = sphere(compact ? 1200 : 2200)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))

  const uniforms = {
    uTime: { value: 0 },
    uLevel: { value: 0 },
    uOpacity: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uCool: { value: new Color('#67e0c1') },
    uWarm: { value: new Color('#ff9c77') },
  }
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)
  scene.add(points)

  const pointer = { x: 0, y: 0 }
  let level = 0
  let frame = null
  let last = performance.now()

  const onLost = (event) => {
    event.preventDefault()
    stop()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const tick = (now) => {
    frame = window.requestAnimationFrame(tick)
    const delta = Math.min(0.05, (now - last) / 1000)
    last = now
    // Ease toward the target so syllables read as a swell, not a flicker.
    const target = getLevel?.() ?? 0
    level += (target - level) * (target > level ? 0.35 : 0.08)
    uniforms.uLevel.value = level
    uniforms.uTime.value += delta
    uniforms.uOpacity.value = Math.min(1, uniforms.uOpacity.value + delta * 1.5)
    points.rotation.y += delta * (0.12 + level * 0.5)
    points.rotation.x += (pointer.y * 0.35 - points.rotation.x) * 0.04
    points.rotation.z += (pointer.x * 0.2 - points.rotation.z) * 0.04
    renderer.render(scene, camera)
  }

  function start() {
    if (frame !== null) return
    last = performance.now()
    frame = window.requestAnimationFrame(tick)
  }

  function stop() {
    if (frame !== null) window.cancelAnimationFrame(frame)
    frame = null
  }

  return {
    resize,
    start,
    stop,
    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
    },
    dispose() {
      stop()
      canvas.removeEventListener('webglcontextlost', onLost)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}
