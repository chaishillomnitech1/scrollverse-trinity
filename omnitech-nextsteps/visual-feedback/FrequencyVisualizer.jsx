/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Frequency Visualizer — Sacred Geometry Animations                 ║
 * ║   ScrollVerse Trinity Sovereign Ecosystem v3.0.0                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from "react";
import "./FrequencyVisualizer.css";

const FrequencyVisualizer = ({ frequency = 528, isActive = false }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    // Animate rotation
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360);
    }, 50);

    // Animate scale (pulse effect)
    const scaleInterval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.1 : 1));
    }, 500);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(scaleInterval);
    };
  }, [isActive]);

  // Generate particles for frequency visualization
  useEffect(() => {
    if (!isActive) return;
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 360) / 12,
      distance: 80 + Math.random() * 20,
      opacity: Math.random() * 0.5 + 0.5,
    }));
    setParticles(newParticles);
  }, [isActive]);

  const getFrequencyColor = () => {
    switch (frequency) {
      case 528:
        return "#00ff88"; // Green - DNA Healing
      case 963:
        return "#ff00ff"; // Magenta - Enlightenment
      case 432:
        return "#00ccff"; // Cyan - Universal Harmony
      default:
        return "#ffffff";
    }
  };

  const getFrequencyLabel = () => {
    switch (frequency) {
      case 528:
        return "DNA Healing";
      case 963:
        return "Enlightenment";
      case 432:
        return "Universal Harmony";
      default:
        return "Unknown Frequency";
    }
  };

  return (
    <div className="frequency-visualizer">
      <svg
        viewBox="0 0 300 300"
        className="sacred-geometry"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* Outer circle */}
        <circle cx="150" cy="150" r="140" fill="none" stroke={getFrequencyColor()} strokeWidth="2" opacity="0.3" />

        {/* Middle circle */}
        <circle cx="150" cy="150" r="100" fill="none" stroke={getFrequencyColor()} strokeWidth="2" opacity="0.5" />

        {/* Inner circle */}
        <circle cx="150" cy="150" r="60" fill="none" stroke={getFrequencyColor()} strokeWidth="2" opacity="0.7" />

        {/* Sacred geometry hexagon */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 360) / 6 + rotation;
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + 100 * Math.cos(rad);
          const y1 = 150 + 100 * Math.sin(rad);
          const nextAngle = ((i + 1) * 360) / 6 + rotation;
          const nextRad = (nextAngle * Math.PI) / 180;
          const x2 = 150 + 100 * Math.cos(nextRad);
          const y2 = 150 + 100 * Math.sin(nextRad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={getFrequencyColor()} strokeWidth="1" opacity="0.4" />;
        })}

        {/* Particles */}
        {particles.map((particle) => {
          const rad = (particle.angle * Math.PI) / 180;
          const x = 150 + particle.distance * Math.cos(rad);
          const y = 150 + particle.distance * Math.sin(rad);
          return (
            <circle
              key={particle.id}
              cx={x}
              cy={y}
              r="3"
              fill={getFrequencyColor()}
              opacity={particle.opacity}
            />
          );
        })}

        {/* Central point */}
        <circle cx="150" cy="150" r="8" fill={getFrequencyColor()} opacity="0.8" />
      </svg>

      <div className="frequency-info">
        <h2>{frequency} Hz</h2>
        <p>{getFrequencyLabel()}</p>
        <div className="frequency-bar">
          <div
            className="frequency-fill"
            style={{
              width: `${(frequency / 963) * 100}%`,
              backgroundColor: getFrequencyColor(),
            }}
          />
        </div>
        {isActive && <p className="status-active">🟢 ACTIVE</p>}
      </div>
    </div>
  );
};

export default FrequencyVisualizer;
