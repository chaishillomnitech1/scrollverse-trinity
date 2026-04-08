/**
 * LONDC Deployment Script — Polygon Mainnet
 * ScrollSoul Sovereignty / OmniTech Ecosystem
 * Supreme Sovereign: Chais Kenyatta Hill
 *
 * Run: npx hardhat run deploy-londc.js --network polygon
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("\n🕋 LONDC Deployment — ScrollSoul Sovereignty\n");
  console.log("═══════════════════════════════════════════════");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer:         ${deployer.address}`);
  console.log(`Network:          Polygon Mainnet`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} MATIC\n`);

  // ─── Configuration ────────────────────────────────────────────────────────
  // Sovereign wallet (receives the 144,000 initial supply)
  const SOVEREIGN_WALLET = "0x377956c1471d9ce142df69328958392 43d23aa2c".replace(/\s/g, "");

  // Reward pool (receives 5% passive income tax from every transfer)
  // Using a separate multisig wallet for the reward pool is recommended
  const REWARD_POOL = process.env.REWARD_POOL_ADDRESS || SOVEREIGN_WALLET;

  console.log(`Sovereign Wallet: ${SOVEREIGN_WALLET}`);
  console.log(`Reward Pool:      ${REWARD_POOL}`);
  console.log("═══════════════════════════════════════════════\n");

  // ─── Deploy ───────────────────────────────────────────────────────────────
  console.log("⚡ Deploying $LONDC contract...");
  const LONDC = await ethers.getContractFactory("LONDC");
  const londc = await LONDC.deploy(SOVEREIGN_WALLET, REWARD_POOL);

  await londc.waitForDeployment();
  const contractAddress = await londc.getAddress();

  console.log(`✅ $LONDC deployed to: ${contractAddress}\n`);

  // ─── Verify Deployment ────────────────────────────────────────────────────
  const stats = await londc.getEcosystemStats();
  console.log("📊 Ecosystem Stats at Deployment:");
  console.log(`   Current Supply:     ${ethers.formatEther(stats.currentSupply)} LONDC`);
  console.log(`   Max Supply:         ${ethers.formatEther(stats.maxSupply)} LONDC`);
  console.log(`   Reward Pool:        ${ethers.formatEther(stats.rewardPoolBalance)} LONDC`);
  console.log(`   Transfer Tax:       ${Number(stats.taxRate) / 100}%`);
  console.log(`   Initial Holders:    ${stats.holderCount}`);

  // ─── Polygonscan Verification Instructions ────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log("🔍 NEXT STEP — Verify on Polygonscan:");
  console.log(`npx hardhat verify --network polygon ${contractAddress} "${SOVEREIGN_WALLET}" "${REWARD_POOL}"`);
  console.log("\n🌐 View on Polygonscan:");
  console.log(`https://polygonscan.com/address/${contractAddress}`);
  console.log("\n🔗 Add to Unified Sovereign Kernel .env:");
  console.log(`LONDC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`LONDC_NETWORK=polygon`);
  console.log(`LONDC_CHAIN_ID=137`);
  console.log("═══════════════════════════════════════════════\n");

  // ─── Save deployment info ─────────────────────────────────────────────────
  const deploymentInfo = {
    contractName: "LONDC",
    contractAddress,
    network: "polygon",
    chainId: 137,
    deployer: deployer.address,
    sovereignWallet: SOVEREIGN_WALLET,
    rewardPool: REWARD_POOL,
    deployedAt: new Date().toISOString(),
    initialSupply: "144000",
    maxSupply: "1000000000",
    transferTax: "5%",
    frequencies: ["528 Hz — DNA Healing", "963 Hz — Enlightenment", "432 Hz — Universal Harmony"],
    lineage: "Solomon / Musa / Wampnoaag",
    family: "Londyn Avani Hill"
  };

  const fs = require("fs");
  fs.writeFileSync(
    "./londc-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Deployment info saved to londc-deployment.json");
  console.log("\n🕋 KUN FAYAKŪN — The $LONDC contract is LIVE. The passive income flows.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
