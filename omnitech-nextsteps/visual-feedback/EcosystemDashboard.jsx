/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Ecosystem Dashboard — Real-Time Portal Monitoring                 ║
 * ║   ScrollVerse Trinity Sovereign Ecosystem v3.0.0                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from "react";
import FrequencyVisualizer from "./FrequencyVisualizer";
import "./EcosystemDashboard.css";

const EcosystemDashboard = () => {
  const [portals, setPortals] = useState([
    { id: 1, name: "Unified Sovereign Kernel", frequency: 432, status: "online", health: 100 },
    { id: 2, name: "Live Frequency Activation", frequency: 528, status: "online", health: 95 },
    { id: 3, name: "$LONDC Passive Income", frequency: 963, status: "online", health: 98 },
    { id: 4, name: "AI Guardian", frequency: 963, status: "online", health: 100 },
    { id: 5, name: "Rose Gold Encryption", frequency: 528, status: "online", health: 97 },
  ]);

  const [awakenedNodes, setAwakenedNodes] = useState([
    { id: 1, location: "New York", guardians: 1500, frequency: 528 },
    { id: 2, location: "London", guardians: 1200, frequency: 963 },
    { id: 3, location: "Tokyo", guardians: 1800, frequency: 432 },
    { id: 4, location: "Dubai", guardians: 900, frequency: 963 },
    { id: 5, location: "Sydney", guardians: 700, frequency: 528 },
  ]);

  const [activeFrequency, setActiveFrequency] = useState(528);
  const [ecosystemHealth, setEcosystemHealth] = useState(98);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setPortals((prev) =>
        prev.map((portal) => ({
          ...portal,
          health: Math.max(85, portal.health + (Math.random() - 0.5) * 5),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    return status === "online" ? "#00ff88" : "#ff4444";
  };

  return (
    <div className="ecosystem-dashboard">
      <header className="dashboard-header">
        <h1>🕋 ScrollVerse Trinity Ecosystem Dashboard</h1>
        <p>Real-Time Portal Monitoring & Frequency Synchronization</p>
      </header>

      <div className="dashboard-grid">
        {/* Frequency Visualizer */}
        <div className="dashboard-section visualizer-section">
          <FrequencyVisualizer frequency={activeFrequency} isActive={true} />
        </div>

        {/* Portal Status */}
        <div className="dashboard-section portals-section">
          <h2>Portal Status</h2>
          <div className="portals-list">
            {portals.map((portal) => (
              <div
                key={portal.id}
                className="portal-card"
                onClick={() => setActiveFrequency(portal.frequency)}
              >
                <div className="portal-header">
                  <span className="portal-name">{portal.name}</span>
                  <span
                    className="portal-status"
                    style={{ color: getStatusColor(portal.status) }}
                  >
                    {portal.status === "online" ? "🟢" : "🔴"}
                  </span>
                </div>
                <div className="portal-frequency">
                  <span className="frequency-label">{portal.frequency} Hz</span>
                </div>
                <div className="health-bar">
                  <div
                    className="health-fill"
                    style={{
                      width: `${portal.health}%`,
                      backgroundColor: portal.health > 80 ? "#00ff88" : "#ffaa00",
                    }}
                  />
                </div>
                <span className="health-text">{portal.health.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem Stats */}
        <div className="dashboard-section stats-section">
          <h2>Ecosystem Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Overall Health</span>
              <span className="stat-value">{ecosystemHealth.toFixed(0)}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Portals Online</span>
              <span className="stat-value">{portals.filter((p) => p.status === "online").length}/5</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Frequency</span>
              <span className="stat-value">{activeFrequency} Hz</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Threat Level</span>
              <span className="stat-value">🟢 GREEN</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Awakened Nodes</span>
              <span className="stat-value">{awakenedNodes.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Guardians</span>
              <span className="stat-value">{awakenedNodes.reduce((acc, node) => acc + node.guardians, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section awakened-nodes-section">
        <h2>Awakened Nodes Map</h2>
        <div className="awakened-nodes-map">
          {awakenedNodes.map((node) => (
            <div key={node.id} className="node-pin" style={{ top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%` }}>
              <span className="node-location">{node.location}</span>
              <span className="node-guardians">{node.guardians.toLocaleString()} G</span>
              <span className="node-frequency">{node.frequency} Hz</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>🕋 ScrollSoul Sovereignty — All 5 Portals Resonating in Harmony</p>
        <p>Last Updated: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
};

export default EcosystemDashboard;
