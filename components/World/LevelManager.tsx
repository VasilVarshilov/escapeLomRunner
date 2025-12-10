
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

// FOOD PROJECTILES (For Kalin)
const STEAK_GEO = new THREE.BoxGeometry(0.6, 0.1, 0.4);
const POTATO_GEO = new THREE.DodecahedronGeometry(0.25, 0);

// TIRE PROJECTILE / OBSTACLE
const TIRE_GEO = new THREE.TorusGeometry(0.4, 0.15, 8, 16);

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

// --- NIKOLAI BOSS GEOMETRY ---
const BOSS_BOAT_HULL_MAIN = new THREE.BoxGeometry(4, 1.5, 8);
const BOSS_BOAT_HULL_BOW = new THREE.ConeGeometry(2, 3, 4);
const BOSS_BOAT_CABIN = new THREE.BoxGeometry(3.5, 2.5, 2.5);
const BOSS_BOAT_MAST = new THREE.CylinderGeometry(0.1, 0.15, 5);
const BOSS_TORSO = new THREE.CylinderGeometry(0.6, 0.5, 1.4, 8);
const BOSS_HEAD = new THREE.SphereGeometry(0.4, 16, 16);
const BOSS_HAT_BRIM = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16);
const BOSS_HAT_TOP = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16);
const BOSS_ARM = new THREE.CylinderGeometry(0.15, 0.12, 1.0);
const BOSS_ROD = new THREE.CylinderGeometry(0.03, 0.05, 4.5, 8);

// --- KALIN BOSS GEOMETRY (COMPUTER) ---
const KALIN_BODY = new THREE.SphereGeometry(1.0, 16, 16); 
const KALIN_HEAD = new THREE.SphereGeometry(0.6, 16, 16);
const KALIN_ARM = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
const KALIN_LEG = new THREE.CylinderGeometry(0.25, 0.2, 1.0, 8);
const RODENT_HAT_EAR = new THREE.SphereGeometry(0.2, 8, 8);
const RODENT_HAT_SNOUT = new THREE.ConeGeometry(0.15, 0.3, 8);

// PC Geometry
const PC_TOWER = new THREE.BoxGeometry(0.8, 1.5, 1.5);
const PC_MONITOR = new THREE.BoxGeometry(1.6, 1.0, 0.1);
const PC_MONITOR_SCREEN = new THREE.PlaneGeometry(1.5, 0.9);
const PC_STAND = new THREE.CylinderGeometry(0.1, 0.2, 0.4);
const PC_KEYBOARD = new THREE.BoxGeometry(1.2, 0.1, 0.5);

// --- STILYAN BOSS GEOMETRY ---
const RING_BASE = new THREE.BoxGeometry(6, 0.5, 6);
const RING_POST = new THREE.CylinderGeometry(0.1, 0.1, 2.5);
const RING_ROPE = new THREE.CylinderGeometry(0.05, 0.05, 6); 
const BOXER_TORSO = new THREE.CylinderGeometry(0.5, 0.4, 1.3, 8); 
const BOXER_SHORTS = new THREE.CylinderGeometry(0.52, 0.52, 0.6, 8);
const BOXER_HEAD = new THREE.SphereGeometry(0.35, 16, 16);
const BOXER_GLOVE = new THREE.SphereGeometry(0.3, 16, 16);
const BOXER_ARM = new THREE.CylinderGeometry(0.12, 0.1, 1.1);
const BOXER_LEG = new THREE.CylinderGeometry(0.18, 0.15, 1.2);

// --- MOVEMENT SPEEDS ---
const MISSILE_SPEED = 12; 
const BARREL_SPEED_X = 5;
const CAT_SPEED_X = 4;
const CRATE_ZIGZAG_SPEED = 3;
const PLAYER_PROJECTILE_SPEED = 30;
const BOSS_PROJECTILE_SPEED = 20; 

const PARTICLE_COUNT = 600;
const BASE_LETTER_INTERVAL = 150; 

const getLetterInterval = () => {
    // Random interval between 100 and 250, regardless of level
    return 100 + Math.random() * 150;
};

