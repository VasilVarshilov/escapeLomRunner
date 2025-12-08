/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';

const Fireflies: React.FC = () => {
  const speed = useStore(state => state.speed);
  const count = 500; 
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 100;
      let y = Math.random() * 20;
      let z = -200 + Math.random() * 250;

      pos[i * 3] = x;     
      pos[i * 3 + 1] = y; 
      pos[i * 3 + 2] = z; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2; 

    for (let i = 0; i < count; i++) {
        let z = positions[i * 3 + 2];
        z += activeSpeed * delta * 0.8; // Move slightly slower than player for depth
        
        if (z > 50) {
            z = -200; 
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 20;
        }
        positions[i * 3 + 2] = z;
        
        // Bobbing
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#ffff00"
        transparent
        opacity={0.6}
      />
    </points>
  );
};

const LaneGuides: React.FC = () => {
    const { laneCount } = useStore();
    
    // Create wooden plank look for the lanes
    const floorWidth = laneCount * LANE_WIDTH + 2;

    return (
        <group position={[0, -0.1, 0]}>
            {/* Main Road/Bridge Deck */}
            <mesh position={[0, 0, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[floorWidth, 300]} />
                <meshStandardMaterial color="#5c4033" roughness={0.9} />
            </mesh>
            
            {/* Markings */}
            {Array.from({ length: laneCount - 1 }).map((_, i) => {
                 const x = -((laneCount * LANE_WIDTH)/2) + (i + 1) * LANE_WIDTH;
                 return (
                    <mesh key={i} position={[x, 0.01, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.1, 300]} />
                        <meshBasicMaterial color="#3e2b22" opacity={0.5} transparent />
                    </mesh>
                 )
            })}
        </group>
    );
};

const Sun: React.FC = () => {
    return (
        <group position={[0, 40, -150]}>
            <mesh>
                <sphereGeometry args={[20, 32, 32]} />
                <meshBasicMaterial color="#ffdd00" />
            </mesh>
        </group>
    );
};

const Water: React.FC = () => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
             const time = state.clock.elapsedTime;
             ref.current.position.y = -2 + Math.sin(time) * 0.2;
        }
    });

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -100]}>
            <planeGeometry args={[1000, 1000, 20, 20]} />
            <meshStandardMaterial 
                color="#006994" 
                roughness={0.1}
                metalness={0.1}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
}

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 30, 120]} />
      
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[50, 50, -20]} intensity={1.2} color="#fff" castShadow />
      
      <Fireflies />
      <Water />
      <LaneGuides />
      
      <Sun />
      
      {/* Side Grass Banks */}
      <mesh position={[-40, -1, -50]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[60, 300]} />
          <meshStandardMaterial color="#2d5a27" />
      </mesh>
      <mesh position={[40, -1, -50]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[60, 300]} />
          <meshStandardMaterial color="#2d5a27" />
      </mesh>
    </>
  );
};
