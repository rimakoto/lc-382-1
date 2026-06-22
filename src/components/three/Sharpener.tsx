import React, { useRef, useMemo, useEffect, useState } from 'react'
import type { Group, Mesh } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { usePencilStore } from '../../store/usePencilStore'

interface SharpenerProps {
  onCrankDrag: (deltaAngle: number) => void
  crankAngle: number
  isHovered: boolean
  setIsHovered: (v: boolean) => void
}

const Sharpener: React.FC<SharpenerProps> = ({
  onCrankDrag,
  crankAngle,
  isHovered,
  setIsHovered,
}) => {
  const crankGroupRef = useRef<Group>(null)
  const bodyRef = useRef<Mesh>(null)
  const [isDragging, setIsDragging] = useState(false)
  const lastPointerPos = useRef({ x: 0, y: 0 })
  const startDragging = usePencilStore((s) => s.actions.startDragging)
  const stopDragging = usePencilStore((s) => s.actions.stopDragging)

  const crankRadius = 0.7

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsDragging(true)
    startDragging()
    lastPointerPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return
    e.stopPropagation()

    const dx = e.clientX - lastPointerPos.current.x
    const dy = e.clientY - lastPointerPos.current.y

    const deltaAngle = (dx + dy) * 0.015
    onCrankDrag(deltaAngle)

    lastPointerPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsDragging(false)
    stopDragging()
    try {
      ;(e.target as Element).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
    document.body.style.cursor = 'grab'
  }

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleBodyPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
  }

  const handleBodyPointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
  }

  const handleDragOver = () => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing'
    }
  }

  useEffect(() => {
    handleDragOver()
  }, [isDragging])

  const holePositions = useMemo(
    () => [
      { x: -0.5, y: 0.35, z: 0, size: 0.18 },
      { x: 0, y: 0.35, z: 0, size: 0.22 },
      { x: 0.5, y: 0.35, z: 0, size: 0.18 },
    ],
    []
  )

  return (
    <group position={[0, 0, 0]}>
      {/* 卷笔刀主体 - 深蓝色金属方块 */}
      <mesh
        ref={bodyRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={handleBodyPointerOver}
        onPointerOut={handleBodyPointerOut}
      >
        <boxGeometry args={[2.2, 1.2, 1.4]} />
        <meshStandardMaterial
          color={isHovered ? '#2a4a8a' : '#1e3a6e'}
          metalness={0.85}
          roughness={0.25}
          envMapIntensity={1}
        />
      </mesh>

      {/* 铅笔插入孔 */}
      {holePositions.map((hole, i) => (
        <group key={i}>
          {/* 孔内环 */}
          <mesh position={[hole.x, hole.y, 0.71]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[hole.size, 0.03, 8, 24]} />
            <meshStandardMaterial
              color="#0a1a3a"
              metalness={0.6}
              roughness={0.5}
            />
          </mesh>
          {/* 孔内深色 */}
          <mesh position={[hole.x, hole.y, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[hole.size - 0.02, 24]} />
            <meshStandardMaterial
              color="#050a1a"
              metalness={0.1}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* 正面角落装饰钉 */}
      {[[-0.85, 0.5], [0.85, 0.5], [-0.85, -0.5], [0.85, -0.5]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.712]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial
            color="#2a4a8a"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      ))}

      {/* 正面中心小徽章 */}
      <mesh position={[0, -0.35, 0.711]}>
        <cylinderGeometry args={[0.08, 0.08, 0.015, 20]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -0.35, 0.72]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.055, 0.008, 8, 24]} />
        <meshStandardMaterial
          color="#f0d060"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* 摇柄转轴基座 */}
      <mesh position={[1.22, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 20]} />
        <meshStandardMaterial
          color="#888888"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* 摇柄旋转组 */}
      <group
        ref={crankGroupRef}
        position={[1.28, 0, 0]}
        rotation={[0, 0, crankAngle]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* 中心转轴 */}
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
          <meshStandardMaterial
            color="#aaaaaa"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* 摇臂连接杆 */}
        <mesh
          position={[crankRadius * 0.5, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.06, crankRadius, 12]} />
          <meshStandardMaterial
            color={isDragging ? '#d8d8d8' : '#c0c0c0'}
            metalness={0.95}
            roughness={0.12}
          />
        </mesh>

        {/* 摇臂与转轴连接块 */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial
            color="#b0b0b0"
            metalness={0.95}
            roughness={0.12}
          />
        </mesh>

        {/* 手握圆球连接杆 */}
        <mesh
          position={[crankRadius + 0.08, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.2, 12]} />
          <meshStandardMaterial
            color="#999999"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* 手握圆球 */}
        <mesh position={[crankRadius + 0.2, 0, 0]} castShadow>
          <sphereGeometry args={[0.18, 20, 16]} />
          <meshStandardMaterial
            color={isDragging ? '#e8e8e8' : isHovered ? '#dcdcdc' : '#cccccc'}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* 圆球顶端高光点 */}
        <mesh position={[crankRadius + 0.33, 0.08, 0.08]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
            metalness={1}
            roughness={0}
          />
        </mesh>
      </group>

      {/* 左侧装饰片 */}
      <mesh position={[-1.12, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 1.0, 1.2]} />
        <meshStandardMaterial
          color="#2a4a8a"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* 底部支脚 */}
      {[
        [-0.9, -0.68, -0.5],
        [0.9, -0.68, -0.5],
        [-0.9, -0.68, 0.5],
        [0.9, -0.68, 0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.2]} />
          <meshStandardMaterial
            color="#1a2a4a"
            metalness={0.7}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export default Sharpener