// --- Victory Scene Components (Queen Ivelina & House) ---
const VictoryScene: React.FC = () => {
    return (
        // MOVED SCENE MUCH CLOSER (z: -8) so player (at z:0) sees it clearly
        <group position={[0, 0, -8]}>
            {/* --- QUEEN IVELINA (REALISTIC FACE & CLOTHES) --- */}
            {/* Positioned to left, looking at player */}
            <group position={[-1.5, 0, 2.5]} rotation={[0, 0.5, 0]}>
                
                {/* Legs (Long, Skin Color) */}
                <mesh position={[-0.12, 0.7, 0]}>
                    <cylinderGeometry args={[0.06, 0.05, 1.4, 8]} />
                    <meshStandardMaterial color="#ffccaa" />
                </mesh>
                <mesh position={[0.12, 0.7, 0]}>
                    <cylinderGeometry args={[0.06, 0.05, 1.4, 8]} />
                    <meshStandardMaterial color="#ffccaa" />
                </mesh>

                {/* Short Blue Skirt */}
                <mesh position={[0, 1.5, 0]}>
                    <cylinderGeometry args={[0.15, 0.25, 0.35, 16]} />
                    <meshStandardMaterial color="#0000ff" side={THREE.DoubleSide} />
                </mesh>

                {/* Torso (Red T-Shirt) */}
                <mesh position={[0, 1.85, 0]}>
                    <cylinderGeometry args={[0.12, 0.14, 0.5, 16]} />
                    <meshStandardMaterial color="#ff0000" />
                </mesh>

                {/* Huge Breasts (In RED T-Shirt) */}
                <group position={[0, 2.05, 0.12]}>
                    <mesh position={[-0.14, 0, 0]}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        <meshStandardMaterial color="#ff0000" />
                    </mesh>
                    <mesh position={[0.14, 0, 0]}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        <meshStandardMaterial color="#ff0000" />
                    </mesh>
                </group>

                {/* DETAILED HEAD */}
                <group position={[0, 2.45, 0]}>
                    {/* Head Base */}
                    <mesh scale={[0.9, 1.05, 0.95]}>
                        <sphereGeometry args={[0.24, 24, 24]} />
                        <meshStandardMaterial color="#ffccaa" />
                    </mesh>
                    
                    {/* Eyes Group */}
                    <group position={[0, 0.05, 0.2]}>
                         {/* Left Eye */}
                         <group position={[-0.09, 0, 0]}>
                             <mesh><sphereGeometry args={[0.05]} /><meshStandardMaterial color="white" /></mesh>
                             <mesh position={[0, 0, 0.04]}><sphereGeometry args={[0.025]} /><meshStandardMaterial color="#4287f5" /></mesh>
                             <mesh position={[0, 0, 0.05]}><sphereGeometry args={[0.012]} /><meshStandardMaterial color="black" /></mesh>
                             {/* Eyelash hint */}
                             <mesh position={[0, 0.04, 0.02]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.08, 0.01, 0.01]} /><meshBasicMaterial color="black" /></mesh>
                         </group>
                         {/* Right Eye */}
                         <group position={[0.09, 0, 0]}>
                             <mesh><sphereGeometry args={[0.05]} /><meshStandardMaterial color="white" /></mesh>
                             <mesh position={[0, 0, 0.04]}><sphereGeometry args={[0.025]} /><meshStandardMaterial color="#4287f5" /></mesh>
                             <mesh position={[0, 0, 0.05]}><sphereGeometry args={[0.012]} /><meshStandardMaterial color="black" /></mesh>
                             {/* Eyelash hint */}
                             <mesh position={[0, 0.04, 0.02]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.08, 0.01, 0.01]} /><meshBasicMaterial color="black" /></mesh>
                         </group>
                    </group>

                    {/* Nose */}
                    <mesh position={[0, -0.05, 0.22]} rotation={[-0.2, 0, 0]}>
                        <coneGeometry args={[0.02, 0.08, 4]} />
                        <meshStandardMaterial color="#eebb99" />
                    </mesh>

                    {/* Lips (Smile) */}
                    <mesh position={[0, -0.15, 0.2]} rotation={[0.2, 0, 0]}>
                         <torusGeometry args={[0.05, 0.015, 2, 8, Math.PI]} rotation={[0, 0, Math.PI]} />
                         <meshBasicMaterial color="#d05050" />
                    </mesh>

                    {/* Cheeks */}
                    <mesh position={[-0.12, -0.08, 0.15]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#ffaaaa" transparent opacity={0.4} /></mesh>
                    <mesh position={[0.12, -0.08, 0.15]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#ffaaaa" transparent opacity={0.4} /></mesh>
                </group>

                {/* Long Blonde Hair (Voluminous) */}
                <group position={[0, 2.55, -0.05]}>
                    {/* Top */}
                    <mesh>
                        <sphereGeometry args={[0.26, 16, 16]} />
                        <meshStandardMaterial color="#ffff00" />
                    </mesh>
                    {/* Back Fall */}
                    <mesh position={[0, -0.6, -0.1]}>
                         <boxGeometry args={[0.5, 1.4, 0.15]} />
                         <meshStandardMaterial color="#ffff00" />
                    </mesh>
                    {/* Side Bangs */}
                    <mesh position={[-0.2, -0.1, 0.15]} rotation={[0, 0, -0.2]}>
                         <boxGeometry args={[0.1, 0.4, 0.1]} />
                         <meshStandardMaterial color="#ffff00" />
                    </mesh>
                    <mesh position={[0.2, -0.1, 0.15]} rotation={[0, 0, 0.2]}>
                         <boxGeometry args={[0.1, 0.4, 0.1]} />
                         <meshStandardMaterial color="#ffff00" />
                    </mesh>
                </group>

                {/* Complex Arms (Cheering with Fingers & T-shirt sleeves) */}
                {/* Left Arm */}
                <group position={[-0.22, 2.0, 0]} rotation={[0, 0, 0.8]}>
                    {/* Sleeve */}
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[0.06, 0.07, 0.25]} />
                        <meshStandardMaterial color="#ff0000" />
                    </mesh>
                    {/* Arm */}
                    <mesh position={[0, 0.45, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                        <meshStandardMaterial color="#ffccaa" />
                    </mesh>
                    {/* Hand */}
                    <group position={[0, 0.8, 0]}>
                        <mesh>
                            <boxGeometry args={[0.08, 0.1, 0.03]} />
                            <meshStandardMaterial color="#ffccaa" />
                        </mesh>
                        {/* Fingers */}
                        {[-0.03, -0.015, 0, 0.015, 0.03].map((x, i) => (
                            <mesh key={i} position={[x, 0.08, 0]}>
                                <cylinderGeometry args={[0.008, 0.007, 0.08]} />
                                <meshStandardMaterial color="#ffccaa" />
                            </mesh>
                        ))}
                        {/* Thumb */}
                        <mesh position={[0.05, 0.02, 0]} rotation={[0, 0, -0.5]}>
                             <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                             <meshStandardMaterial color="#ffccaa" />
                        </mesh>
                    </group>
                </group>

                {/* Right Arm */}
                <group position={[0.22, 2.0, 0]} rotation={[0, 0, -0.8]}>
                    {/* Sleeve */}
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[0.06, 0.07, 0.25]} />
                        <meshStandardMaterial color="#ff0000" />
                    </mesh>
                    {/* Arm */}
                    <mesh position={[0, 0.45, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                        <meshStandardMaterial color="#ffccaa" />
                    </mesh>
                    {/* Hand */}
                    <group position={[0, 0.8, 0]}>
                        <mesh>
                            <boxGeometry args={[0.08, 0.1, 0.03]} />
                            <meshStandardMaterial color="#ffccaa" />
                        </mesh>
                        {/* Fingers */}
                        {[-0.03, -0.015, 0, 0.015, 0.03].map((x, i) => (
                            <mesh key={i} position={[x, 0.08, 0]}>
                                <cylinderGeometry args={[0.008, 0.007, 0.08]} />
                                <meshStandardMaterial color="#ffccaa" />
                            </mesh>
                        ))}
                         {/* Thumb */}
                        <mesh position={[-0.05, 0.02, 0]} rotation={[0, 0, 0.5]}>
                             <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                             <meshStandardMaterial color="#ffccaa" />
                        </mesh>
                    </group>
                </group>

                {/* Text Bubble (UPDATED TEXT) */}
                <Html position={[0, 5.2, 0]} center>
                    <div className="bg-white/95 p-4 rounded-2xl border-4 border-pink-500 shadow-2xl text-center min-w-[300px] animate-bounce transform scale-110">
                        <h2 className="text-xl font-black text-pink-600 uppercase font-cyber mb-2 border-b-2 border-pink-200 pb-1">Кралица Ивелина</h2>
                        <p className="text-sm font-bold text-gray-900 leading-snug">
                            Дей дей, голем си!<br/>
                            Честито!<br/>
                            Избега от Лом,<br/>
                            добре дошъл в Линево!
                        </p>
                    </div>
                </Html>
            </group>

            {/* --- JACUZZI (REALISTIC) --- */}
            <group position={[0.8, 0.4, 2]}>
                {/* Wooden Cladding (Outer Shell) - Octagonal */}
                <mesh>
                    <cylinderGeometry args={[1.6, 1.6, 0.85, 8]} />
                    <meshStandardMaterial color="#5D4037" roughness={0.8} /> {/* Dark Wood */}
                </mesh>
                {/* Rim (White Acrylic) */}
                <mesh position={[0, 0.43, 0]}>
                    <ringGeometry args={[1.3, 1.6, 8]} />
                    <meshStandardMaterial color="white" side={THREE.DoubleSide} rotation={[-Math.PI/2, 0, 0]} roughness={0.1} />
                </mesh>
                {/* Inner Basin (White) */}
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[1.3, 1.2, 0.6, 8]} />
                    <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
                </mesh>
                
                {/* Water Surface (More Realistic) */}
                <mesh position={[0, 0.35, 0]} rotation={[-Math.PI/2, 0, 0]}>
                    <circleGeometry args={[1.25, 32]} />
                    <meshStandardMaterial color="#00ffff" transparent opacity={0.6} roughness={0.0} metalness={0.1} />
                </mesh>

                {/* Bubbles */}
                <Float speed={5} rotationIntensity={0} floatIntensity={0.5}>
                    <mesh position={[0.2, 0.4, 0.2]}><sphereGeometry args={[0.1]} /><meshStandardMaterial color="white" opacity={0.4} transparent/></mesh>
                    <mesh position={[-0.3, 0.4, -0.1]}><sphereGeometry args={[0.08]} /><meshStandardMaterial color="white" opacity={0.4} transparent/></mesh>
                    <mesh position={[0.1, 0.4, -0.4]}><sphereGeometry args={[0.12]} /><meshStandardMaterial color="white" opacity={0.4} transparent/></mesh>
                    <mesh position={[-0.2, 0.4, 0.3]}><sphereGeometry args={[0.06]} /><meshStandardMaterial color="white" opacity={0.4} transparent/></mesh>
                </Float>
            </group>

            {/* --- LINEVO HOUSE --- */}
            <group position={[4.5, 0, 0]} rotation={[0, -0.2, 0]}>
                {/* Base */}
                <mesh position={[0, 1.5, 0]}>
                    <boxGeometry args={[4, 3, 3]} />
                    <meshStandardMaterial color="#dddddd" />
                </mesh>
                {/* Roof */}
                <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI/4, 0]}>
                    <coneGeometry args={[3.5, 2, 4]} />
                    <meshStandardMaterial color="#8B0000" />
                </mesh>
                {/* Door */}
                <mesh position={[0, 1, 1.51]}>
                    <planeGeometry args={[1, 2]} />
                    <meshStandardMaterial color="#4d2600" />
                </mesh>
                {/* Windows */}
                <mesh position={[-1, 2, 1.51]}>
                    <planeGeometry args={[0.8, 0.8]} />
                    <meshStandardMaterial color="#87CEEB" />
                </mesh>
                <mesh position={[1, 2, 1.51]}>
                    <planeGeometry args={[0.8, 0.8]} />
                    <meshStandardMaterial color="#87CEEB" />
                </mesh>

                {/* Sign (MOVED BACK AND SCALED DOWN) */}
                <group position={[2.5, 0, 1.5]} rotation={[0, -0.2, 0]}>
                     {/* Sign Posts */}
                     <mesh position={[-0.8, 0.8, 0]}>
                         <cylinderGeometry args={[0.05, 0.05, 1.6]} />
                         <meshStandardMaterial color="#333" />
                     </mesh>
                     <mesh position={[0.8, 0.8, 0]}>
                         <cylinderGeometry args={[0.05, 0.05, 1.6]} />
                         <meshStandardMaterial color="#333" />
                     </mesh>
                     
                     {/* Board */}
                     <mesh position={[0, 1.5, 0]}>
                         <boxGeometry args={[2.0, 1.0, 0.1]} />
                         <meshStandardMaterial color="#654321" />
                     </mesh>
                     
                     <Html position={[0, 1.5, 0.06]} transform scale={0.5}>
                         <div className="text-center w-[300px] select-none pointer-events-none">
                             <h1 className="text-6xl font-black text-white uppercase drop-shadow-md" style={{ textShadow: '2px 2px 0 #000' }}>ЛИНЕВО</h1>
                         </div>
                     </Html>
                </group>

                {/* Peach Tree (Behind House) */}
                <group position={[-1.5, 0, -3]}>
                     {/* Trunk */}
                     <mesh position={[0, 1.5, 0]}>
                         <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
                         <meshStandardMaterial color="#5D4037" />
                     </mesh>
                     {/* Crown */}
                     <mesh position={[0, 3, 0]}>
                         <dodecahedronGeometry args={[1.8]} />
                         <meshStandardMaterial color="#2E7D32" />
                     </mesh>
                     {/* Peaches */}
                     <mesh position={[0.8, 3.2, 0.5]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#FF7F50" /></mesh>
                     <mesh position={[-0.8, 2.8, 0.6]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#FF7F50" /></mesh>
                     <mesh position={[0.2, 3.5, -0.8]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#FF7F50" /></mesh>
                     <mesh position={[-0.5, 3.8, 0.3]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#FF7F50" /></mesh>
                </group>
            </group>
        </group>
    );
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
    increaseSpeed,
    damageBoss,
    bossType,
    checkHighScores
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const prevLevel = useRef(level);
  const speedTimer = useRef(0);
  const bossTimer = useRef(0);

  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextLetterDistance = useRef(BASE_LETTER_INTERVAL);

  // Handle Player Shooting
  useEffect(() => {
      const handleShoot = (e: CustomEvent) => {
          if (status !== GameStatus.BOSS_FIGHT) return;
          
          let playerPos = new THREE.Vector3(0, 1, 0);
          if (playerObjRef.current) playerObjRef.current.getWorldPosition(playerPos);

          objectsRef.current.push({
              id: uuidv4(),
              type: ObjectType.PLAYER_PROJECTILE,
              position: [playerPos.x, 1.5, playerPos.z - 1], // Spawn slightly ahead
              active: true
          });
          setRenderTrigger(t => t + 1);
          
          audio.playJump(true); // Reuse jump sound pitched up as throw sound
      };
      
      window.addEventListener('player-shoot', handleShoot as any);
      return () => window.removeEventListener('player-shoot', handleShoot as any);
  }, [status]);

  // Handle resets and transitions
  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && prevStatus.current === GameStatus.GAME_OVER;
    const isMenuReset = status === GameStatus.MENU;
    const isLevelUp = level !== prevLevel.current && status === GameStatus.PLAYING;
    const isVictoryReset = status === GameStatus.PLAYING && prevStatus.current === GameStatus.VICTORY;
    const isBossStart = status === GameStatus.BOSS_FIGHT && prevStatus.current === GameStatus.PLAYING;
    const isBossDefeated = prevStatus.current === GameStatus.BOSS_FIGHT && status === GameStatus.PLAYING;

    if (isMenuReset || isRestart || isVictoryReset) {
        objectsRef.current = [];
        setRenderTrigger(t => t + 1);
        
        distanceTraveled.current = 0;
        nextLetterDistance.current = getLetterInterval(); // Random constant 100-250
        speedTimer.current = 0;

    } else if (isLevelUp && level > 1) {
        objectsRef.current = objectsRef.current.filter(obj => obj.position[2] > -80);

        objectsRef.current.push({
            id: uuidv4(),
            type: ObjectType.SHOP_PORTAL,
            position: [0, 0, -100], 
            active: true,
        });
        
        nextLetterDistance.current = distanceTraveled.current - SPAWN_DISTANCE + getLetterInterval(); // Random constant 100-250
        setRenderTrigger(t => t + 1);
        speedTimer.current = 0;
        
    } else if (isBossStart) {
        // Clear all obstacles for the boss fight
        objectsRef.current = [];
        
        // Spawn Boss (Nikolai or Kalin or Stilyan based on store)
        objectsRef.current.push({
            id: 'BOSS_ENTITY',
            type: ObjectType.BOSS,
            position: [0, 0, -25], 
            active: true,
            phase: 'intro',
            directionX: 1,
            bossType: bossType // Pass type from store
        });
        setRenderTrigger(t => t + 1);
        bossTimer.current = 0;
    } else if (isBossDefeated) {
        // Clear Boss absolutely
        objectsRef.current = objectsRef.current.filter(o => o.type !== ObjectType.BOSS && o.type !== ObjectType.BOSS_PROJECTILE);
        setRenderTrigger(t => t + 1);
        // Continue spawning normal obstacles
        nextLetterDistance.current = distanceTraveled.current + 50;
    } else if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
        const finalDist = Math.floor(distanceTraveled.current);
        setDistance(finalDist);
        checkHighScores(finalDist); // Trigger high score check with correct distance
    }
    
    prevStatus.current = status;
    prevLevel.current = level;
  }, [status, level, setDistance, bossType, checkHighScores]);

  useFrame((state) => {
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.BOSS_FIGHT) return;
    
    const safeDelta = Math.min(delta, 0.05); 
    
    // Timer Speed Increase (Only in Playing mode)
    if (status === GameStatus.PLAYING) {
        speedTimer.current += delta;
        if (speedTimer.current >= 45) {
            increaseSpeed(5);
            speedTimer.current = 0;
        }
        
        // Safety check to ensure boss isn't present during PLAYING state
        const hasBoss = objectsRef.current.some(o => o.type === ObjectType.BOSS);
        if (hasBoss) {
             objectsRef.current = objectsRef.current.filter(o => o.type !== ObjectType.BOSS);
        }
    }

    // Distance accumulation
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

    // --- BOSS FIGHT LOGIC ---
    if (status === GameStatus.BOSS_FIGHT) {
        const boss = currentObjects.find(o => o.type === ObjectType.BOSS);
        if (boss && boss.active) {
            
            // Keep boss fixed in front (relative to player Z)
            // Player Z is 0. Objects move +Z. 
            // Boss should stay at negative Z.
            boss.position[2] = playerPos.z - 25; 

            // Boss Movement (Strafe)
            bossTimer.current += safeDelta;
            const moveSpeed = 4 + (level * 0.2);
            if (boss.directionX === undefined) boss.directionX = 1;
            
            boss.position[0] += boss.directionX * moveSpeed * safeDelta;
            if (boss.position[0] > (laneCount * LANE_WIDTH / 2) + 2) boss.directionX = -1;
            if (boss.position[0] < -(laneCount * LANE_WIDTH / 2) - 2) boss.directionX = 1;

            // Boss Attack
            // More frequent (0.8s min interval approx)
            if (bossTimer.current > Math.max(0.6, 1.2 - (level * 0.1))) {
                
                // Calculate Vector towards player
                // Boss is at -25, Player is at 0. Direction Z is +25.
                const targetX = playerPos.x;
                const targetY = 1.0;
                const targetZ = playerPos.z;

                const dx = targetX - boss.position[0];
                const dy = targetY - 2; // From height 2
                const dz = targetZ - boss.position[2];

                const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                // Determine Projectile Type
                let variant = 'bottle';
                if (boss.bossType === 'KALIN') {
                    variant = Math.random() > 0.5 ? 'steak' : 'potato';
                } else if (boss.bossType === 'STILYAN') {
                    variant = 'tire';
                }

                // Shoot projectile at player
                newSpawns.push({
                    id: uuidv4(),
                    type: ObjectType.BOSS_PROJECTILE,
                    position: [boss.position[0], 2, boss.position[2] + 2],
                    active: true,
                    bossType: boss.bossType,
                    projectileVariant: variant as any,
                    velocity: [
                        (dx / len) * BOSS_PROJECTILE_SPEED,
                        (dy / len) * BOSS_PROJECTILE_SPEED,
                        (dz / len) * BOSS_PROJECTILE_SPEED
                    ]
                });
                
                // Trigger visual/audio event
                window.dispatchEvent(new CustomEvent('boss-attack', { detail: { id: boss.id, type: boss.bossType } }));
                
                if (boss.bossType === 'KALIN') {
                    audio.playBark(); // Bark for Kalin
                } else if (boss.bossType === 'STILYAN') {
                    audio.playHorse(); // Neigh for Stilyan
                } else {
                    audio.playMeow(); // Meow for Nikolai
                }

                bossTimer.current = 0;
                hasChanges = true; 
            }
        }
    }

    for (const obj of currentObjects) {
        // Global movement (Objects move towards player)
        let moveAmount = dist;
        
        // --- MOVEMENT LOGIC ---
        
        // Boss doesn't move with the world scroll
        if (obj.type === ObjectType.BOSS) {
            moveAmount = 0; 
        }

        // Projectiles have their own velocity logic
        if (obj.type === ObjectType.PLAYER_PROJECTILE) {
            obj.position[2] -= PLAYER_PROJECTILE_SPEED * safeDelta;
            moveAmount = 0; // Handled manually
        } else if (obj.type === ObjectType.BOSS_PROJECTILE) {
            if (obj.velocity) {
                obj.position[0] += obj.velocity[0] * safeDelta;
                obj.position[1] += obj.velocity[1] * safeDelta;
                obj.position[2] += obj.velocity[2] * safeDelta;
            }
            // Add world scrolling speed so it feels like it's approaching naturally on top of velocity
            obj.position[2] += dist; 
            moveAmount = 0;
        }

        // Missile (Bottle) moves faster
        if (obj.type === ObjectType.MISSILE) {
            moveAmount += MISSILE_SPEED * safeDelta;
        }
        
        obj.position[2] += moveAmount;

        // Barrel: Moves Right to Left across ground
        if (obj.type === ObjectType.BARREL) {
            const speedMod = 1 + (level * 0.1);
            obj.position[0] += (obj.directionX || -1) * BARREL_SPEED_X * speedMod * safeDelta;
        }
        
        // Crate: ZigZag
        if (obj.type === ObjectType.ZIGZAG_CRATE) {
             const amp = 2.0; 
             obj.position[0] = (obj.initialX || 0) + Math.sin((obj.position[2] * 0.1) + (obj.zigzagPhase || 0)) * amp;
        }

        // Cat
        if (obj.type === ObjectType.CAT) {
            obj.position[0] += (obj.directionX || 1) * CAT_SPEED_X * safeDelta;
        }

        // ROLLING TIRE (Moves with world but also has its own roll speed)
        if (obj.type === ObjectType.ROLLING_TIRE) {
             // ZigZag slightly
             obj.position[0] = (obj.initialX || 0) + Math.sin((obj.position[2] * 0.2) + (obj.zigzagPhase || 0)) * 1.5;
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
            const inZZone = (obj.position[2] < playerPos.z + zThreshold) && (obj.position[2] > playerPos.z - zThreshold);
            
            // --- COLLISION DETECTION ---

            // 1. Player Projectile Hits Boss
            if (obj.type === ObjectType.PLAYER_PROJECTILE) {
                 // Check against boss
                 const boss = currentObjects.find(o => o.type === ObjectType.BOSS);
                 if (boss && boss.active) {
                     const dx = Math.abs(obj.position[0] - boss.position[0]);
                     const dz = Math.abs(obj.position[2] - boss.position[2]);
                     if (dx < 5.0 && dz < 5.0) { // Hit box size
                         // Hit!
                         damageBoss(25); // Damage amount
                         obj.active = false;
                         keep = false;
                         hasChanges = true;
                         window.dispatchEvent(new CustomEvent('particle-burst', { 
                            detail: { position: boss.position, color: '#ff0000' } 
                         }));
                     }
                 }
                 // Remove if too far
                 if (obj.position[2] < -100) keep = false;
            }

            // 2. Boss Projectile Hits Player
            else if (obj.type === ObjectType.BOSS_PROJECTILE) {
                // Check distance
                const dx = Math.abs(obj.position[0] - playerPos.x);
                const dy = Math.abs(obj.position[1] - playerPos.y); 
                const dz = Math.abs(obj.position[2] - playerPos.z);
                
                // Generous hit box for the player
                if (dz < 1.5 && dx < 1.0 && dy < 2.0) {
                    window.dispatchEvent(new Event('player-hit'));
                    obj.active = false;
                    keep = false;
                    hasChanges = true;
                    window.dispatchEvent(new CustomEvent('particle-burst', { 
                        detail: { position: obj.position, color: '#00ff00' } 
                    }));
                }
            }

            else if (obj.type === ObjectType.SHOP_PORTAL) {
                const dz = Math.abs(obj.position[2] - playerPos.z);
                if (dz < 2) { 
                     openShop();
                     obj.active = false;
                     hasChanges = true;
                     keep = false; 
                }
            } else if (inZZone && obj.type !== ObjectType.BOSS) {
                const dx = Math.abs(obj.position[0] - playerPos.x);
                let hitWidth = 0.9;
                
                // Adjust hitbox widths based on type
                if (obj.type === ObjectType.BARREL) hitWidth = 1.2;
                if (obj.type === ObjectType.ZIGZAG_CRATE) hitWidth = 1.0;
                if (obj.type === ObjectType.CAT) hitWidth = 0.8;
                if (obj.type === ObjectType.OLD_CAR) hitWidth = 2.0; // Wide
                if (obj.type === ObjectType.HAY_BALE) hitWidth = 1.1;
                if (obj.type === ObjectType.ROLLING_TIRE) hitWidth = 1.0;

                if (dx < hitWidth) { 
                     
                     const isDamageSource = [
                        ObjectType.OBSTACLE, ObjectType.ALIEN, ObjectType.MISSILE, 
                        ObjectType.BARREL, ObjectType.ZIGZAG_CRATE, ObjectType.CAT,
                        ObjectType.POTHOLE, ObjectType.OLD_CAR, ObjectType.HAY_BALE,
                        ObjectType.ROLLING_TIRE
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
                         } else if (obj.type === ObjectType.ROLLING_TIRE) {
                             objBottom = 0; objTop = 1.0; // Jumpable
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
                             if (obj.type === ObjectType.ROLLING_TIRE) pColor = '#111111';

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

        // Safety against boss removal
        if (obj.type === ObjectType.BOSS) {
            keep = true;
        } else if (obj.position[2] > REMOVE_DISTANCE) {
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

    // --- SPAWNING LOGIC (Standard Level) ---
    if (status === GameStatus.PLAYING) {
        let furthestZ = 0;
        const spacingObjects = keptObjects.filter(o => o.type !== ObjectType.MISSILE && o.type !== ObjectType.PLAYER_PROJECTILE && o.type !== ObjectType.BOSS_PROJECTILE);
        
        if (spacingObjects.length > 0) {
            furthestZ = Math.min(...spacingObjects.map(o => o.position[2]));
        } else {
            furthestZ = -20;
        }

        if (furthestZ > -SPAWN_DISTANCE) {
             // DIFFICULTY SCALING: Reduce gap as level increases
             // Base gap decreases with level, but increases with speed to be fair
             const minGap = Math.max(7, (14 - (level * 0.4)) + (speed * 0.4)); 
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
                     
                     nextLetterDistance.current += getLetterInterval(); // Random constant 100-250
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
                
                // Increase probability of obstacles as levels go up
                const isObstacle = Math.random() > Math.max(0.1, 0.3 - (level * 0.02));

                if (isObstacle) {
                    const rand = Math.random();

                    // DYNAMIC OBSTACLES DISTRIBUTION
                    // ADJUSTED FOR HIGHER DIFFICULTY AT HIGHER LEVELS
                    
                    // ROLLING TIRE (Level 5+) - Fast & ZigZag
                    if (level >= 5 && rand < 0.15) {
                        const lane = getRandomLane(laneCount);
                        const laneX = lane * LANE_WIDTH;
                        keptObjects.push({
                            id: uuidv4(),
                            type: ObjectType.ROLLING_TIRE,
                            position: [laneX, 0.4, spawnZ],
                            active: true,
                            initialX: laneX,
                            zigzagPhase: Math.random() * Math.PI * 2
                        });
                    }
                    // BARREL (Rolling)
                    else if (rand < 0.25) {
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
                    else if (rand < 0.35) {
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
                    // ZIGZAG CRATE (Level 2+)
                    else if (level >= 2 && rand < 0.45) {
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
                    else if (rand < 0.55) {
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
                    else if (rand < 0.65) {
                         const lane = getRandomLane(laneCount);
                         const laneX = lane * LANE_WIDTH;
                         keptObjects.push({
                             id: uuidv4(),
                             type: ObjectType.HAY_BALE,
                             position: [laneX, 0.6, spawnZ],
                             active: true
                         });
                    }
                    // OLD CAR (Level 3+)
                    else if (level >= 3 && rand < 0.75) {
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
                    else if (level >= 4 && rand < 0.85) {
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
                        
                        // Increase density of zombies at higher levels
                        let countToSpawn = 1;
                        if (level > 5 && Math.random() > 0.5) countToSpawn = 2;
                        if (level > 10 && Math.random() > 0.7) countToSpawn = 3;

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
    }

    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }
  });

  return (
    <group>
      <ParticleSystem />
      {/* RENDER VICTORY SCENE ONLY ON VICTORY */}
      {status === GameStatus.VICTORY && <VictoryScene />}
      
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
    const [attackText, setAttackText] = useState<string | null>(null);
    
    // Zombie Animation Refs
    const lArmRef = useRef<THREE.Group>(null);
    const rArmRef = useRef<THREE.Group>(null);
    const lLegRef = useRef<THREE.Group>(null);
    const rLegRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);

    // DESTRUCTURING STATUS HERE IS KEY FIX
    const { laneCount, status } = useStore();

    useEffect(() => {
        if (data.type === ObjectType.BOSS) {
            const handleBossAttack = (e: any) => {
                if (e.detail?.id === data.id) {
                    const type = e.detail?.type;
                    if (type === 'KALIN') setAttackText('БАУ-БАУ');
                    else if (type === 'STILYAN') setAttackText('КОН-КОН');
                    else setAttackText('МЯУ-МЯУ');
                    
                    setTimeout(() => setAttackText(null), 1000);
                }
            };
            window.addEventListener('boss-attack', handleBossAttack);
            return () => window.removeEventListener('boss-attack', handleBossAttack);
        }
    }, [data.id, data.type]);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], 0, data.position[2]);
        }

        if (visualRef.current) {
            const baseHeight = data.position[1];
            const time = state.clock.elapsedTime;
            
            if (data.type === ObjectType.SHOP_PORTAL) {
                 // Gentle pulse scale
                 visualRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.03);
            } else if (data.type === ObjectType.MISSILE) {
                 visualRef.current.rotation.x += delta * 10;
                 visualRef.current.rotation.z += delta * 5;
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.PLAYER_PROJECTILE) {
                 // Spin beer bottle
                 visualRef.current.rotation.x += delta * 15;
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.BOSS_PROJECTILE) {
                 // Bottle spin or food tumble
                 if (data.projectileVariant === 'tire') {
                     visualRef.current.rotation.x += delta * 10;
                 } else {
                     visualRef.current.rotation.x += delta * 10;
                     visualRef.current.rotation.z += delta * 5;
                 }
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.ALIEN) {
                 visualRef.current.position.y = baseHeight + Math.sin(time * 5) * 0.1;
            } else if (data.type === ObjectType.BARREL) {
                 // Roll
                 visualRef.current.rotation.z -= delta * 5 * (data.directionX || -1);
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.ROLLING_TIRE) {
                 // Roll Fast
                 visualRef.current.rotation.x -= delta * 10;
                 // Tilt slightly
                 visualRef.current.rotation.y = Math.sin(time * 10) * 0.1; 
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
            } else if (data.type === ObjectType.BOSS) {
                // Boss Animation
                if (data.bossType === 'KALIN') {
                    // Kalin Sitting/Typing animation
                    visualRef.current.position.y = 0; // Grounded PC
                } else if (data.bossType === 'STILYAN') {
                    // Stilyan Boxing Bobbing
                    visualRef.current.position.y = Math.abs(Math.sin(time * 5)) * 0.1; 
                } else {
                    // Nikolai Boat animation
                    visualRef.current.position.y = Math.sin(time * 3) * 0.2; // Hover/Bob
                    const boat = visualRef.current.children.find(c => c.name === 'boat_group');
                    if (boat) {
                        boat.rotation.x = Math.sin(time * 1.5) * 0.05;
                        boat.rotation.z = Math.cos(time * 1.2) * 0.05;
                    }
                }
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

    const portalWidth = laneCount * LANE_WIDTH + 4;

    return (
        <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
            <group ref={visualRef} position={[0, data.position[1], 0]}>
                
                {/* --- BOSS VISUALS --- */}
                {data.type === ObjectType.BOSS && (
                    <group>
                        {/* NIKOLAI (FISHERMAN) */}
                        {data.bossType === 'NIKOLAI' && (
                            <group name="boat_group">
                                {/* Boat Hull Main */}
                                <mesh geometry={BOSS_BOAT_HULL_MAIN} position={[0, 0.5, 0]}>
                                    <meshStandardMaterial color="#eeeeee" />
                                </mesh>
                                <mesh position={[0, 0.8, 0]}>
                                    <boxGeometry args={[4.2, 0.2, 8.2]} />
                                    <meshStandardMaterial color="#0055aa" />
                                </mesh>
                                <mesh geometry={BOSS_BOAT_HULL_BOW} position={[0, 0.5, 5]} rotation={[-Math.PI/2, 0, 0]} scale={[1, 1, 1]}>
                                    <meshStandardMaterial color="#eeeeee" />
                                </mesh>
                                <mesh geometry={BOSS_BOAT_CABIN} position={[0, 2.0, -2]}>
                                    <meshStandardMaterial color="#eeeeee" />
                                </mesh>
                                <mesh position={[0, 2.5, -0.7]}>
                                    <boxGeometry args={[2.8, 0.8, 0.2]} />
                                    <meshStandardMaterial color="#222" />
                                </mesh>
                                <mesh geometry={BOSS_BOAT_MAST} position={[0, 3.5, -2.5]}>
                                    <meshStandardMaterial color="#8B4513" />
                                </mesh>
                                <mesh position={[0, 5.5, -3.0]} rotation={[0, -Math.PI/2, 0]}>
                                    <planeGeometry args={[1, 0.8]} />
                                    <meshStandardMaterial color="red" side={THREE.DoubleSide} />
                                </mesh>

                                {/* Nikolai Model */}
                                <group position={[0, 1.2, 1]}> 
                                    <mesh geometry={BOSS_TORSO} position={[0, 1.0, 0]}>
                                        <meshStandardMaterial color="#000080" /> 
                                    </mesh>
                                    <mesh position={[0, 2.1, 0]} geometry={BOSS_HEAD}>
                                        <meshStandardMaterial color="#ffccaa" />
                                    </mesh>
                                    <mesh position={[0, 1.9, 0.35]}>
                                        <boxGeometry args={[0.5, 0.4, 0.3]} />
                                        <meshStandardMaterial color="#333" />
                                    </mesh>
                                    <mesh position={[0.15, 2.2, 0.35]}>
                                        <sphereGeometry args={[0.05]} />
                                        <meshBasicMaterial color="black" />
                                    </mesh>
                                    <mesh position={[-0.15, 2.2, 0.35]}>
                                        <sphereGeometry args={[0.05]} />
                                        <meshBasicMaterial color="black" />
                                    </mesh>
                                    <group position={[0, 2.5, 0]}>
                                        <mesh geometry={BOSS_HAT_BRIM}>
                                            <meshStandardMaterial color="#FFFF00" />
                                        </mesh>
                                        <mesh geometry={BOSS_HAT_TOP} position={[0, 0.2, 0]}>
                                            <meshStandardMaterial color="#FFFF00" />
                                        </mesh>
                                    </group>
                                    <group position={[0.6, 1.5, 0.2]} rotation={[0.2, 0, -0.2]}>
                                        <mesh geometry={BOSS_ARM} position={[0, -0.4, 0]}>
                                            <meshStandardMaterial color="#000080" />
                                        </mesh>
                                        <mesh geometry={BOSS_ROD} position={[0, 0.5, 1.5]} rotation={[0.5, 0, 0]}>
                                            <meshStandardMaterial color="#4d2600" />
                                        </mesh>
                                        <mesh position={[0, 2.8, 2.5]}>
                                            <boxGeometry args={[0.1, 0.1, 0.1]} />
                                            <meshStandardMaterial color="#222" />
                                        </mesh>
                                    </group>
                                    <group position={[-0.6, 1.5, 0.2]} rotation={attackText ? [0, 0, -1.0] : [0.5, 0, 0.2]}>
                                        <mesh geometry={BOSS_ARM} position={[0, -0.4, 0]}>
                                            <meshStandardMaterial color="#000080" />
                                        </mesh>
                                    </group>
                                </group>
                            </group>
                        )}

                        {/* KALIN (THE RODENT - ON COMPUTER) */}
                        {data.bossType === 'KALIN' && (
                            <group name="kalin_group">
                                {/* COMPUTER DESK SETUP */}
                                <group position={[0, 0.8, 0]}>
                                    {/* PC Tower (Base) */}
                                    <mesh geometry={PC_TOWER} position={[0, 0.75, 0]}>
                                        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                                    </mesh>
                                    {/* Glowing RGB Lines on Tower */}
                                    <mesh position={[0.41, 0.75, 0]}>
                                        <boxGeometry args={[0.02, 1.2, 0.05]} />
                                        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
                                    </mesh>
                                    
                                    {/* Monitor (Floating in front) */}
                                    <group position={[0, 1.8, 1.2]} rotation={[-0.2, 0, 0]}>
                                        <mesh geometry={PC_MONITOR}>
                                            <meshStandardMaterial color="#222" />
                                        </mesh>
                                        <mesh geometry={PC_MONITOR_SCREEN} position={[0, 0, 0.06]}>
                                            <meshStandardMaterial color="#0000aa" emissive="#0000ff" emissiveIntensity={0.5} />
                                        </mesh>
                                        {/* Code/Text on screen */}
                                        <mesh position={[-0.3, 0.2, 0.07]}>
                                            <boxGeometry args={[0.5, 0.05, 0.01]} />
                                            <meshBasicMaterial color="#00ff00" />
                                        </mesh>
                                        <mesh position={[-0.3, 0.0, 0.07]}>
                                            <boxGeometry args={[0.6, 0.05, 0.01]} />
                                            <meshBasicMaterial color="#00ff00" />
                                        </mesh>
                                    </group>
                                    
                                    {/* Keyboard */}
                                    <group position={[0, 1.5, 0.8]} rotation={[-0.5, 0, 0]}>
                                        <mesh geometry={PC_KEYBOARD}>
                                            <meshStandardMaterial color="#333" />
                                        </mesh>
                                    </group>
                                </group>

                                {/* KALIN BODY (Sitting on Tower) */}
                                <group name="kalin_body" position={[0, 2.8, -0.2]}>
                                    <mesh geometry={KALIN_BODY}>
                                        <meshStandardMaterial color="#ffcccc" /> {/* Fat pinkish skin */}
                                    </mesh>
                                    {/* Shirt */}
                                    <mesh position={[0, -0.2, 0]} scale={[1.05, 0.6, 1.05]}>
                                        <sphereGeometry args={[1.0, 16, 16]} />
                                        <meshStandardMaterial color="#00ff00" /> {/* Bright Green Shirt */}
                                    </mesh>
                                    
                                    {/* HEAD */}
                                    <group position={[0, 1.3, 0.2]}>
                                        <mesh geometry={KALIN_HEAD}>
                                            <meshStandardMaterial color="#ffcccc" />
                                        </mesh>
                                        <mesh position={[0.2, 0.1, 0.5]}>
                                            <sphereGeometry args={[0.08]} />
                                            <meshBasicMaterial color="black" />
                                        </mesh>
                                        <mesh position={[-0.2, 0.1, 0.5]}>
                                            <sphereGeometry args={[0.08]} />
                                            <meshBasicMaterial color="black" />
                                        </mesh>

                                        {/* RODENT HAT */}
                                        <group position={[0, 0.5, 0]}>
                                            <mesh position={[0, 0, 0]}>
                                                <sphereGeometry args={[0.61, 16, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
                                                <meshStandardMaterial color="#8B4513" /> {/* Brown Fur */}
                                            </mesh>
                                            <mesh geometry={RODENT_HAT_EAR} position={[0.5, 0.3, 0]}>
                                                <meshStandardMaterial color="#8B4513" />
                                            </mesh>
                                            <mesh geometry={RODENT_HAT_EAR} position={[-0.5, 0.3, 0]}>
                                                <meshStandardMaterial color="#8B4513" />
                                            </mesh>
                                            <mesh geometry={RODENT_HAT_SNOUT} position={[0, 0, 0.6]} rotation={[Math.PI/2, 0, 0]}>
                                                <meshStandardMaterial color="#pink" />
                                            </mesh>
                                        </group>
                                    </group>

                                    {/* ARMS (Reaching for keyboard) */}
                                    <group position={[0.8, -0.2, 0.8]} rotation={[1.2, 0, -0.5]}>
                                        <mesh geometry={KALIN_ARM}>
                                            <meshStandardMaterial color="#ffcccc" />
                                        </mesh>
                                    </group>
                                    <group position={[-0.8, -0.2, 0.8]} rotation={attackText ? [1.5, 0, 0.5] : [1.2, 0, 0.5]}>
                                        <mesh geometry={KALIN_ARM}>
                                            <meshStandardMaterial color="#ffcccc" />
                                        </mesh>
                                    </group>

                                    {/* LEGS (Dangling) */}
                                    <group position={[0.4, -1.0, 0.3]} rotation={[-0.5, 0, 0]}>
                                        <mesh geometry={KALIN_LEG}>
                                            <meshStandardMaterial color="#333" /> {/* Shorts */}
                                        </mesh>
                                    </group>
                                    <group position={[-0.4, -1.0, 0.3]} rotation={[-0.5, 0, 0]}>
                                        <mesh geometry={KALIN_LEG}>
                                            <meshStandardMaterial color="#333" />
                                        </mesh>
                                    </group>
                                </group>
                            </group>
                        )}

                        {/* STILYAN (THE COBRA) */}
                        {data.bossType === 'STILYAN' && (
                            <group name="stilyan_group">
                                {/* BOXING RING */}
                                <group position={[0, 0.5, 0]}>
                                    <mesh geometry={RING_BASE}>
                                        <meshStandardMaterial color="#333" />
                                    </mesh>
                                    <mesh position={[0, 0.26, 0]}>
                                        <boxGeometry args={[5.8, 0.05, 5.8]} />
                                        <meshStandardMaterial color="#0000aa" /> {/* Canvas */}
                                    </mesh>
                                    {/* Corner Posts */}
                                    <mesh geometry={RING_POST} position={[2.8, 1.2, 2.8]}><meshStandardMaterial color="red" /></mesh>
                                    <mesh geometry={RING_POST} position={[-2.8, 1.2, 2.8]}><meshStandardMaterial color="white" /></mesh>
                                    <mesh geometry={RING_POST} position={[2.8, 1.2, -2.8]}><meshStandardMaterial color="white" /></mesh>
                                    <mesh geometry={RING_POST} position={[-2.8, 1.2, -2.8]}><meshStandardMaterial color="blue" /></mesh>
                                    {/* Ropes (simplified) */}
                                    <mesh position={[0, 1.5, 2.8]} rotation={[0,0,Math.PI/2]} geometry={RING_ROPE}><meshStandardMaterial color="white" /></mesh>
                                    <mesh position={[0, 2.0, 2.8]} rotation={[0,0,Math.PI/2]} geometry={RING_ROPE}><meshStandardMaterial color="white" /></mesh>
                                    <mesh position={[0, 1.5, -2.8]} rotation={[0,0,Math.PI/2]} geometry={RING_ROPE}><meshStandardMaterial color="white" /></mesh>
                                    <mesh position={[0, 2.0, -2.8]} rotation={[0,0,Math.PI/2]} geometry={RING_ROPE}><meshStandardMaterial color="white" /></mesh>
                                </group>

                                {/* STILYAN BODY */}
                                <group position={[0, 1.8, 0]}>
                                    <mesh geometry={BOXER_TORSO} position={[0, 0.65, 0]}>
                                        <meshStandardMaterial color="#ffccaa" /> {/* Skin */}
                                    </mesh>
                                    <mesh geometry={BOXER_SHORTS} position={[0, 0, 0]}>
                                        <meshStandardMaterial color="#cc0000" /> {/* Red Shorts */}
                                    </mesh>
                                    <mesh geometry={BOXER_HEAD} position={[0, 1.6, 0]}>
                                        <meshStandardMaterial color="#ffccaa" />
                                    </mesh>
                                    {/* Hair */}
                                    <mesh position={[0, 1.85, -0.1]} scale={[1, 0.5, 1]}>
                                        <sphereGeometry args={[0.36]} />
                                        <meshStandardMaterial color="black" />
                                    </mesh>

                                    {/* ARMS & GLOVES */}
                                    {/* Left Arm (raised guard) */}
                                    <group position={[-0.6, 1.0, 0.3]} rotation={[0, 0, -0.5]}>
                                        <mesh geometry={BOXER_ARM} position={[0, -0.4, 0]}>
                                            <meshStandardMaterial color="#ffccaa" />
                                        </mesh>
                                        <mesh geometry={BOXER_GLOVE} position={[0, -1.0, 0]}>
                                            <meshStandardMaterial color="red" roughness={0.4} />
                                        </mesh>
                                    </group>
                                    {/* Right Arm (punching if attacking) */}
                                    <group position={[0.6, 1.0, 0.3]} rotation={attackText ? [1.5, 0, 0] : [0, 0, 0.5]}>
                                        <mesh geometry={BOXER_ARM} position={[0, -0.4, 0]}>
                                            <meshStandardMaterial color="#ffccaa" />
                                        </mesh>
                                        <mesh geometry={BOXER_GLOVE} position={[0, -1.0, 0]}>
                                            <meshStandardMaterial color="red" roughness={0.4} />
                                        </mesh>
                                    </group>

                                    {/* LEGS */}
                                    <group position={[0.3, -0.8, 0]}>
                                        <mesh geometry={BOXER_LEG}>
                                            <meshStandardMaterial color="#ffccaa" />
                                        </mesh>
                                    </group>
                                    <group position={[-0.3, -0.8, 0]}>
                                        <mesh geometry={BOXER_LEG}>
                                            <meshStandardMaterial color="#ffccaa" />
                                        </mesh>
                                    </group>
                                </group>
                            </group>
                        )}

                        {/* ATTACK TEXT */}
                        {attackText && status === GameStatus.BOSS_FIGHT && (
                            <Html position={[0, 4, 1]} center>
                                <div className="text-4xl font-black text-white font-cyber animate-bounce whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,0,255,1)]"
                                     style={{ textShadow: '2px 2px 0px #000' }}>
                                    {attackText}
                                </div>
                            </Html>
                        )}

                        {/* Name Tag */}
                        {status === GameStatus.BOSS_FIGHT && (
                            <Html position={[0, 7, 0]} center>
                                <div className="bg-black/80 text-red-500 px-4 py-2 rounded-xl font-cyber text-3xl whitespace-nowrap border-4 border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)] backdrop-blur-md uppercase">
                                    {data.bossType === 'KALIN' && 'КАЛИН (ГРИЗАЧА)'}
                                    {data.bossType === 'STILYAN' && 'СТИЛЯН (КОБРАТА)'}
                                    {data.bossType === 'NIKOLAI' && 'НИКОЛАЙ (КАПИТАНА)'}
                                </div>
                            </Html>
                        )}
                    </group>
                )}

                {/* --- SHOP PORTAL --- */}
                {data.type === ObjectType.SHOP_PORTAL && (
                    <group>
                         {/* Left Neon Pillar */}
                         <mesh position={[-portalWidth/2 + 0.5, 3, 0]}>
                             <cylinderGeometry args={[0.6, 0.6, 6, 16]} />
                             <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                         </mesh>
                         {/* Right Neon Pillar */}
                         <mesh position={[portalWidth/2 - 0.5, 3, 0]}>
                             <cylinderGeometry args={[0.6, 0.6, 6, 16]} />
                             <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                         </mesh>
                         {/* Top Beam */}
                         <mesh position={[0, 5.5, 0]}>
                             <boxGeometry args={[portalWidth, 1.2, 1.2]} />
                             <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} />
                         </mesh>

                         {/* The "Void" / Portal Curtain - Semi-transparent */}
                         <mesh position={[0, 2.5, 0.2]}>
                             <planeGeometry args={[portalWidth - 1.5, 5.5]} />
                             <meshBasicMaterial color="#2a0a3b" transparent opacity={0.85} />
                         </mesh>
                         
                         {/* Neon Grid on Portal Surface */}
                         <mesh position={[0, 2.5, 0.25]} rotation={[0,0, Math.PI/4]}>
                              <planeGeometry args={[4, 4, 2, 2]} />
                              <meshBasicMaterial color="#ff00ff" wireframe transparent opacity={0.1} />
                         </mesh>

                         {/* Floating HTML Sign */}
                         <Html transform position={[0, 4.0, 1]} center distanceFactor={10}>
                            <div className="flex flex-col items-center justify-center pointer-events-none select-none">
                                <div className="text-6xl animate-bounce mb-2 filter drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]">🍻</div>
                                
                                <div className="relative font-black text-center px-6 py-4 rounded-2xl backdrop-blur-sm flex flex-col items-center gap-2" 
                                     style={{ 
                                        color: '#fff',
                                        textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #d946ef',
                                        background: 'rgba(0,0,0,0.6)',
                                        border: '3px solid #00ffff',
                                        boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(0,255,255,0.2)'
                                     }}>
                                    <div className="text-3xl md:text-5xl font-cyber whitespace-nowrap">Вече не си отЛомка</div>
                                    <div className="text-sm md:text-lg text-cyan-200 font-mono max-w-xs leading-tight text-shadow-none" style={{ textShadow: 'none' }}>
                                        Избяга от Лом, но Лом не може да избяга от теб!
                                    </div>

                                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs md:text-sm text-cyan-300 font-mono tracking-[0.3em] bg-black/80 px-2 py-0.5 rounded">
                                        ПОЗДРАВЛЕНИЯ
                                    </div>
                                </div>
                            </div>
                         </Html>
                    </group>
                )}

                {/* --- REALISTIC ZOMBIE --- */}
                {data.type === ObjectType.OBSTACLE && (
                    <group>
                         <mesh position={[0, 0.4, 0]} geometry={ZOMBIE_TORSO} castShadow>
                             <meshStandardMaterial color="#a8a890" roughness={0.9} />
                         </mesh>
                         <group ref={headRef} position={[0, 0.85, 0]}>
                             <mesh geometry={ZOMBIE_HEAD} castShadow>
                                 <meshStandardMaterial color="#8a9c8a" roughness={0.5} />
                             </mesh>
                             <mesh position={[0.08, 0.05, 0.151]}>
                                 <boxGeometry args={[0.05, 0.05, 0.01]} />
                                 <meshBasicMaterial color="red" />
                             </mesh>
                             <mesh position={[-0.08, 0.05, 0.151]}>
                                 <boxGeometry args={[0.05, 0.05, 0.01]} />
                                 <meshBasicMaterial color="red" />
                             </mesh>
                         </group>
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

                {/* --- OLD CAR --- */}
                {data.type === ObjectType.OLD_CAR && (
                    <group rotation={[0, Math.PI, 0]}>
                        <mesh position={[0, 0.4, 0]} geometry={CAR_BODY_GEO} castShadow>
                            <meshStandardMaterial color="#8B0000" roughness={0.6} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 1.0, -0.2]} geometry={CAR_TOP_GEO} castShadow>
                            <meshStandardMaterial color="#8B0000" roughness={0.6} metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 1.0, -0.2]} scale={[1.01, 0.8, 1.01]}>
                             <boxGeometry args={[1.4, 0.6, 1.8]} />
                             <meshStandardMaterial color="#111" />
                        </mesh>
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

                {/* --- ROLLING TIRE --- */}
                {data.type === ObjectType.ROLLING_TIRE && (
                    <mesh geometry={TIRE_GEO} castShadow>
                        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
                    </mesh>
                )}

                {/* --- ALIEN --- */}
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

                {/* --- MISSILE / PLAYER PROJECTILE --- */}
                {(data.type === ObjectType.MISSILE || data.type === ObjectType.PLAYER_PROJECTILE) && (
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <mesh geometry={BOTTLE_BODY}>
                            <meshStandardMaterial color={data.type === ObjectType.PLAYER_PROJECTILE ? "#00ff00" : "#663300"} transparent opacity={0.9} roughness={0.1} metalness={0.6} />
                        </mesh>
                        <mesh position={[0, 0.45, 0]} geometry={BOTTLE_NECK}>
                            <meshStandardMaterial color={data.type === ObjectType.PLAYER_PROJECTILE ? "#00ff00" : "#663300"} transparent opacity={0.9} roughness={0.1} />
                        </mesh>
                        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                            <cylinderGeometry args={[0.155, 0.155, 0.3, 8]} />
                            <meshBasicMaterial color="#d4af37" />
                        </mesh>
                    </group>
                )}
                
                {/* --- BOSS PROJECTILE (BEER BOTTLE, FOOD, TIRE) --- */}
                {data.type === ObjectType.BOSS_PROJECTILE && (
                    <group rotation={data.bossType === 'KALIN' ? [0,0,0] : [Math.PI / 2, 0, 0]} scale={[1.5, 1.5, 1.5]}>
                        {data.projectileVariant === 'steak' && (
                            <mesh geometry={STEAK_GEO}>
                                <meshStandardMaterial color="#8B0000" roughness={0.8} />
                            </mesh>
                        )}
                        {data.projectileVariant === 'potato' && (
                            <mesh geometry={POTATO_GEO}>
                                <meshStandardMaterial color="#D2B48C" roughness={0.9} />
                            </mesh>
                        )}
                        {data.projectileVariant === 'tire' && (
                            <mesh geometry={TIRE_GEO}>
                                <meshStandardMaterial color="#222" roughness={0.9} />
                            </mesh>
                        )}
                        {(!data.projectileVariant || data.projectileVariant === 'bottle') && (
                            <group>
                                <mesh geometry={BOTTLE_BODY}>
                                    <meshStandardMaterial color="#8B4513" transparent opacity={0.9} roughness={0.1} metalness={0.6} />
                                </mesh>
                                <mesh position={[0, 0.45, 0]} geometry={BOTTLE_NECK}>
                                    <meshStandardMaterial color="#8B4513" transparent opacity={0.9} roughness={0.1} />
                                </mesh>
                                <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                                    <cylinderGeometry args={[0.155, 0.155, 0.3, 8]} />
                                    <meshBasicMaterial color="#a67c00" />
                                </mesh>
                            </group>
                        )}
                    </group>
                )}

                {/* --- BARREL --- */}
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
                        <mesh geometry={CAT_BODY_GEO} castShadow>
                            <meshStandardMaterial color="#111" roughness={0.8} />
                        </mesh>
                        <mesh position={[0.2, 0.15, 0]} geometry={CAT_HEAD_GEO}>
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh position={[0.25, 0.3, 0.08]} rotation={[0, 0, -0.2]} geometry={CAT_EAR_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                         <mesh position={[0.25, 0.3, -0.08]} rotation={[0, 0, -0.2]} geometry={CAT_EAR_GEO}>
                             <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, 0.5]} geometry={CAT_TAIL_GEO}>
                            <meshStandardMaterial color="#111" />
                        </mesh>
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
                        <mesh geometry={CRATE_GEO} castShadow>
                            <meshStandardMaterial color="#FFD700" roughness={0.4} />
                        </mesh>
                        <mesh position={[0, 0.3, 0]} geometry={CRATE_INNER_GEO}>
                             <meshStandardMaterial color="#2e1a05" />
                        </mesh>
                        <mesh position={[0, 0, 0.41]}>
                            <planeGeometry args={[0.4, 0.2]} />
                            <meshBasicMaterial color="red" />
                        </mesh>
                    </group>
                )}

                {/* --- GEM --- */}
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
                                    textShadow: `0 0 5px ${data.color}`,
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
