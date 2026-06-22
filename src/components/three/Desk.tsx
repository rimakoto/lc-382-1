import React from 'react';
import { OrbitControls } from '@react-three/drei';

const Desk: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.55} color="#FFE8CC" />
      <spotLight
        position={[2.5, 5.5, 3]}
        angle={0.55}
        penumbra={0.6}
        intensity={1.3}
        color="#FFF5E6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.35}
        color="#E8F0FF"
      />
      <directionalLight
        position={[3, 1.5, 3]}
        intensity={0.25}
        color="#FFE4CC"
      />
      <pointLight position={[0, 1.5, 1.5]} intensity={0.3} color="#FFE8CC" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 10]} />
        <meshStandardMaterial
          color="#C9A67B"
          roughness={0.8}
          metalness={0.02}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.79, 0]} receiveShadow>
        <planeGeometry args={[11.6, 9.6]} />
        <meshStandardMaterial
          color="#E0C49A"
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.1}
        target={[-0.4, 0, 0.4]}
      />
    </>
  );
};

export default Desk;
