import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Scene from '@/components/three/Scene';
import ControlPanel from '@/components/ui/ControlPanel';
import StatusToast from '@/components/ui/StatusToast';

export default function Home() {
  return (
    <div className="relative w-full h-full">
      <div className="grain-overlay" />

      <div className="absolute top-6 left-6 z-40 pointer-events-none">
        <h1 className="font-display text-3xl font-bold text-[#5D4037] drop-shadow-sm">
          3D 卷笔刀
        </h1>
        <p className="text-sm text-[#8D6E63] mt-1 font-medium">
          拖拽右侧摇柄 · 感受治愈的削铅笔时光
        </p>
      </div>

      <Canvas
        shadows
        camera={{ position: [5.5, 3.0, 3.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#F5E6D3']} />
        <fog attach="fog" args={['#F5E6D3', 8, 18]} />

        <Suspense
          fallback={
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial color="#FFC107" wireframe />
            </mesh>
          }
        >
          <Scene />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-6 left-6 z-40 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
          <div className="w-2 h-2 rounded-full bg-[#8D6E63] animate-pulse" />
          <span className="text-xs text-[#5D4037] font-medium">
            鼠标右键环绕 · 滚轮缩放
          </span>
        </div>
      </div>

      <ControlPanel />
      <StatusToast />

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#E8D4BC]/40 to-transparent pointer-events-none z-20" />
    </div>
  );
}
