import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { usePencilStore, PencilState } from '../../store/usePencilStore';
import Desk from './Desk';
import Sharpener from './Sharpener';
import Pencil from './Pencil';
import ShavingParticles from './ShavingParticles';

const Scene: React.FC = () => {
  const { pencil, session, actions } = usePencilStore();
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, delta) => {
    actions.applyInertia(delta);
  });

  const spinning =
    pencil.state === PencilState.SHARPENING || session.isDragging;

  const pencilState: 'inserted' | 'removed' =
    pencil.state === PencilState.REMOVED ? 'removed' : 'inserted';

  const advanceAmount = pencil.totalLength - pencil.currentLength;
  const sharpenerY = -0.2;
  const SHARPENER_HOLE_WORLD_Y = sharpenerY + 0.35;
  const SHARPENER_HOLE_WORLD_X = -0.71;

  return (
    <>
      <Desk />

      <group position={[0, sharpenerY, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Sharpener
          onCrankDrag={actions.updateCrankRotation}
          crankAngle={session.crankAngle}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
        />
        <ShavingParticles spawnCount={session.shavingsCount} />
      </group>

      <Pencil
        length={pencil.currentLength}
        sharpness={pencil.sharpness}
        pencilColor={pencil.color}
        spinning={spinning}
        state={pencilState}
        advanceAmount={advanceAmount}
        worldY={SHARPENER_HOLE_WORLD_Y}
        worldHoleX={SHARPENER_HOLE_WORLD_X}
      />

      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        <Vignette offset={0.5} darkness={0.5} />
      </EffectComposer>
    </>
  );
};

export default Scene;
