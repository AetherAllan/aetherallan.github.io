"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uPulse;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    float ripple = sin((position.y * 10.0) + (uPulse * 8.0)) * 0.055 * uPulse;
    vec3 moved = position + normal * ripple;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(moved, 1.0);
  }
`

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uPulse;

  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 1.7);
    float scan = smoothstep(0.48, 0.5, abs(sin(vPosition.y * 22.0 + uTime * 2.4)));
    float ring = smoothstep(0.04, 0.0, abs(length(vPosition.xz) - uPulse * 2.2));
    vec3 color = vec3(0.05) + vec3(rim * 0.82 + scan * 0.12 + ring * 0.9);
    gl_FragColor = vec4(color, 0.72);
  }
`

function Sculpture() {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const pulseRef = useRef(0)
  const points = useMemo(
    () => [
      new THREE.Vector2(0.1, -1.75),
      new THREE.Vector2(0.42, -1.55),
      new THREE.Vector2(0.3, -1.05),
      new THREE.Vector2(0.62, -0.62),
      new THREE.Vector2(0.38, -0.16),
      new THREE.Vector2(0.72, 0.3),
      new THREE.Vector2(0.48, 0.72),
      new THREE.Vector2(0.58, 1.12),
      new THREE.Vector2(0.18, 1.54),
      new THREE.Vector2(0.04, 1.78),
    ],
    [],
  )
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPulse: { value: 0 } }), [])

  useFrame((state, delta) => {
    pulseRef.current = Math.max(0, pulseRef.current - delta * 0.55)
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.22
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.32) * 0.08
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uPulse.value = pulseRef.current
    }
  })

  return (
    <group ref={groupRef} scale={0.86} position={[0, -0.04, 0]} onClick={() => (pulseRef.current = 1)}>
      <mesh>
        <latheGeometry args={[points, 112]} />
        <shaderMaterial
          ref={materialRef}
          attach="material"
          args={[{ uniforms, vertexShader, fragmentShader, transparent: true }]}
        />
      </mesh>
      <mesh scale={1.01}>
        <latheGeometry args={[points, 36]} />
        <meshBasicMaterial color="#eeeeea" wireframe transparent opacity={0.23} />
      </mesh>
      <mesh position={[0, -1.82, 0]}>
        <cylinderGeometry args={[0.72, 0.9, 0.12, 64]} />
        <meshBasicMaterial color="#c9c9c2" transparent opacity={0.28} wireframe />
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
        <div className="relative h-72 w-36 animate-pulse border-x border-zinc-100/40">
          <div className="absolute inset-x-4 top-6 h-24 rounded-t-full border border-zinc-100/40" />
          <div className="absolute inset-x-0 bottom-8 h-44 rounded-[55%] border border-zinc-100/60 bg-zinc-100/10" />
        </div>
      </div>
    )
  }

  return (
    <Canvas className="absolute inset-0 h-full w-full" camera={{ position: [0, 0.08, 5.4], fov: 38 }} dpr={[1, 1.6]}>
      <ambientLight intensity={0.52} />
      <directionalLight position={[2.8, 2.6, 3.4]} intensity={1.2} />
      <Sculpture />
    </Canvas>
  )
}
