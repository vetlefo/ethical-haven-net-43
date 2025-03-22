
import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CyberModel from './CyberModel';

const ThreeDBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-80">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0 
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.7} />
        <Suspense fallback={null}>
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
          <CyberModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeDBackground;
