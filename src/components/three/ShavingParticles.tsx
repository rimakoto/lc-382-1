import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface ShavingParticlesProps {
  spawnCount: number
}

const MAX_PARTICLES = 200
const GRAVITY = -9.8
const GROUND_Y = -0.8
const SPAWN_POSITION = new THREE.Vector3(-1.1, 0.3, 0)

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  angularVelocity: THREE.Vector3
  scale: THREE.Vector3
  color: THREE.Color
  active: boolean
  settled: boolean
}

function createCurledShavingGeometry(): THREE.BufferGeometry {
  const width = 0.02
  const length = 0.35
  const segmentsW = 1
  const segmentsL = 20

  const geometry = new THREE.PlaneGeometry(width, length, segmentsW, segmentsL)
  const positions = geometry.attributes.position as THREE.BufferAttribute
  const vertex = new THREE.Vector3()

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i)
    const t = (vertex.y + length / 2) / length
    const curlAmount = Math.sin(t * Math.PI * 2.5) * 0.06
    const twist = t * Math.PI * 1.2
    vertex.z += curlAmount
    const x = vertex.x * Math.cos(twist) - vertex.z * Math.sin(twist)
    const z = vertex.x * Math.sin(twist) + vertex.z * Math.cos(twist)
    vertex.x = x
    vertex.z = z
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  geometry.computeVertexNormals()
  geometry.rotateZ(Math.PI / 2)
  return geometry
}

const WOOD_COLORS = [
  new THREE.Color('#d4a574'),
  new THREE.Color('#c49a6c'),
  new THREE.Color('#b8956a'),
  new THREE.Color('#a67c52'),
  new THREE.Color('#e0b88a'),
]

export const ShavingParticles: React.FC<ShavingParticlesProps> = ({ spawnCount }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useRef<Particle[]>([])
  const poolPointer = useRef(0)
  const lastSpawnCount = useRef(0)

  const geometry = useMemo(() => createCurledShavingGeometry(), [])

  useEffect(() => {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.current.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        angularVelocity: new THREE.Vector3(),
        scale: new THREE.Vector3(),
        color: new THREE.Color(),
        active: false,
        settled: false,
      })
    }
  }, [])

  const spawnParticle = (index: number) => {
    const p = particles.current[index]
    if (!p) return

    p.position.copy(SPAWN_POSITION)
    p.position.x += (Math.random() - 0.5) * 0.1
    p.position.y += (Math.random() - 0.5) * 0.08
    p.position.z += (Math.random() - 0.5) * 0.1

    const speed = 1.5 + Math.random() * 1.5
    const angleXZ = Math.PI + (Math.random() - 0.5) * 0.8
    const angleY = -0.3 - Math.random() * 0.5
    const horizontalSpeed = speed * Math.cos(angleY)
    p.velocity.set(
      Math.cos(angleXZ) * horizontalSpeed,
      Math.sin(angleY) * speed,
      Math.sin(angleXZ) * horizontalSpeed * 0.5
    )

    p.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )

    const rotSpeed = 3 + Math.random() * 5
    p.angularVelocity.set(
      (Math.random() - 0.5) * rotSpeed,
      (Math.random() - 0.5) * rotSpeed,
      (Math.random() - 0.5) * rotSpeed
    )

    const scaleFactor = 0.6 + Math.random() * 0.8
    p.scale.set(scaleFactor, scaleFactor * (0.8 + Math.random() * 0.6), scaleFactor)

    p.color.copy(WOOD_COLORS[Math.floor(Math.random() * WOOD_COLORS.length)])

    p.active = true
    p.settled = false

    if (meshRef.current) {
      meshRef.current.setColorAt(index, p.color)
    }
  }

  useEffect(() => {
    const diff = spawnCount - lastSpawnCount.current
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        spawnParticle(poolPointer.current)
        poolPointer.current = (poolPointer.current + 1) % MAX_PARTICLES
      }
      if (meshRef.current) {
        meshRef.current.instanceColor!.needsUpdate = true
      }
    }
    lastSpawnCount.current = spawnCount
  }, [spawnCount])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const dt = Math.min(delta, 0.05)

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles.current[i]
      if (!p || !p.active) continue

      if (!p.settled) {
        p.velocity.y += GRAVITY * dt

        p.position.x += p.velocity.x * dt
        p.position.y += p.velocity.y * dt
        p.position.z += p.velocity.z * dt

        p.rotation.x += p.angularVelocity.x * dt
        p.rotation.y += p.angularVelocity.y * dt
        p.rotation.z += p.angularVelocity.z * dt

        p.velocity.x *= 0.995
        p.velocity.z *= 0.995

        if (p.position.y <= GROUND_Y) {
          p.position.y = GROUND_Y + 0.001
          p.velocity.set(0, 0, 0)
          p.angularVelocity.multiplyScalar(0.05)
          p.settled = true
        }

        if (p.position.x < -4 || p.position.x > 4 || p.position.z < -3 || p.position.z > 3) {
          p.active = false
          continue
        }
      }

      dummy.position.copy(p.position)
      dummy.rotation.copy(p.rotation)
      dummy.scale.copy(p.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, MAX_PARTICLES]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        roughness={0.85}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

export default ShavingParticles
