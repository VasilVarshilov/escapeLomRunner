/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-nocheck

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GameStatus } from '../../types';

// Geometry constants for Nikolai & Boat
const BOAT_HULL = new THREE.BoxGeometry(4, 1.5, 8);
const BOAT_CABIN = new THREE.BoxGeometry(3, 2, 2);

// Giant Nikolai
const GIANT_BODY = new THREE.CylinderGeometry(1.2, 1.0, 3, 8);
const GIANT_HEAD = new THREE.BoxGeometry(1.0, 1.2, 1.0);
const GIANT_HAT = new THREE.ConeGeometry(1.5, 1, 16);
const GIANT_ARM = new THREE.CylinderGeometry(0.4, 0.4, 3, 8);

const ROD_GEO = new THREE.CylinderGeometry(0.05, 0.1, 10, 8);

export const Boss: React.FC<{ active: boolean }> = ({ active }) => {
    const groupRef = useRef<THREE.Group>(null);
    const eyesRef = useRef<THREE.Group>(null);
    const rodRef = useRef<THREE.Group>(null);
    const laserRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        
        const time = state.clock.elapsedTime;
        
        // Find player to stay near them (side-scrolling effect)
        const playerGroup = state.scene.getObjectByName('PlayerGroup');
        if (playerGroup) {
            // Keep boss alongside player in Z, but offset to the side
            groupRef.current.position.z = playerGroup.children[0].position.z + 10; 
            groupRef.current.position.x = -12; // River side
            // Bobbing on water
            groupRef.current.position.y = -1 + Math.sin(time) * 0.5;
        }

        // Rod Animation
        if (rodRef.current) {
            rodRef.current.rotation.z = Math.sin(time * 2) * 0.2 - 0.5;
        }

        // Laser Eyes Logic (Visuals only here, logic in LevelManager)
        if (active && Math.floor(time) % 10 > 8) {
            // Laser phase (last 2 seconds of every 10)
            if (laserRef.current) {
                laserRef.current.visible = true;
                // Random flicker
                laserRef.current.scale.set(1, 1, Math.random() * 20 + 10);
            }
        } else {
            if (laserRef.current) laserRef.current.visible = false;
        }
    });

    if (!active) return null;

    return (
        <group ref={groupRef}>
             {/* --- BOAT --- */}
             <mesh geometry={BOAT_HULL} position={[0, 0, 0]}>
                 <meshStandardMaterial color="#8B4513" />
             </mesh>
             <mesh geometry={BOAT_CABIN} position={[0, 1.5, -2]}>
                 <meshStandardMaterial color="#A0522D" />
             </mesh>
             <mesh position={[0, 2.5, -2]} rotation={[0,0,0]}>
                 <cylinderGeometry args={[0.2, 0.2, 3]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
             {/* Flag */}
             <mesh position={[0, 3.5, -2]} rotation={[0, -Math.PI/2, 0]}>
                 <planeGeometry args={[1.5, 1]} />
                 <meshStandardMaterial color="white" />
             </mesh>

             {/* --- NIKOLAI (GIANT) --- */}
             <group position={[0, 1, 1]}>
                 {/* Body */}
                 <mesh geometry={GIANT_BODY} position={[0, 1.5, 0]}>
                     <meshStandardMaterial color="#000080" /> {/* Blue shirt */}
                 </mesh>
                 {/* Head */}
                 <group position={[0, 3.5, 0]}>
                     <mesh geometry={GIANT_HEAD}>
                         <meshStandardMaterial color="#ffccaa" />
                     </mesh>
                     {/* Beard */}
                     <mesh position={[0, -0.4, 0.4]} scale={[1.1, 0.8, 0.5]}>
                         <boxGeometry />
                         <meshStandardMaterial color="#333" />
                     </mesh>
                     {/* Hat */}
                     <mesh geometry={GIANT_HAT} position={[0, 0.8, 0]}>
                         <meshStandardMaterial color="#FFFF00" />
                     </mesh>
                     
                     {/* Eyes / Laser Origin */}
                     <group ref={eyesRef} position={[0, 0.1, 0.5]}>
                         <mesh position={[0.2, 0, 0]}>
                             <sphereGeometry args={[0.1]} />
                             <meshBasicMaterial color="red" />
                         </mesh>
                         <mesh position={[-0.2, 0, 0]}>
                             <sphereGeometry args={[0.1]} />
                             <meshBasicMaterial color="red" />
                         </mesh>
                         
                         {/* Laser Beams Container */}
                         <group ref={laserRef} visible={false}>
                              <mesh position={[0.2, 0, 10]} rotation={[Math.PI/2, 0, 0]}>
                                  <cylinderGeometry args={[0.1, 0.1, 20]} />
                                  <meshBasicMaterial color="red" transparent opacity={0.6} />
                              </mesh>
                              <mesh position={[-0.2, 0, 10]} rotation={[Math.PI/2, 0, 0]}>
                                  <cylinderGeometry args={[0.1, 0.1, 20]} />
                                  <meshBasicMaterial color="red" transparent opacity={0.6} />
                              </mesh>
                         </group>
                     </group>
                 </group>
                 
                 {/* Arms & Rod */}
                 <group position={[1.2, 2.5, 0]} rotation={[0, 0, -0.5]}>
                      <mesh geometry={GIANT_ARM} />
                      <group ref={rodRef} position={[0, -1.5, 0]} rotation={[0, 0, 1.5]}>
                          <mesh geometry={ROD_GEO} position={[0, 5, 0]}>
                              <meshStandardMaterial color="#333" />
                          </mesh>
                          {/* Fishing Line */}
                          <lineSegments>
                              <bufferGeometry>
                                  <bufferAttribute 
                                    attach="attributes-position"
                                    count={2}
                                    array={new Float32Array([0, 10, 0, 0, -2, 0])}
                                    itemSize={3}
                                  />
                              </bufferGeometry>
                              <lineBasicMaterial color="white" />
                          </lineSegments>
                      </group>
                 </group>
                 <group position={[-1.2, 2.5, 0]} rotation={[0, 0, 0.5]}>
                      <mesh geometry={GIANT_ARM} />
                 </group>
             </group>
        </group>
    );
};
