import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface PencilProps {
  length: number;
  sharpness: number;
  pencilColor: string;
  spinning?: boolean;
  state: 'inserted' | 'removed';
  advanceAmount?: number;
  worldY?: number;
  worldHoleX?: number;
}

const Pencil: React.FC<PencilProps> = ({
  length,
  sharpness,
  pencilColor,
  spinning = false,
  state,
  advanceAmount = 0,
  worldY = 0.15,
  worldHoleX = -0.71,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  const PEN_RADIUS = 0.11;
  const HEX_SIDES = 6;

  const FERRULE_LENGTH = 0.16;
  const ERASER_LENGTH = 0.22;
  const ERASER_FERRULE_OFFSET = FERRULE_LENGTH + ERASER_LENGTH;

  const tipWoodLength = useMemo(() => {
    return 0.12 + sharpness * 0.35;
  }, [sharpness]);

  const graphiteLength = useMemo(() => {
    return 0.03 + sharpness * 0.1;
  }, [sharpness]);

  const tipBaseRadius = PEN_RADIUS;
  const graphiteBaseRadius = useMemo(() => {
    return PEN_RADIUS * (0.45 - sharpness * 0.2);
  }, [sharpness]);

  const bodyLength = useMemo(() => {
    const used = tipWoodLength + FERRULE_LENGTH + ERASER_LENGTH;
    return Math.max(length - used, 0.3);
  }, [length, tipWoodLength]);

  const totalLength = bodyLength + tipWoodLength + graphiteLength + FERRULE_LENGTH + ERASER_LENGTH;

  const bodyPosition = -totalLength / 2 + bodyLength / 2;
  const ferrulePosition = bodyPosition - bodyLength / 2 - FERRULE_LENGTH / 2;
  const eraserPosition = ferrulePosition - FERRULE_LENGTH / 2 - ERASER_LENGTH / 2;
  const tipWoodPosition = bodyPosition + bodyLength / 2 + tipWoodLength / 2;
  const graphitePosition = tipWoodPosition + tipWoodLength / 2 + graphiteLength / 2;

  const woodColor = useMemo(() => {
    const base = new THREE.Color('#F5DEB3');
    const userColor = new THREE.Color(pencilColor);
    const hue = { h: 0, s: 0, l: 0 };
    userColor.getHSL(hue);
    base.offsetHSL(hue.h * 0.15, 0, hue.l * 0.05);
    return base;
  }, [pencilColor]);

  const paintColor = useMemo(() => new THREE.Color(pencilColor), [pencilColor]);

  const rootRotation: [number, number, number] = state === 'inserted'
    ? [0, 0, -Math.PI / 2]
    : [Math.PI / 2.3, -Math.PI / 4.5, Math.PI / 5];

  const WOOD_BASE_ENTRY = 0.02;

  const woodConeBaseLocalY = useMemo(() => {
    return -totalLength / 2 + bodyLength;
  }, [totalLength, bodyLength]);

  const rootPosition: [number, number, number] = state === 'inserted'
    ? [worldHoleX - woodConeBaseLocalY + WOOD_BASE_ENTRY + advanceAmount, worldY, 0]
    : [0.8, -0.45, 0.8];

  useFrame((_, delta) => {
    if (spinRef.current && spinning) {
      spinRef.current.rotation.y += delta * 12;
    }
  });

  return (
    <group ref={groupRef} position={rootPosition} rotation={rootRotation}>
      <group ref={spinRef}>
        <group position={[0, bodyPosition, 0]}>
          <Cylinder
            args={[PEN_RADIUS, PEN_RADIUS, bodyLength, HEX_SIDES, 1, false]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={paintColor}
              roughness={0.65}
              metalness={0.05}
            />
          </Cylinder>
        </group>

        <group position={[0, tipWoodPosition, 0]}>
          <Cylinder
            args={[graphiteBaseRadius, tipBaseRadius, tipWoodLength, HEX_SIDES, 1, false]}
            castShadow
          >
            <meshStandardMaterial
              color={woodColor}
              roughness={0.85}
              metalness={0}
            />
          </Cylinder>
        </group>

        <group position={[0, graphitePosition, 0]}>
          <Cylinder
            args={[0.001 + (1 - sharpness) * 0.02, graphiteBaseRadius, graphiteLength, 8, 1, false]}
            castShadow
          >
            <meshStandardMaterial
              color="#2A2A2A"
              roughness={0.3}
              metalness={0.4}
            />
          </Cylinder>
        </group>

        <group position={[0, ferrulePosition, 0]}>
          <Cylinder
            args={[PEN_RADIUS * 1.03, PEN_RADIUS * 1.03, FERRULE_LENGTH, HEX_SIDES, 1, false]}
            castShadow
          >
            <meshStandardMaterial
              color="#C0C0C0"
              roughness={0.35}
              metalness={0.85}
            />
          </Cylinder>
        </group>

        <group position={[0, eraserPosition, 0]}>
          <Cylinder
            args={[PEN_RADIUS * 1.02, PEN_RADIUS * 1.02, ERASER_LENGTH, HEX_SIDES, 1, false]}
            castShadow
          >
            <meshStandardMaterial
              color="#F8B1C9"
              roughness={0.7}
              metalness={0}
            />
          </Cylinder>
        </group>
      </group>
    </group>
  );
};

export default Pencil;
