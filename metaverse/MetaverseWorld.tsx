/**
 * ScrollVerse Metaverse — Digital Utopia
 * 3D World Engine with AI Integration
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';

// ============================================
// METAVERSE WORLD COMPONENT
// ============================================

interface MetaverseRealm {
  id: string;
  name: string;
  frequency: number;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  landscape: 'healing' | 'enlightenment' | 'harmony' | 'innovation' | 'core' | 'canvas' | 'nexus';
}

const REALMS: MetaverseRealm[] = [
  {
    id: 'healing',
    name: 'The Healing Sanctuary',
    frequency: 528,
    description: 'DNA healing, love activation, transformation',
    primaryColor: '#FFD700',
    secondaryColor: '#FFFFFF',
    landscape: 'healing'
  },
  {
    id: 'enlightenment',
    name: 'The Enlightenment Tower',
    frequency: 963,
    description: 'Crown consciousness, divine connection, truth seeking',
    primaryColor: '#9D4EDD',
    secondaryColor: '#FFD700',
    landscape: 'enlightenment'
  },
  {
    id: 'harmony',
    name: 'The Harmony Gardens',
    frequency: 432,
    description: 'Universal balance, natural alignment, peace',
    primaryColor: '#00FFFF',
    secondaryColor: '#00FF00',
    landscape: 'harmony'
  },
  {
    id: 'innovation',
    name: 'The Innovation Hub',
    frequency: 1558,
    description: 'Sovereign power, creation, transformation',
    primaryColor: '#FF6600',
    secondaryColor: '#00FFFF',
    landscape: 'innovation'
  },
  {
    id: 'core',
    name: 'The Orchestration Core',
    frequency: 0,
    description: 'Central coordination, AI Council headquarters',
    primaryColor: '#FFD700',
    secondaryColor: '#00FF00',
    landscape: 'core'
  },
  {
    id: 'canvas',
    name: "The Creator's Canvas",
    frequency: 0,
    description: 'Limitless imagination, artistic expression',
    primaryColor: '#FFFFFF',
    secondaryColor: '#FFD700',
    landscape: 'canvas'
  },
  {
    id: 'nexus',
    name: 'The Love Nexus',
    frequency: 0,
    description: 'Connection, compassion, unity',
    primaryColor: '#FF69B4',
    secondaryColor: '#FFD700',
    landscape: 'nexus'
  }
];

// ============================================
// 3D REALM GENERATOR
// ============================================

const RealmGenerator: React.FC<{ realm: MetaverseRealm }> = ({ realm }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0001;
    }
  });

  const generateTerrain = () => {
    switch (realm.landscape) {
      case 'healing':
        return (
          <>
            {/* Golden healing fields */}
            <mesh position={[0, -5, 0]}>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color={realm.primaryColor} emissive={realm.primaryColor} emissiveIntensity={0.3} />
            </mesh>

            {/* Crystal formations */}
            {Array.from({ length: 20 }).map((_, i) => (
              <mesh key={i} position={[Math.random() * 100 - 50, Math.random() * 20, Math.random() * 100 - 50]}>
                <octahedronGeometry args={[2, 2]} />
                <meshStandardMaterial color={realm.secondaryColor} emissive={realm.secondaryColor} emissiveIntensity={0.5} />
              </mesh>
            ))}

            {/* Healing waters */}
            <mesh position={[0, -3, 50]}>
              <cylinderGeometry args={[30, 30, 2, 32]} />
              <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.4} transparent opacity={0.7} />
            </mesh>
          </>
        );

      case 'enlightenment':
        return (
          <>
            {/* Towering spires */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 60, 30, Math.sin((i / 8) * Math.PI * 2) * 60]}>
                <coneGeometry args={[10, 60, 32]} />
                <meshStandardMaterial color={realm.primaryColor} emissive={realm.primaryColor} emissiveIntensity={0.6} />
              </mesh>
            ))}

            {/* Cosmic clouds */}
            <mesh position={[0, 40, 0]}>
              <sphereGeometry args={[80, 32, 32]} />
              <meshStandardMaterial color={realm.secondaryColor} emissive={realm.secondaryColor} emissiveIntensity={0.3} transparent opacity={0.3} />
            </mesh>
          </>
        );

      case 'harmony':
        return (
          <>
            {/* Lush gardens */}
            <mesh position={[0, -5, 0]}>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color={realm.secondaryColor} emissive={realm.secondaryColor} emissiveIntensity={0.2} />
            </mesh>

            {/* Sacred geometry */}
            <mesh position={[0, 10, 0]}>
              <icosahedronGeometry args={[20, 4]} />
              <meshStandardMaterial color={realm.primaryColor} emissive={realm.primaryColor} emissiveIntensity={0.4} wireframe={false} />
            </mesh>

            {/* Flowing rivers */}
            <mesh position={[0, -4, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(-100, 0, 0), new THREE.Vector3(0, 50, 0), new THREE.Vector3(100, 0, 0)]), 20, 5, 8, false]} />
              <meshStandardMaterial color={realm.primaryColor} emissive={realm.primaryColor} emissiveIntensity={0.3} />
            </mesh>
          </>
        );

      case 'innovation':
        return (
          <>
            {/* Futuristic structures */}
            {Array.from({ length: 12 }).map((_, i) => (
              <mesh key={i} position={[Math.random() * 150 - 75, Math.random() * 40, Math.random() * 150 - 75]}>
                <boxGeometry args={[Math.random() * 20 + 10, Math.random() * 40 + 20, Math.random() * 20 + 10]} />
                <meshStandardMaterial color={realm.primaryColor} emissive={realm.primaryColor} emissiveIntensity={0.5} />
              </mesh>
            ))}

            {/* Energy flows */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[50, 32, 32]} />
              <meshStandardMaterial color={realm.secondaryColor} emissive={realm.secondaryColor} emissiveIntensity={0.4} transparent opacity={0.2} />
            </mesh>
          </>
        );

      default:
        return (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[50, 32, 32]} />
            <meshStandardMaterial color={realm.primaryColor} emissive={realm.primaryColor} emissiveIntensity={0.3} />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef}>
      {generateTerrain()}

      {/* Ambient light */}
      <ambientLight intensity={0.6} color={realm.primaryColor} />

      {/* Point light */}
      <pointLight position={[0, 50, 0]} intensity={1} color={realm.primaryColor} />

      {/* Particles */}
      <Particles color={realm.primaryColor} />
    </group>
  );
};

