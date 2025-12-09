/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-nocheck

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Center, Float, Html } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, LETTER_COLORS } from '../../types';
import { audio } from '../System/Audio';

// --- GEOMETRY CONSTANTS ---

// NEW ZOMBIE GEOMETRIES (Realistic style)
const ZOMBIE_TORSO = new THREE.BoxGeometry(0.45, 0.6, 0.25);
const ZOMBIE_LEG = new THREE.BoxGeometry(0.18, 0.7, 0.18);
const ZOMBIE_HEAD = new THREE.BoxGeometry(0.3, 0.35, 0.3);
const ZOMBIE_ARM = new THREE.BoxGeometry(0.12, 0.65, 0.12);

// BOTTLE (Missile)
const BOTTLE_BODY = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
const BOTTLE_NECK = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);

// BARREL
const BARREL_GEO = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 12);

// CRATE (ZigZag)
const CRATE_GEO = new THREE.BoxGeometry(0.8, 0.6, 0.8);
const CRATE_INNER_GEO = new THREE.BoxGeometry(0.7, 0.1, 0.7);

// CAT
const CAT_BODY_GEO = new THREE.BoxGeometry(0.25, 0.25, 0.5);
const CAT_HEAD_GEO = new THREE.BoxGeometry(0.22, 0.2, 0.2);
const CAT_EAR_GEO = new THREE.ConeGeometry(0.05, 0.1, 4);
const CAT_LEG_GEO = new THREE.BoxGeometry(0.06, 0.2, 0.06);
const CAT_TAIL_GEO = new THREE.CylinderGeometry(0.03, 0.02, 0.35, 8);

// NEW OBSTACLES
const HAY_GEO = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16); // Hay Bale
const POTHOLE_GEO = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16); // Pothole (flat)
const CAR_BODY_GEO = new THREE.BoxGeometry(1.8, 0.7, 3.5); // Old Car body
const CAR_TOP_GEO = new THREE.BoxGeometry(1.4, 0.6, 1.8); // Car Cabin
const CAR_WHEEL_GEO = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);

// FISH (Gem)
const FISH_BODY = new THREE.ConeGeometry(0.3, 0.6, 8);

// SHOP
const SHOP_FRAME_GEO = new THREE.BoxGeometry(1, 7, 1);
const SHOP_BACK_GEO = new THREE.BoxGeometry(1, 5, 1.2);

// --- MOVEMENT SPEEDS ---
const MISSILE_SPEED = 12; 
const BARREL_SPEED_X = 5;
const CAT_SPEED_X = 4;
const CRATE_ZIGZAG_SPEED = 3;

const PARTICLE_COUNT = 600;
const BASE_LETTER_INTERVAL = 150; 

const getLetterInterval = (level: number) => {
    return BASE_LETTER_INTERVAL * Math.pow(1.5, Math.max(0, level - 1));
};

// --- Particle System ---
const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        color: new THREE.Color()
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position, color } = e.detail;
            let spawned = 0;
            const burstAmount = 40; 

            for(let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.life = 1.0 + Math.random() * 0.5; 
                    p.pos.set(position[0], position[1], position[2]);
                    
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const speed = 2 + Math.random() * 10;
                    
                    p.vel.set(
                        Math.sin(phi) * Math.cos(theta),
                        Math.sin(phi) * Math.sin(theta),
                        Math.cos(phi)
                    ).multiplyScalar(speed);

                    p.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    p.rotVel.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(5);
                    
                    p.color.set(color);
                    
                    spawned++;
                    if (spawned >= burstAmount) break;
                }
            }
        };
        
        window.addEventListener('particle-burst', handleExplosion as any);
        return () => window.removeEventListener('particle-burst', handleExplosion as any);
    }, [particles]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        const safeDelta = Math.min(delta, 0.1);

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= safeDelta * 1.5;
                p.pos.addScaledVector(p.vel, safeDelta);
                p.vel.y -= safeDelta * 5; 
                p.vel.multiplyScalar(0.98);

                p.rot.x += p.rotVel.x * safeDelta;
                p.rot.y += p.rotVel.y * safeDelta;
                
                dummy.position.copy(p.pos);
                const scale = Math.max(0, p.life * 0.25);
                dummy.scale.set(scale, scale, scale);
                
                dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
                dummy.updateMatrix();
                
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.scale.set(0,0,0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });
        
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
        </instancedMesh>
    );
};


