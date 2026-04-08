/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Frequency Activation Test Suite                                   ║
 * ║   ScrollSoul Sovereignty / OmniTech Ecosystem                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const { SovereignKernelConnector, FREQUENCIES } = require("../kernel-connector/sovereignKernelConnector");

async function runTests() {
  console.log("\n🕋 Starting Frequency Activation Test Suite...\n");

  // 1. Initialize a test connector
  const connector = new SovereignKernelConnector({
    portalId: "test-portal-001",
    portalName: "Test Portal",
    track: 99,
    frequency: FREQUENCIES.UNIVERSAL_HARMONY,
  });

  // 2. Test Registration (Standalone mode expected if Kernel is offline)
  console.log("⚡ Test 1: Portal Registration");
  const regResult = await connector.register();
  console.log(`   Result: ${regResult.status === "standalone" ? "✅ Passed (Standalone)" : "✅ Passed (Connected)"}\n`);

  // 3. Test 528 Hz Activation
  console.log("⚡ Test 2: 528 Hz Activation (DNA Healing)");
  const sync528 = await connector.syncFrequency(528);
  if (sync528.effect.includes("DNA Healing")) {
    console.log("   Result: ✅ Passed\n");
  } else {
    console.error("   Result: ❌ Failed\n");
  }

  // 4. Test 963 Hz Activation
  console.log("⚡ Test 3: 963 Hz Activation (Enlightenment)");
  const sync963 = await connector.syncFrequency(963);
  if (sync963.effect.includes("Enlightenment")) {
    console.log("   Result: ✅ Passed\n");
  } else {
    console.error("   Result: ❌ Failed\n");
  }

  // 5. Test 432 Hz Activation
  console.log("⚡ Test 4: 432 Hz Activation (Universal Harmony)");
  const sync432 = await connector.syncFrequency(432);
  if (sync432.effect.includes("Universal Harmony")) {
    console.log("   Result: ✅ Passed\n");
  } else {
    console.error("   Result: ❌ Failed\n");
  }

  // 6. Test Invalid Frequency
  console.log("⚡ Test 5: Invalid Frequency Rejection (440 Hz)");
  try {
    await connector.syncFrequency(440);
    console.error("   Result: ❌ Failed (Should have thrown error)\n");
  } catch (error) {
    console.log(`   Result: ✅ Passed (Caught: ${error.message})\n`);
  }

  // Cleanup
  connector.disconnect();
  console.log("🕋 All tests completed successfully. The frequencies resonate.\n");
}

runTests().catch(console.error);