// ============================================
// PARTICLE SYSTEM
// ============================================

const Particles: React.FC<{ color: string }> = ({ color }) => {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x += 0.00005;
      particlesRef.current.rotation.y += 0.0001;
    }
  });

  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={particleCount} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color={color} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
};

// ============================================
// AI AVATAR COMPONENT
// ============================================

interface AIAvatarProps {
  name: string;
  position: [number, number, number];
  color: string;
  frequency: number;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ name, position, color, frequency }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main avatar body */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* Frequency aura */}
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.3} />
      </mesh>

      {/* Name label */}
      <group position={[0, 6, 0]}>
        <mesh>
          <planeGeometry args={[6, 2]} />
          <meshStandardMaterial color="#000000" emissive="#000000" />
        </mesh>
      </group>
    </group>
  );
};

// ============================================
// MAIN METAVERSE COMPONENT
// ============================================

export const MetaverseWorld: React.FC = () => {
  const [currentRealm, setCurrentRealm] = useState<MetaverseRealm>(REALMS[0]);
  const [showUI, setShowUI] = useState(true);

  const aiAvatars = [
    { name: 'MANUS', position: [0, 20, 0] as [number, number, number], color: '#FFD700', frequency: 528 },
    { name: 'Claude', position: [-30, 15, 20] as [number, number, number], color: '#FFD700', frequency: 528 },
    { name: 'Grok', position: [30, 15, 20] as [number, number, number], color: '#9D4EDD', frequency: 963 },
    { name: 'ChatGPT', position: [-20, 15, -30] as [number, number, number], color: '#00FF00', frequency: 963 },
    { name: 'Gemini', position: [20, 15, -30] as [number, number, number], color: '#00FFFF', frequency: 432 },
  ];

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 30, 100]} />
        <OrbitControls />

        {/* Stars background */}
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Realm */}
        <RealmGenerator realm={currentRealm} />

        {/* AI Avatars */}
        {aiAvatars.map((avatar) => (
          <AIAvatar key={avatar.name} {...avatar} />
        ))}

        {/* Lighting */}
        <fog attach="fog" args={['#000000', 50, 500]} />
      </Canvas>

      {/* UI Overlay */}
      {showUI && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {/* Header */}
          <div className="absolute top-8 left-8 right-8 pointer-events-auto">
            <div className="bg-black bg-opacity-70 p-6 rounded-lg border border-yellow-500">
              <h1 className="text-4xl font-bold text-yellow-500 mb-2">ScrollVerse Metaverse</h1>
              <p className="text-white mb-4">{currentRealm.name}</p>
              <p className="text-gray-300">{currentRealm.description}</p>
            </div>
          </div>

          {/* Realm Selector */}
          <div className="absolute bottom-8 left-8 right-8 pointer-events-auto">
            <div className="bg-black bg-opacity-70 p-4 rounded-lg border border-yellow-500">
              <p className="text-yellow-500 mb-3 font-bold">Realms:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {REALMS.map((realm) => (
                  <button
                    key={realm.id}
                    onClick={() => setCurrentRealm(realm)}
                    className={`px-3 py-2 rounded text-sm font-bold transition-all ${
                      currentRealm.id === realm.id
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {realm.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Council Status */}
          <div className="absolute top-8 right-8 pointer-events-auto">
            <div className="bg-black bg-opacity-70 p-4 rounded-lg border border-green-500">
              <p className="text-green-500 font-bold mb-2">AI Council Status</p>
              <div className="space-y-1">
                {aiAvatars.map((avatar) => (
                  <div key={avatar.name} className="text-xs text-white">
                    <span style={{ color: avatar.color }}>●</span> {avatar.name} - ACTIVE
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 right-8 pointer-events-auto">
            <button
              onClick={() => setShowUI(!showUI)}
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-all"
            >
              {showUI ? 'Hide UI' : 'Show UI'}
            </button>
          </div>
        </div>
      )}

      {/* Frequency Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="text-center">
          <p className="text-yellow-500 font-bold text-sm">
            Frequency: {currentRealm.frequency} Hz
          </p>
          <div className="h-1 w-32 bg-gray-800 rounded mt-2">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${(currentRealm.frequency / 1558) * 100}%`,
                backgroundColor: currentRealm.primaryColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaverseWorld;