const getRandomLane = (laneCount: number) => {
    const max = Math.floor(laneCount / 2);
    return Math.floor(Math.random() * (max * 2 + 1)) - max;
};

export const LevelManager: React.FC = () => {
  const { 
    status, 
    speed, 
    collectGem, 
    collectLetter, 
    collectedLetters,
    laneCount,
    setDistance,
    openShop,
    level,
    targetWord,
    increaseSpeed
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const prevLevel = useRef(level);
  const speedTimer = useRef(0);

  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextLetterDistance = useRef(BASE_LETTER_INTERVAL);

  // Handle resets and transitions
  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && prevStatus.current === GameStatus.GAME_OVER;
    const isMenuReset = status === GameStatus.MENU;
    const isLevelUp = level !== prevLevel.current && status === GameStatus.PLAYING;
    const isVictoryReset = status === GameStatus.PLAYING && prevStatus.current === GameStatus.VICTORY;

    if (isMenuReset || isRestart || isVictoryReset) {
        objectsRef.current = [];
        setRenderTrigger(t => t + 1);
        
        distanceTraveled.current = 0;
        nextLetterDistance.current = getLetterInterval(1);
        speedTimer.current = 0;

    } else if (isLevelUp && level > 1) {
        objectsRef.current = objectsRef.current.filter(obj => obj.position[2] > -80);

        objectsRef.current.push({
            id: uuidv4(),
            type: ObjectType.SHOP_PORTAL,
            position: [0, 0, -100], 
            active: true,
        });
        
        nextLetterDistance.current = distanceTraveled.current - SPAWN_DISTANCE + getLetterInterval(level);
        setRenderTrigger(t => t + 1);
        speedTimer.current = 0;
        
    } else if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
        setDistance(Math.floor(distanceTraveled.current));
    }
    
    prevStatus.current = status;
    prevLevel.current = level;
  }, [status, level, setDistance]);

  useFrame((state) => {
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;
    
    // Timer Speed Increase
    speedTimer.current += delta;
    if (speedTimer.current >= 45) {
        increaseSpeed(5);
        speedTimer.current = 0;
    }

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    
    distanceTraveled.current += dist;

    let hasChanges = false;
    let playerPos = new THREE.Vector3(0, 0, 0);
    
    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
    }

    const currentObjects = objectsRef.current;
    const keptObjects: GameObject[] = [];
    const newSpawns: GameObject[] = [];
    const elapsedTime = state.clock.elapsedTime;

    for (const obj of currentObjects) {
        let moveAmount = dist;
        
        // --- MOVEMENT LOGIC ---

        // Missile (Bottle) moves faster
        if (obj.type === ObjectType.MISSILE) {
            moveAmount += MISSILE_SPEED * safeDelta;
        }
        
        const prevZ = obj.position[2];
        obj.position[2] += moveAmount;

        // Barrel: Moves Right to Left across ground
        if (obj.type === ObjectType.BARREL) {
            // Slight speed increase on higher levels
            const speedMod = 1 + (level * 0.1);
            obj.position[0] += (obj.directionX || -1) * BARREL_SPEED_X * speedMod * safeDelta;
        }
        
        // Crate: ZigZag motion
        if (obj.type === ObjectType.ZIGZAG_CRATE) {
             const freq = 3.0;
             const amp = 2.0; 
             // Using position[2] (Z) to drive sine wave creates a consistent path on the road
             obj.position[0] = (obj.initialX || 0) + Math.sin((obj.position[2] * 0.1) + (obj.zigzagPhase || 0)) * amp;
        }

        // Cat: Crosses the road
        if (obj.type === ObjectType.CAT) {
            obj.position[0] += (obj.directionX || 1) * CAT_SPEED_X * safeDelta;
        }
        
        // Alien Firing Logic
        if (obj.type === ObjectType.ALIEN && obj.active && !obj.hasFired) {
             if (obj.position[2] > -90) {
                 obj.hasFired = true;
                 
                 newSpawns.push({
                     id: uuidv4(),
                     type: ObjectType.MISSILE,
                     position: [obj.position[0], 1.5, obj.position[2] + 2], 
                     active: true,
                     color: '#00aa00'
                 });
                 hasChanges = true;
                 window.dispatchEvent(new CustomEvent('particle-burst', { 
                    detail: { position: obj.position, color: '#00aa00' } 
                 }));
             }
        }

        let keep = true;
        if (obj.active) {
            const zThreshold = 2.0; 
            const inZZone = (prevZ < playerPos.z + zThreshold) && (obj.position[2] > playerPos.z - zThreshold);
            
            if (obj.type === ObjectType.SHOP_PORTAL) {
                const dz = Math.abs(obj.position[2] - playerPos.z);
                if (dz < 2) { 
                     openShop();
                     obj.active = false;
                     hasChanges = true;
                     keep = false; 
                }
            } else if (inZZone) {
                const dx = Math.abs(obj.position[0] - playerPos.x);
                let hitWidth = 0.9;
                
                // Adjust hitbox widths based on type
                if (obj.type === ObjectType.BARREL) hitWidth = 1.2;
                if (obj.type === ObjectType.ZIGZAG_CRATE) hitWidth = 1.0;
                if (obj.type === ObjectType.CAT) hitWidth = 0.8;
                if (obj.type === ObjectType.OLD_CAR) hitWidth = 2.0; // Wide
                if (obj.type === ObjectType.HAY_BALE) hitWidth = 1.1;

                if (dx < hitWidth) { 
                     
                     const isDamageSource = [
                        ObjectType.OBSTACLE, ObjectType.ALIEN, ObjectType.MISSILE, 
                        ObjectType.BARREL, ObjectType.ZIGZAG_CRATE, ObjectType.CAT,
                        ObjectType.POTHOLE, ObjectType.OLD_CAR, ObjectType.HAY_BALE
                     ].includes(obj.type);
                     
                     if (isDamageSource) {
                         const playerBottom = playerPos.y;
                         const playerTop = playerPos.y + 1.8; 

                         // Define Object Vertical Bounds
                         let objBottom = obj.position[1] - 0.5;
                         let objTop = obj.position[1] + 0.5;

                         if (obj.type === ObjectType.OBSTACLE) {
                             objBottom = 0; objTop = 1.6;
                         } else if (obj.type === ObjectType.MISSILE) {
                             objBottom = 0.5; objTop = 1.5;
                         } else if (obj.type === ObjectType.BARREL) {
                             objBottom = 0; objTop = 1.0; // Jumpable
                         } else if (obj.type === ObjectType.CAT) {
                             objBottom = 0; objTop = 0.5; // Small, Jumpable
                         } else if (obj.type === ObjectType.ZIGZAG_CRATE) {
                             objBottom = 0; objTop = 0.8; // Jumpable
                         } else if (obj.type === ObjectType.POTHOLE) {
                             objBottom = -0.1; objTop = 0.2; // Floor Hazard - Must Jump Over
                         } else if (obj.type === ObjectType.HAY_BALE) {
                             objBottom = 0; objTop = 1.2; // Jumpable
                         } else if (obj.type === ObjectType.OLD_CAR) {
                             objBottom = 0; objTop = 2.0; // NOT Jumpable (too high) - Must Dodge
                         }

                         const isHit = (playerBottom < objTop) && (playerTop > objBottom);

                         if (isHit) { 
                             window.dispatchEvent(new Event('player-hit'));
                             obj.active = false; 
                             hasChanges = true;
                             
                             let pColor = '#ffffff';
                             if (obj.type === ObjectType.MISSILE) pColor = '#aaffaa';
                             if (obj.type === ObjectType.BARREL) pColor = '#8B4513';
                             if (obj.type === ObjectType.ZIGZAG_CRATE) pColor = '#FFD700';
                             if (obj.type === ObjectType.CAT) pColor = '#000000';
                             if (obj.type === ObjectType.POTHOLE) pColor = '#333333';
                             if (obj.type === ObjectType.OLD_CAR) pColor = '#cc0000';
                             if (obj.type === ObjectType.HAY_BALE) pColor = '#eebb00';

                             window.dispatchEvent(new CustomEvent('particle-burst', { 
                                detail: { position: obj.position, color: pColor } 
                             }));
                         }
                     } else {
                         // Collectible
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 2.5) { 
                            if (obj.type === ObjectType.GEM) {
                                collectGem(obj.points || 50);
                                audio.playGemCollect();
                            }
                            if (obj.type === ObjectType.LETTER && obj.targetIndex !== undefined) {
                                collectLetter(obj.targetIndex);
                                audio.playLetterCollect();
                            }
                            
                            window.dispatchEvent(new CustomEvent('particle-burst', { 
                                detail: { 
                                    position: obj.position, 
                                    color: obj.color || '#ffffff' 
                                } 
                            }));

                            obj.active = false;
                            hasChanges = true;
                         }
                     }
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE) {
            keep = false;
            hasChanges = true;
        }

        if (keep) {
            keptObjects.push(obj);
        }
    }

    if (newSpawns.length > 0) {
        keptObjects.push(...newSpawns);
    }

    // --- SPAWNING LOGIC ---
    let furthestZ = 0;
    // CRITICAL FIX: Only exclude MISSILES from spacing logic.
    const spacingObjects = keptObjects.filter(o => o.type !== ObjectType.MISSILE);
    
    if (spacingObjects.length > 0) {
        furthestZ = Math.min(...spacingObjects.map(o => o.position[2]));
    } else {
        furthestZ = -20;
    }

    if (furthestZ > -SPAWN_DISTANCE) {
         const minGap = 12 + (speed * 0.4); 
         const spawnZ = Math.min(furthestZ - minGap, -SPAWN_DISTANCE);
         
         const isLetterDue = distanceTraveled.current >= nextLetterDistance.current;

         if (isLetterDue) {
             const lane = getRandomLane(laneCount);
             const availableIndices = targetWord.map((_, i) => i).filter(i => !collectedLetters.includes(i));

             if (availableIndices.length > 0) {
                 const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                 const val = targetWord[chosenIndex];
                 const color = LETTER_COLORS[chosenIndex % LETTER_COLORS.length];

                 keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.LETTER,
                    position: [lane * LANE_WIDTH, 1.0, spawnZ], 
                    active: true,
                    color: color,
                    value: val,
                    targetIndex: chosenIndex
                 });
                 
                 nextLetterDistance.current += getLetterInterval(level);
                 hasChanges = true;
             } else {
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.GEM,
                    position: [lane * LANE_WIDTH, 1.2, spawnZ],
                    active: true,
                    color: '#ffaa00',
                    points: 50
                });
                hasChanges = true;
             }

         } else if (Math.random() > 0.1) {
            
            const isObstacle = Math.random() > 0.20;

            if (isObstacle) {
                const rand = Math.random();

                // DYNAMIC OBSTACLES DISTRIBUTION
                
                // BARREL (Rolling)
                if (rand < 0.12) {
                    const startX = (laneCount * LANE_WIDTH / 2) + 4; 
                    keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.BARREL,
                        position: [startX, 0.5, spawnZ], 
                        active: true,
                        directionX: -1 
                    });
                }
                // CAT (Crossing)
                else if (rand < 0.20) {
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    const startX = direction === 1 ? -6 : 6;
                    keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.CAT,
                        position: [startX, 0.2, spawnZ],
                        active: true,
                        directionX: direction
                    });
                }
                // ZIGZAG CRATE
                else if (level >= 2 && rand < 0.28) {
                    const lane = getRandomLane(laneCount);
                    const laneX = lane * LANE_WIDTH;
                    keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.ZIGZAG_CRATE,
                        position: [laneX, 0.3, spawnZ],
                        active: true,
                        initialX: laneX,
                        zigzagPhase: Math.random() * Math.PI * 2
                    });
                }
                // POTHOLE (Floor Hazard)
                else if (rand < 0.40) {
                    const lane = getRandomLane(laneCount);
                    const laneX = lane * LANE_WIDTH;
                    keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.POTHOLE,
                        position: [laneX, 0.05, spawnZ],
                        active: true
                    });
                }
                // HAY BALE
                else if (rand < 0.50) {
                     const lane = getRandomLane(laneCount);
                     const laneX = lane * LANE_WIDTH;
                     keptObjects.push({
                         id: uuidv4(),
                         type: ObjectType.HAY_BALE,
                         position: [laneX, 0.6, spawnZ],
                         active: true
                     });
                }
                // OLD CAR
                else if (level >= 3 && rand < 0.58) {
                     const lane = getRandomLane(laneCount);
                     const laneX = lane * LANE_WIDTH;
                     keptObjects.push({
                         id: uuidv4(),
                         type: ObjectType.OLD_CAR,
                         position: [laneX, 0.6, spawnZ],
                         active: true
                     });
                }
                // ALIEN (Group) - Level 4+
                else if (level >= 4 && rand < 0.65) {
                    const availableLanes = [];
                    const maxLane = Math.floor(laneCount / 2);
                    for (let i = -maxLane; i <= maxLane; i++) availableLanes.push(i);
                    availableLanes.sort(() => Math.random() - 0.5);

                    const count = Math.min(2, availableLanes.length);
                    for (let k = 0; k < count; k++) {
                        const lane = availableLanes[k];
                        keptObjects.push({
                            id: uuidv4(),
                            type: ObjectType.ALIEN,
                            position: [lane * LANE_WIDTH, 1.5, spawnZ],
                            active: true,
                            color: '#00aa00',
                            hasFired: false
                        });
                    }
                }
                // STANDARD ZOMBIE (Default)
                else {
                    const availableLanes = [];
                    const maxLane = Math.floor(laneCount / 2);
                    for (let i = -maxLane; i <= maxLane; i++) availableLanes.push(i);
                    availableLanes.sort(() => Math.random() - 0.5);
                    
                    const countToSpawn = Math.random() > 0.7 ? 2 : 1;

                    for (let i = 0; i < Math.min(countToSpawn, availableLanes.length); i++) {
                        const lane = availableLanes[i];
                        const laneX = lane * LANE_WIDTH;
                        
                        keptObjects.push({
                            id: uuidv4(),
                            type: ObjectType.OBSTACLE,
                            position: [laneX, 0.8, spawnZ],
                            active: true,
                            color: '#556655'
                        });

                        if (Math.random() < 0.3) {
                             keptObjects.push({
                                id: uuidv4(),
                                type: ObjectType.GEM,
                                position: [laneX, 2.5, spawnZ],
                                active: true,
                                color: '#ffaa00',
                                points: 100
                            });
                        }
                    }
                }

            } else {
                const lane = getRandomLane(laneCount);
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.GEM,
                    position: [lane * LANE_WIDTH, 1.2, spawnZ],
                    active: true,
                    color: '#ffaa00',
                    points: 50
                });
            }
            hasChanges = true;
         }
    }

    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }
  });

  return (
    <group>
      <ParticleSystem />
      {objectsRef.current.map(obj => {
        if (!obj.active) return null;
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const visualRef = useRef<THREE.Group>(null);
    
    // Zombie Animation Refs
    const lArmRef = useRef<THREE.Group>(null);
    const rArmRef = useRef<THREE.Group>(null);
    const lLegRef = useRef<THREE.Group>(null);
    const rLegRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);

    const { laneCount } = useStore();
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], 0, data.position[2]);
        }

        if (visualRef.current) {
            const baseHeight = data.position[1];
            const time = state.clock.elapsedTime;
            
            if (data.type === ObjectType.SHOP_PORTAL) {
                 visualRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
            } else if (data.type === ObjectType.MISSILE) {
                 visualRef.current.rotation.x += delta * 10;
                 visualRef.current.rotation.z += delta * 5;
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.ALIEN) {
                 visualRef.current.position.y = baseHeight + Math.sin(time * 5) * 0.1;
            } else if (data.type === ObjectType.BARREL) {
                 // Roll
                 visualRef.current.rotation.z -= delta * 5 * (data.directionX || -1);
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.CAT) {
                 // Run bobbing
                 visualRef.current.position.y = baseHeight + Math.abs(Math.sin(time * 15)) * 0.1;
                 // Face direction
                 visualRef.current.rotation.y = (data.directionX || 1) > 0 ? Math.PI / 2 : -Math.PI / 2;
            } else if (data.type === ObjectType.ZIGZAG_CRATE) {
                 // Slide tilt
                 visualRef.current.rotation.z = Math.sin(time * 5) * 0.05;
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.OBSTACLE) {
                 // Realistic Zombie Animation
                 visualRef.current.position.y = baseHeight + Math.abs(Math.sin(time * 6)) * 0.05; // Shuffle hop
                 visualRef.current.rotation.z = Math.sin(time * 4) * 0.05; // Lumbering sway

                 if (lArmRef.current) lArmRef.current.rotation.x = -1.5 + Math.sin(time * 4) * 0.3; // Reaching
                 if (rArmRef.current) rArmRef.current.rotation.x = -1.5 + Math.cos(time * 4) * 0.3; // Reaching
                 
                 // Walking legs
                 if (lLegRef.current) lLegRef.current.rotation.x = Math.sin(time * 8) * 0.5;
                 if (rLegRef.current) rLegRef.current.rotation.x = Math.sin(time * 8 + Math.PI) * 0.5;
                 
                 // Head twitch
                 if (headRef.current) headRef.current.rotation.y = Math.sin(time * 2) * 0.2;
            } else if (data.type === ObjectType.OLD_CAR) {
                 visualRef.current.position.y = 0.5; // On ground
            } else if (data.type === ObjectType.POTHOLE) {
                 visualRef.current.position.y = 0.02; // On ground
            } else if (data.type === ObjectType.HAY_BALE) {
                 visualRef.current.position.y = baseHeight;
            } else {
                // Fish / Letter Bobbing
                visualRef.current.rotation.y += delta * 2;
                if (data.type === ObjectType.GEM) {
                     visualRef.current.rotation.z = Math.sin(time * 10) * 0.2;
                }
                const bobOffset = Math.sin(time * 4 + data.position[0]) * 0.1;
                visualRef.current.position.y = baseHeight + bobOffset;
            }
        }
    });

    return (
        <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
            <group ref={visualRef} position={[0, data.position[1], 0]}>
                
                {/* --- SHOP PORTAL --- */}
                {data.type === ObjectType.SHOP_PORTAL && (
                    <group>
                         <mesh position={[0, 3, 0]} geometry={SHOP_FRAME_GEO} scale={[laneCount * LANE_WIDTH + 2, 1, 1]}>
                             <meshStandardMaterial color="#4a3b2a" />
                         </mesh>
                         <mesh position={[0, 2, 0]} geometry={SHOP_BACK_GEO} scale={[laneCount * LANE_WIDTH, 1, 1]}>
                              <meshBasicMaterial color="#000000" />
                         </mesh>
                         <Html transform position={[0, 5, 0.6]} center>
                            <div className="text-white font-black text-3xl whitespace-nowrap font-cyber" style={{ 
                                textShadow: '0 0 10px rgba(255,255,255,0.8)',
                                userSelect: 'none'
                            }}>
                                Вече не си отЛомка
                            </div>
                         </Html>
                    </group>
                )}

                {/* --- REALISTIC ZOMBIE --- */}
                {data.type === ObjectType.OBSTACLE && (
                    <group>
                         {/* Torso (Dirty Shirt) */}
                         <mesh position={[0, 0.4, 0]} geometry={ZOMBIE_TORSO} castShadow>
                             <meshStandardMaterial color="#a8a890" roughness={0.9} />
                         </mesh>
                         {/* Head */}
                         <group ref={headRef} position={[0, 0.85, 0]}>
                             <mesh geometry={ZOMBIE_HEAD} castShadow>
                                 <meshStandardMaterial color="#8a9c8a" roughness={0.5} />
                             </mesh>
                             {/* Eyes */}
                             <mesh position={[0.08, 0.05, 0.151]}>
                                 <boxGeometry args={[0.05, 0.05, 0.01]} />
                                 <meshBasicMaterial color="red" />
                             </mesh>
                             <mesh position={[-0.08, 0.05, 0.151]}>
                                 <boxGeometry args={[0.05, 0.05, 0.01]} />
                                 <meshBasicMaterial color="red" />
                             </mesh>
                         </group>
                         {/* Arms */}
                         <group position={[0.3, 0.6, 0]} ref={rArmRef}>
                             <mesh position={[0, -0.25, 0]} geometry={ZOMBIE_ARM}>
                                 <meshStandardMaterial color="#8a9c8a" />
                             </mesh>
                         </group>
                         <group position={[-0.3, 0.6, 0]} ref={lArmRef}>
                             <mesh position={[0, -0.25, 0]} geometry={ZOMBIE_ARM}>
                                 <meshStandardMaterial color="#8a9c8a" />
                             </mesh>
                         </group>
                         {/* Legs (Pants) */}
                         <group position={[0.12, 0.1, 0]} ref={rLegRef}>
                             <mesh position={[0, -0.35, 0]} geometry={ZOMBIE_LEG}>
                                 <meshStandardMaterial color="#2d3a4d" />
                             </mesh>
                         </group>
                         <group position={[-0.12, 0.1, 0]} ref={lLegRef}>
                             <mesh position={[0, -0.35, 0]} geometry={ZOMBIE_LEG}>
                                 <meshStandardMaterial color="#2d3a4d" />
                             </mesh>
                         </group>
                    </group>
                )}

                {/* --- POTHOLE --- */}
                {data.type === ObjectType.POTHOLE && (
                    <mesh geometry={POTHOLE_GEO} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                        <meshStandardMaterial color="#1a1a1a" roughness={1} />
                    </mesh>
                )}

                {/* --- HAY BALE --- */}
                {data.type === ObjectType.HAY_BALE && (
                    <group rotation={[Math.PI/2, 0, Math.PI/4]}>
                        <mesh geometry={HAY_GEO} castShadow>
                            <meshStandardMaterial color="#d4b859" roughness={1} />
                        </mesh>
                        <mesh scale={[1.01, 0.1, 1.01]} rotation={[0, 0, 0]}>
                            <cylinderGeometry args={[0.8, 0.8, 1.2, 16]} />
                            <meshBasicMaterial color="#a68e3d" wireframe opacity={0.3} transparent />
                        </mesh>
                    </group>
                )}

                {/* --- OLD CAR (Moskvich style) --- */}
                {data.type === ObjectType.OLD_CAR && (
                    <group rotation={[0, Math.PI, 0]}>
                        <mesh position={[0, 0.4, 0]} geometry={CAR_BODY_GEO} castShadow>
                            <meshStandardMaterial color="#8B0000" roughness={0.6} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 1.0, -0.2]} geometry={CAR_TOP_GEO} castShadow>
                            <meshStandardMaterial color="#8B0000" roughness={0.6} metalness={0.3} />
                        </mesh>
                        {/* Windows */}
                        <mesh position={[0, 1.0, -0.2]} scale={[1.01, 0.8, 1.01]}>
                             <boxGeometry args={[1.4, 0.6, 1.8]} />
                             <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* Wheels */}
                        <mesh position={[0.7, 0.35, 1.0]} rotation={[0, 0, Math.PI/2]} geometry={CAR_WHEEL_GEO}>
                             <meshStandardMaterial color="#333" />
                        </mesh>
                        <mesh position={[-0.7, 0.35, 1.0]} rotation={[0, 0, Math.PI/2]} geometry={CAR_WHEEL_GEO}>
                             <meshStandardMaterial color="#333" />
                        </mesh>
                        <mesh position={[0.7, 0.35, -1.2]} rotation={[0, 0, Math.PI/2]} geometry={CAR_WHEEL_GEO}>
                             <meshStandardMaterial color="#333" />
                        </mesh>
                         <mesh position={[-0.7, 0.35, -1.2]} rotation={[0, 0, Math.PI/2]} geometry={CAR_WHEEL_GEO}>
                             <meshStandardMaterial color="#333" />
                        </mesh>
                    </group>
                )}

                {/* --- ALIEN (TOUGH ZOMBIE) --- */}
                {data.type === ObjectType.ALIEN && (
                    <group>
                        <mesh scale={[1.2, 1.2, 1.2]} geometry={ZOMBIE_TORSO} castShadow>
                            <meshStandardMaterial color="#550000" roughness={0.8} />
                        </mesh>
                         <mesh position={[0, 1.0, 0]} scale={[1.2, 1.2, 1.2]} geometry={ZOMBIE_HEAD}>
                             <meshStandardMaterial color="#660000" />
                        </mesh>
                    </group>
                )}

                {/* --- MISSILE (BEER BOTTLE) --- */}
                {data.type === ObjectType.MISSILE && (
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <mesh geometry={BOTTLE_BODY}>
                            <meshStandardMaterial color="#663300" transparent opacity={0.9} roughness={0.1} metalness={0.6} />
                        </mesh>
                        <mesh position={[0, 0.45, 0]} geometry={BOTTLE_NECK}>
                            <meshStandardMaterial color="#663300" transparent opacity={0.9} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                            <cylinderGeometry args={[0.155, 0.155, 0.3, 8]} />
                            <meshBasicMaterial color="#d4af37" />
                        </mesh>
                    </group>
                )}

                {/* --- BARREL (WINE) --- */}
                {data.type === ObjectType.BARREL && (
                     <group rotation={[Math.PI / 2, 0, Math.PI/2]}> 
                         <mesh geometry={BARREL_GEO} castShadow>
                             <meshStandardMaterial color="#8B4513" roughness={0.8} />
                         </mesh>
                         <mesh position={[0, 0.5, 0]}>
                              <cylinderGeometry args={[0.52, 0.52, 0.1, 12]} />
                              <meshStandardMaterial color="#333" metalness={0.8} />
                         </mesh>
                         <mesh position={[0, -0.5, 0]}>
                              <cylinderGeometry args={[0.52, 0.52, 0.1, 12]} />
                              <meshStandardMaterial color="#333" metalness={0.8} />
                         </mesh>
                     </group>
                )}

                {/* --- CAT --- */}
                {data.type === ObjectType.CAT && (
                    <group>
                        {/* Body */}
                        <mesh geometry={CAT_BODY_GEO} castShadow>
                            <meshStandardMaterial color="#111" roughness={0.8} />
                        </mesh>
                        {/* Head */}
                        <mesh position={[0.2, 0.15, 0]} geometry={CAT_HEAD_GEO}>
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* Ears */}
                        <mesh position={[0.25, 0.3, 0.08]} rotation={[0, 0, -0.2]} geometry={CAT_EAR_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                         <mesh position={[0.25, 0.3, -0.08]} rotation={[0, 0, -0.2]} geometry={CAT_EAR_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* Tail */}
                        <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, 0.5]} geometry={CAT_TAIL_GEO}>
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* Legs */}
                        <mesh position={[0.1, -0.2, 0.1]} geometry={CAT_LEG_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh position={[0.1, -0.2, -0.1]} geometry={CAT_LEG_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh position={[-0.1, -0.2, 0.1]} geometry={CAT_LEG_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh position={[-0.1, -0.2, -0.1]} geometry={CAT_LEG_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                )}

                {/* --- ZIGZAG CRATE --- */}
                {data.type === ObjectType.ZIGZAG_CRATE && (
                    <group>
                        {/* Crate Body (Yellow Plastic) */}
                        <mesh geometry={CRATE_GEO} castShadow>
                            <meshStandardMaterial color="#FFD700" roughness={0.4} />
                        </mesh>
                        {/* Inner bottles */}
                        <mesh position={[0, 0.3, 0]} geometry={CRATE_INNER_GEO}>
                             <meshStandardMaterial color="#2e1a05" />
                        </mesh>
                        {/* Label/Logo */}
                        <mesh position={[0, 0, 0.41]}>
                            <planeGeometry args={[0.4, 0.2]} />
                            <meshBasicMaterial color="red" />
                        </mesh>
                    </group>
                )}

                {/* --- GEM (FISH) --- */}
                {data.type === ObjectType.GEM && (
                    <group rotation={[0, 0, -Math.PI / 2]} scale={[0.5, 0.5, 0.5]}>
                        <mesh geometry={FISH_BODY} castShadow>
                            <meshStandardMaterial color="#ff9900" roughness={0.2} metalness={0.5} />
                        </mesh>
                        <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0]}>
                            <coneGeometry args={[0.2, 0.4, 4]} />
                             <meshStandardMaterial color="#cc7700" />
                        </mesh>
                    </group>
                )}

                {/* --- LETTER --- */}
                {data.type === ObjectType.LETTER && (
                    <group scale={[1.5, 1.5, 1.5]}>
                         <Center>
                            <Html transform center>
                                <div className="font-black text-6xl font-cyber" style={{ 
                                    color: data.color, 
                                    textShadow: `0 0 20px ${data.color}`,
                                    userSelect: 'none'
                                }}>
                                    {data.value}
                                </div>
                            </Html>
                         </Center>
                    </group>
                )}
            </group>
        </group>
    );
});
