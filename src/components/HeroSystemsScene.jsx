import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NODE_POSITIONS = [
  [-2.6, 0.8, 0], [-1.5, 1.8, -0.6], [-0.9, 0.25, 0.9], [0, 1.15, 0],
  [1.05, 2, -0.55], [1.65, 0.45, 0.75], [2.7, 1.1, -0.1], [-1.9, -1.1, 0.45],
  [-0.15, -1.2, -0.45], [1.65, -1.05, 0.15], [0, 0, 0.3],
]

const CONNECTIONS = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 7], [2, 8], [3, 4], [3, 5], [3, 10], [4, 6], [5, 6], [5, 9], [7, 8], [8, 9], [8, 10], [9, 10]]

function Network({ reducedMotion, compact }) {
  const group = useRef()
  const signals = useRef([])
  const lines = useMemo(() => {
    const points = []
    CONNECTIONS.forEach(([a, b]) => points.push(...NODE_POSITIONS[a], ...NODE_POSITIONS[b]))
    return new Float32Array(points)
  }, [])
  const signalData = useMemo(() => {
    const count = compact ? 7 : 12
    return Array.from({ length: count }, (_, index) => {
      const connection = CONNECTIONS[index % CONNECTIONS.length]
      return {
        connection,
        start: new THREE.Vector3(...NODE_POSITIONS[connection[0]]),
        end: new THREE.Vector3(...NODE_POSITIONS[connection[1]]),
        speed: 0.08 + (index % 4) * 0.018,
        offset: (index / count) % 1,
      }
    })
  }, [compact])

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return
    const time = state.clock.elapsedTime
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.12 + state.pointer.y * 0.07, Math.min(1, delta * 2.3))
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -0.15 + Math.sin(time * 0.12) * 0.05 + state.pointer.x * 0.09, Math.min(1, delta * 1.8))
    signalData.forEach((signal, index) => {
      const mesh = signals.current[index]
      if (!mesh) return
      const progress = (time * signal.speed + signal.offset) % 1
      mesh.position.lerpVectors(signal.start, signal.end, progress)
    })
  })

  return (
    <group ref={group} rotation={[-0.12, -0.15, 0]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={lines} count={lines.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#67e0c1" transparent opacity={0.28} />
      </lineSegments>

      {NODE_POSITIONS.map((position, index) => (
        <group key={position.join('-')} position={position}>
          <mesh scale={index === 10 ? 1.35 : 1}>
            <icosahedronGeometry args={[index === 10 ? 0.22 : 0.13, 1]} />
            <meshStandardMaterial color={index === 10 ? '#ff9c77' : '#8ff0d8'} emissive={index === 10 ? '#ff6f45' : '#2a9d85'} emissiveIntensity={0.7} roughness={0.35} />
          </mesh>
          <mesh scale={index === 10 ? 2.8 : 2.2}>
            <sphereGeometry args={[index === 10 ? 0.2 : 0.12, 12, 12]} />
            <meshBasicMaterial color={index === 10 ? '#ff9c77' : '#67e0c1'} transparent opacity={0.09} />
          </mesh>
        </group>
      ))}

      {signalData.map((signal, index) => (
        <mesh key={`${signal.connection.join('-')}-${index}`} ref={(node) => { signals.current[index] = node }}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial color="#f5f2e9" />
        </mesh>
      ))}
    </group>
  )
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

export default function HeroSystemsScene() {
  const host = useRef(null)
  const [visible, setVisible] = useState(true)
  const [tabVisible, setTabVisible] = useState(!document.hidden)
  const [compact, setCompact] = useState(window.matchMedia('(max-width: 767px)').matches)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canRender = supportsWebGL()

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '120px' })
    if (host.current) observer.observe(host.current)
    const media = window.matchMedia('(max-width: 767px)')
    const onMedia = (event) => setCompact(event.matches)
    const onVisibility = () => setTabVisible(!document.hidden)
    media.addEventListener('change', onMedia)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', onMedia)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const fallback = <div className="systems-fallback" aria-hidden="true"><span /><span /><span /><span /><span /></div>

  return (
    <div ref={host} className="systems-scene">
      {fallback}
      {canRender && (
        <SceneBoundary fallback={null}>
          <Canvas
            className="systems-canvas"
            camera={{ position: [0, 0.45, 7.2], fov: 44 }}
            dpr={compact ? 1 : [1, 1.5]}
            frameloop={visible && tabVisible && !reducedMotion ? 'always' : 'demand'}
            gl={{ antialias: !compact, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={0.75} />
            <pointLight position={[2.5, 3, 4]} intensity={12} color="#8ff0d8" />
            <pointLight position={[-3, -2, 3]} intensity={8} color="#ff9c77" />
            <Network reducedMotion={reducedMotion} compact={compact} />
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  )
}
