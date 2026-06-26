"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

function buildTowerGeometry() {
  const vertices: number[] = []
  const levels = [
    { y: -1.75, w: 1.62 },
    { y: -1.08, w: 1.22 },
    { y: -0.34, w: 0.82 },
    { y: 0.46, w: 0.5 },
    { y: 1.2, w: 0.24 },
    { y: 1.78, w: 0.04 },
  ]

  function point(level: (typeof levels)[number], corner: number): [number, number, number] {
    const half = level.w / 2
    return [
      corner === 0 || corner === 3 ? -half : half,
      level.y,
      corner < 2 ? -half : half,
    ]
  }

  function line(a: [number, number, number], b: [number, number, number]) {
    vertices.push(...a, ...b)
  }

  for (const level of levels) {
    for (let corner = 0; corner < 4; corner += 1) {
      line(point(level, corner), point(level, (corner + 1) % 4))
    }
  }

  for (let i = 0; i < levels.length - 1; i += 1) {
    for (let corner = 0; corner < 4; corner += 1) {
      line(point(levels[i], corner), point(levels[i + 1], corner))
      line(point(levels[i], corner), point(levels[i + 1], (corner + 1) % 4))
    }
  }

  line([0, levels.at(-1)!.y, 0], [0, 2.1, 0])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  return geometry
}

function SignalTower() {
  const groupRef = useRef<THREE.Group>(null)
  const rippleMeshRef = useRef<THREE.Mesh>(null)
  const rippleRef = useRef<THREE.MeshBasicMaterial>(null)
  const pulseRef = useRef(0)
  const elapsedRef = useRef(0)
  const towerGeometry = useMemo(buildTowerGeometry, [])

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    pulseRef.current = Math.max(0, pulseRef.current - delta * 0.72)

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18
      groupRef.current.rotation.x = Math.sin(elapsedRef.current * 0.42) * 0.05
    }

    if (rippleRef.current) {
      rippleRef.current.opacity = pulseRef.current * 0.42
    }
    if (rippleMeshRef.current) {
      const scale = 1 + pulseRef.current * 0.7
      rippleMeshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group ref={groupRef} scale={0.92} position={[0, -0.06, 0]} onClick={() => (pulseRef.current = 1)}>
      <lineSegments geometry={towerGeometry}>
        <lineBasicMaterial color="#f4f4f1" transparent opacity={0.62} />
      </lineSegments>
      <mesh ref={rippleMeshRef} position={[0, -1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.12, 0.01, 8, 96]} />
        <meshBasicMaterial ref={rippleRef} color="#f4f4f1" transparent opacity={0} />
      </mesh>
      <mesh position={[0, -1.84, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1.24, 4]} />
        <meshBasicMaterial color="#f4f4f1" transparent opacity={0.08} wireframe />
      </mesh>
    </group>
  )
}

export function SignalCore() {
  const [webgl, setWebgl] = useState(false)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    setWebgl(!!(canvas.getContext("webgl2") || canvas.getContext("webgl")))
  }, [])

  if (!webgl) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-80 w-44 animate-pulse">
          <div className="absolute inset-x-20 top-2 h-72 border-x border-zinc-100/50" />
          <div className="absolute left-4 right-4 bottom-10 border-t border-zinc-100/50" />
          <div className="absolute left-10 right-10 bottom-28 border-t border-zinc-100/40" />
          <div className="absolute left-16 right-16 bottom-48 border-t border-zinc-100/30" />
        </div>
      </div>
    )
  }

  return (
    <Canvas className="absolute inset-0 h-full w-full" camera={{ position: [0, 0.04, 5.4], fov: 38 }} dpr={[1, 1.6]}>
      <ambientLight intensity={0.56} />
      <directionalLight position={[2.8, 2.6, 3.4]} intensity={1.1} />
      <SignalTower />
    </Canvas>
  )
}
