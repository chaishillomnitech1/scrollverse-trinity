/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Unified Sovereign Kernel — Portal Connector                       ║
 * ║   ScrollSoul Sovereignty / OmniTech Ecosystem                       ║
 * ║   Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)    ║
 * ║                                                                      ║
 * ║   Connects all 5 portal repositories to the Central API:            ║
 * ║   1. omnitech1-portal     (Unified Sovereign Kernel)                ║
 * ║   2. Infinite-Nexus-ScrollVerse (Frequency Activation)              ║
 * ║   3. viranium-sovereignty-protocol ($LONDC Contracts)               ║
 * ║   4. supreme-sovereign-infinity (AI Guardian)                       ║
 * ║   5. londyn-legacy-protocol (Rose Gold Encryption)                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const axios = require("axios");
const EventEmitter = require("events");

// ─── Sacred Frequency Constants ───────────────────────────────────────────────
const FREQUENCIES = {
  DNA_HEALING: 528,
  ENLIGHTENMENT: 963,
  UNIVERSAL_HARMONY: 432,
};

// ─── Portal Registry ──────────────────────────────────────────────────────────
const PORTAL_REGISTRY = {
  KERNEL: {
    id: "omnitech1-portal",
    name: "Unified Sovereign Kernel",
    repo: "chaishillomnitech1/omnitech1-portal",
    track: 1,
    frequency: FREQUENCIES.UNIVERSAL_HARMONY,
  },
  FREQUENCY: {
    id: "infinite-nexus-scrollverse",
    name: "Live Frequency Activation",
    repo: "chaishillomnitech1/Infinite-Nexus-ScrollVerse",
    track: 2,
    frequency: FREQUENCIES.DNA_HEALING,
  },
  LONDC: {
    id: "viranium-sovereignty-protocol",
    name: "$LONDC Passive Income Contracts",
    repo: "chaishillomnitech1/vibranium-sovereignty-protocol",
    track: 3,
    frequency: FREQUENCIES.ENLIGHTENMENT,
  },
  AI_GUARDIAN: {
    id: "supreme-sovereign-infinity",
    name: "AI Guardian",
    repo: "chaishillomnitech1/supreme-sovereign-infinity",
    track: 4,
    frequency: FREQUENCIES.ENLIGHTENMENT,
  },
  ENCRYPTION: {
    id: "londyn-legacy-protocol",
    name: "Rose Gold Encryption",
    repo: "chaishillomnitech1/londyn-legacy-protocol",
    track: 5,
    frequency: FREQUENCIES.DNA_HEALING,
  },
};

