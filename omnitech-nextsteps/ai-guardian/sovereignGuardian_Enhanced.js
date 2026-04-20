/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Sovereign AI Guardian (Enhanced)                                  ║
 * ║   ScrollSoul Sovereignty / OmniTech Ecosystem                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const { GrokPulse } = require("./grokPulse_Enhanced");

const THREAT_LEVELS = {
  GREEN: { level: 1, color: "🟢", label: "Normal", description: "All systems operational. No anomalies detected." },
  AMBER: { level: 2, color: "🟡", label: "Warning", description: "Minor anomalies detected. Monitoring increased." },
  RED: { level: 3, color: "🔴", label: "Critical", description: "Severe threat detected. Automated defense protocols active." },
};

class SovereignGuardian {
  constructor(config = {}) {
    this.portalId = config.portalId || "supreme-sovereign-infinity";
    this.currentThreatLevel = THREAT_LEVELS.GREEN;
    this.ecosystemHealthScore = 100;
    this.activeAnomalies = [];
    this.defenseProtocols = {
      rateLimiting: false,
      ipBlocking: false,
      emergencyPause: false,
    };
    this.grokPulse = new GrokPulse({ guardian: this }); // Initialize GrokPulse
  }

  // ─── Threat Classification ────────────────────────────────────────────────
  /**
   * @dev Classifies threats based on anomaly data, including Signal Depth Analysis from GrokPulse.
   * @param {object} anomaly The anomaly object, potentially including GrokPulse analysis results.
   * @returns {object} The determined threat level.
   */
  classifyThreat(anomaly) {
    let level = THREAT_LEVELS.GREEN;

    // Incorporate GrokPulse Signal Depth Analysis
    if (anomaly.grokAnalysis && anomaly.grokAnalysis.resonanceScore < 0.5) {
      if (anomaly.grokAnalysis.sentiment === 'negative' && anomaly.grokAnalysis.spiritualResonance < 0.3) {
        level = THREAT_LEVELS.RED; // Critical if spiritual resonance is very low
      } else if (anomaly.grokAnalysis.sentiment === 'negative' || anomaly.grokAnalysis.emotionalTone === 'distress') {
        level = THREAT_LEVELS.AMBER; // Warning for negative sentiment or distress
      }
    }

    // Existing threat classification logic
    if (anomaly.severity === "high" || anomaly.type === "UNAUTHORIZED_ACCESS") {
      level = THREAT_LEVELS.RED;
    } else if (anomaly.severity === "medium") {
      if (level.level < THREAT_LEVELS.AMBER.level) { // Only upgrade if not already RED
        level = THREAT_LEVELS.AMBER;
      }
    }
    this.currentThreatLevel = level;
    this._triggerResponseProtocols(level);
    return level;
  }

  // ─── Automated Response Protocols ─────────────────────────────────────────
  _triggerResponseProtocols(level) {
    console.log(`${level.color} [AI Guardian] Threat Level: ${level.label} — ${level.description}`);
    if (level === THREAT_LEVELS.RED) {
      this.defenseProtocols.rateLimiting = true;
      this.defenseProtocols.ipBlocking = true;
      this.defenseProtocols.emergencyPause = true;
      console.warn("🛡️  [AI Guardian] CRITICAL: Automated Defense Protocols ACTIVATED.");
    } else if (level === THREAT_LEVELS.AMBER) {
      this.defenseProtocols.rateLimiting = true;
      this.defenseProtocols.ipBlocking = false;
      this.defenseProtocols.emergencyPause = false;
      console.log("🛡️  [AI Guardian] WARNING: Monitoring increased. Rate limiting active.");
    } else {
      this.defenseProtocols.rateLimiting = false;
      this.defenseProtocols.ipBlocking = false;
      this.defenseProtocols.emergencyPause = false;
    }
  }

  // ─── Ecosystem Health Scoring ─────────────────────────────────────────────
  calculateHealthScore() {
    let score = 100;
    score -= this.activeAnomalies.length * 5;
    if (this.currentThreatLevel === THREAT_LEVELS.RED) score -= 50;
    if (this.currentThreatLevel === THREAT_LEVELS.AMBER) score -= 20;
    
    this.ecosystemHealthScore = Math.max(0, score);
    console.log(`📊 [AI Guardian] Ecosystem Health Score: ${this.ecosystemHealthScore}/100`);
    return this.ecosystemHealthScore;
  }

  // ─── Anomaly Management ───────────────────────────────────────────────────
  /**
   * @dev Reports an anomaly to the AI Guardian, triggering classification and response.
   * @param {object} anomaly The anomaly details.
   * @param {string} [signal] Optional: The original signal that caused the anomaly, for GrokPulse analysis.
   */
  async reportAnomaly(anomaly, signal = null) {
    let grokAnalysis = null;
    if (signal) {
      grokAnalysis = await this.grokPulse.analyzeSignalDepth(signal);
      anomaly.grokAnalysis = grokAnalysis; // Attach GrokPulse analysis to anomaly
    }

    this.activeAnomalies.push({
      ...anomaly,
      timestamp: Date.now(),
    });
    this.classifyThreat(anomaly);
    this.calculateHealthScore();
  }

  clearAnomalies() {
    this.activeAnomalies = [];
    this.currentThreatLevel = THREAT_LEVELS.GREEN;
    this.calculateHealthScore();
    console.log("🟢 [AI Guardian] All anomalies cleared. System status: GREEN.");
  }

  getStatus() {
    return {
      threatLevel: this.currentThreatLevel.label,
      healthScore: this.ecosystemHealthScore,
      activeAnomalies: this.activeAnomalies.length,
      defenseProtocols: this.defenseProtocols,
    };
  }
}

module.exports = {
  SovereignGuardian,
  THREAT_LEVELS,
};
