
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Html } from '@react-three/drei';
import * as THREE from 'three';

const CyberShield = () => {
  const shieldRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  
  // Rotate the shield model
  useFrame((state, delta) => {
    if (shieldRef.current) {
      shieldRef.current.rotation.y += delta * 0.2;
    }
    
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <group>
      {/* Shield base */}
      <group ref={shieldRef}>
        <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#0ea5e9" 
            opacity={0.6} 
            transparent 
            wireframe 
          />
        </Sphere>
        
        <Sphere args={[1.3, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#0f172a" 
            opacity={0.9} 
            transparent 
          />
        </Sphere>
        
        {/* Inner shield details */}
        <Torus args={[0.8, 0.1, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
        </Torus>
      </group>
      
      {/* Orbiting elements */}
      <group ref={orbitRef}>
        {/* Data packets orbiting the shield */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 2.5;
          const z = Math.sin(angle) * 2.5;
          return (
            <mesh key={i} position={[x, 0, z]} scale={0.1}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
          );
        })}
      </group>
      
      {/* Small floating labels */}
      <Html position={[0, 2.2, 0]} center style={{ width: '200px', textAlign: 'center' }}>
        <div className="text-cyber-blue text-sm font-mono opacity-70 pointer-events-none">SECURE</div>
      </Html>
    </group>
  );
};

const CyberModel = () => {
  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      <CyberShield />
    </group>
  );
};

export default CyberModel;