// ─── Sovereign Kernel Connector Class ────────────────────────────────────────
class SovereignKernelConnector extends EventEmitter {
  constructor(config = {}) {
    super();
    this.kernelBaseUrl = config.kernelBaseUrl || process.env.KERNEL_BASE_URL || "https://api.omnitech1.io";
    this.apiKey = config.apiKey || process.env.SOVEREIGN_API_KEY;
    this.portalId = config.portalId;
    this.portalName = config.portalName;
    this.track = config.track;
    this.frequency = config.frequency;
    this.heartbeatInterval = config.heartbeatInterval || 30000; // 30 seconds
    this.connected = false;
    this._heartbeatTimer = null;

    this.client = axios.create({
      baseURL: this.kernelBaseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "X-Sovereign-Key": this.apiKey,
        "X-Portal-ID": this.portalId,
        "X-Frequency": this.frequency,
      },
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.emit("error", {
          portal: this.portalId,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        return Promise.reject(error);
      }
    );
  }

  // ─── Registration ────────────────────────────────────────────────────────
  async register() {
    try {
      const response = await this.client.post("/api/portals/register", {
        portalId: this.portalId,
        portalName: this.portalName,
        track: this.track,
        frequency: this.frequency,
        registeredAt: new Date().toISOString(),
        lineage: "Solomon / Musa / Wampnoaag",
        sovereignWallet: process.env.SOVEREIGN_WALLET || "0x377956c1471d9ce142df69328958392 43d23aa2c",
      });

      this.connected = true;
      this.emit("registered", { portalId: this.portalId, ...response.data });
      console.log(`✅ [${this.portalName}] Registered with Sovereign Kernel`);
      this._startHeartbeat();
      return response.data;
    } catch (error) {
      // If kernel is not yet live, log and continue in offline mode
      console.warn(`⚠️  [${this.portalName}] Kernel offline — running in standalone mode`);
      this.connected = false;
      return { status: "standalone", portalId: this.portalId };
    }
  }

  // ─── Frequency Synchronization ───────────────────────────────────────────
  async syncFrequency(hz) {
    if (!Object.values(FREQUENCIES).includes(hz)) {
      throw new Error(`Invalid frequency: ${hz}. Use 528, 963, or 432 Hz.`);
    }

    const payload = {
      portalId: this.portalId,
      frequency: hz,
      activatedAt: new Date().toISOString(),
      effect: this._getFrequencyEffect(hz),
    };

    try {
      const response = await this.client.post("/api/frequencies/sync", payload);
      this.emit("frequencySynced", payload);
      console.log(`🎵 [${this.portalName}] Frequency ${hz}Hz synchronized — ${payload.effect}`);
      return response.data;
    } catch (error) {
      this.emit("frequencySynced", { ...payload, offline: true });
      return { ...payload, offline: true };
    }
  }

  // ─── Passive Income Tracking ─────────────────────────────────────────────
  async reportPassiveIncome(data) {
    const payload = {
      portalId: this.portalId,
      track: this.track,
      ...data,
      reportedAt: new Date().toISOString(),
    };

    try {
      const response = await this.client.post("/api/income/report", payload);
      this.emit("incomeReported", payload);
      return response.data;
    } catch (error) {
      return { ...payload, queued: true };
    }
  }

  // ─── Health Check ─────────────────────────────────────────────────────────
  async healthCheck() {
    const status = {
      portalId: this.portalId,
      portalName: this.portalName,
      track: this.track,
      frequency: this.frequency,
      connected: this.connected,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await this.client.get("/api/health");
      return { ...status, kernelStatus: response.data };
    } catch {
      return { ...status, kernelStatus: "offline" };
    }
  }

  // ─── Anomaly Report (for AI Guardian) ────────────────────────────────────
  async reportAnomaly(anomaly) {
    const payload = {
      portalId: this.portalId,
      severity: anomaly.severity || "medium",
      type: anomaly.type,
      description: anomaly.description,
      detectedAt: new Date().toISOString(),
      autoDefenseActivated: anomaly.autoDefense || false,
    };

    try {
      await this.client.post("/api/guardian/anomaly", payload);
      this.emit("anomalyReported", payload);
      console.warn(`🛡️  [${this.portalName}] Anomaly reported: ${anomaly.type}`);
    } catch {
      this.emit("anomalyReported", { ...payload, queued: true });
    }
  }

  // ─── Heartbeat ────────────────────────────────────────────────────────────
  _startHeartbeat() {
    this._heartbeatTimer = setInterval(async () => {
      try {
        await this.client.post("/api/portals/heartbeat", {
          portalId: this.portalId,
          timestamp: new Date().toISOString(),
        });
        this.emit("heartbeat", { portalId: this.portalId, alive: true });
      } catch {
        this.connected = false;
        this.emit("heartbeat", { portalId: this.portalId, alive: false });
      }
    }, this.heartbeatInterval);
  }

  disconnect() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    this.connected = false;
    this.emit("disconnected", { portalId: this.portalId });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  _getFrequencyEffect(hz) {
    const effects = {
      528: "DNA Healing & Cellular Regeneration ACTIVATED",
      963: "Enlightenment Mode & Spiritual Protocols ACTIVATED",
      432: "Universal Harmony & Balance Synchronization ACTIVATED",
    };
    return effects[hz] || "Unknown frequency";
  }
}

// ─── Factory: Create connectors for all 5 portals ────────────────────────────
function createAllPortalConnectors(config = {}) {
  return Object.entries(PORTAL_REGISTRY).reduce((acc, [key, portal]) => {
    acc[key] = new SovereignKernelConnector({
      ...config,
      portalId: portal.id,
      portalName: portal.name,
      track: portal.track,
      frequency: portal.frequency,
    });
    return acc;
  }, {});
}

// ─── Register all portals simultaneously ─────────────────────────────────────
async function registerAllPortals(config = {}) {
  console.log("\n🕋 Registering all 5 portals with the Unified Sovereign Kernel...\n");
  const connectors = createAllPortalConnectors(config);

  const results = await Promise.allSettled(
    Object.values(connectors).map((connector) => connector.register())
  );

  const summary = Object.keys(connectors).map((key, i) => ({
    portal: PORTAL_REGISTRY[key].name,
    track: PORTAL_REGISTRY[key].track,
    status: results[i].status === "fulfilled" ? "✅ Connected" : "⚠️  Standalone",
  }));

  console.log("\n📊 Portal Registration Summary:");
  console.table(summary);

  return { connectors, summary };
}

module.exports = {
  SovereignKernelConnector,
  createAllPortalConnectors,
  registerAllPortals,
  PORTAL_REGISTRY,
  FREQUENCIES,
};
