// ============================================================================
// Starfield3D — shared Three.js background pieces used by the dungeon and the
// arcade lobby. Kept in its own module so importing the scene doesn't pull in
// the whole GameOverlay (preserves per-game code-splitting).
// ============================================================================
import { Component, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

export function StarField({ bossMode, count = 3000 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 70
      arr[i * 3 + 1] = (Math.random() - 0.5) * 70
      arr[i * 3 + 2] = (Math.random() - 0.5) * 70
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current) return
    const speed = bossMode ? 0.18 : 0.03
    ref.current.rotation.y += delta * speed
    ref.current.rotation.x += delta * speed * 0.4
    if (bossMode) ref.current.rotation.z += delta * 0.08
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={bossMode ? 0.22 : 0.12}
        color={bossMode ? '#ff3b3b' : '#5fa8ff'}
        sizeAttenuation
        transparent
        opacity={bossMode ? 0.9 : 0.75}
      />
    </points>
  )
}

export function Nebula({ bossMode }) {
  const a = useRef(), b = useRef(), c = useRef()
  useFrame((_, delta) => {
    if (a.current) a.current.rotation.y += delta * 0.04
    if (b.current) b.current.rotation.x += delta * 0.03
    if (c.current) c.current.rotation.z += delta * 0.05
  })
  const color = (normal) => (bossMode ? '#ff4d4d' : normal)
  return (
    <group>
      <mesh ref={a} position={[-14, 6, -20]}>
        <sphereGeometry args={[16, 24, 24]} />
        <meshBasicMaterial color={color('#3b82f6')} transparent opacity={0.03} />
      </mesh>
      <mesh ref={b} position={[16, -8, -25]}>
        <sphereGeometry args={[20, 24, 24]} />
        <meshBasicMaterial color={color('#8b5cf6')} transparent opacity={0.03} />
      </mesh>
      <mesh ref={c} position={[0, 10, -30]}>
        <sphereGeometry args={[24, 24, 24]} />
        <meshBasicMaterial color={color('#14b8a6')} transparent opacity={0.03} />
      </mesh>
    </group>
  )
}

export function FloatingShapes({ bossMode }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef()]
  const shapes = useMemo(
    () => [
      { pos: [-10, 4, -8], scale: 1.6 },
      { pos: [11, -5, -10], scale: 2.2 },
      { pos: [-6, -8, -6], scale: 1.2 },
      { pos: [8, 7, -12], scale: 1.8 },
      { pos: [0, -2, -14], scale: 2.6 },
    ],
    []
  )
  useFrame((_, delta) => {
    refs.forEach((r, i) => {
      if (r.current) {
        r.current.rotation.x += delta * (0.1 + i * 0.02)
        r.current.rotation.y += delta * (0.08 + i * 0.015)
      }
    })
  })
  return (
    <group>
      {shapes.map((s, i) => (
        <mesh key={i} ref={refs[i]} position={s.pos} scale={s.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={bossMode ? '#ff6b6b' : '#5fa8ff'} wireframe transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

// Error boundary so a WebGL failure degrades to a static gradient.
export class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

// Full background composition (stars + nebula + shapes) with WebGL fallback.
export function Background3D({ bossMode = false }) {
  const fallback = (
    <div
      className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-700 ${
        bossMode
          ? 'bg-[radial-gradient(ellipse_at_center,#2a0a0a_0%,#05060f_70%)]'
          : 'bg-[radial-gradient(ellipse_at_center,#0a1430_0%,#05060f_70%)]'
      }`}
    />
  )
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#05060f]">
      <SceneBoundary fallback={fallback}>
        <Canvas
          camera={{ position: [0, 0, 18], fov: 70 }}
          dpr={[1, 1.5]}
          gl={{ failIfMajorPerformanceCaveat: false, powerPreference: 'low-power' }}
        >
          <StarField bossMode={bossMode} count={3000} />
          <Nebula bossMode={bossMode} />
          <FloatingShapes bossMode={bossMode} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
