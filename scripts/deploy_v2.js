/**
 * ScrollVerse Trinity — Sovereign Blockchain Deployment Script
 * Target: Polygon Mainnet (chainId 137)
 *
 * Deploy order:
 *   1. ZakatDistribution (needs sovereign wallet address)
 *   2. LONDCToken (needs ZakatDistribution address)
 *   3. ScrollSoulNFT (needs royalty receiver + base URI)
 *   4. Wire: ZakatDistribution.setLONDCToken(londc.address)
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network polygon
 *
 * Required env vars:
 *   SOVEREIGN_WALLET   — 0x3779... (receives Zakat withdrawals)
 *   DEPLOYER_PRIVATE_KEY — private key of deployer wallet
 *   POLYGON_RPC_URL    — Polygon Mainnet RPC (Alchemy/Infura/public)
 *   SOUL_BASE_URI      — IPFS base URI for ScrollSoul metadata
 */

const { ethers } = require("hardhat");

const SOVEREIGN_WALLET = process.env.SOVEREIGN_WALLET || "0x377956c1471d9ce142df6932895839243da23a2c";
const SOUL_BASE_URI    = process.env.SOUL_BASE_URI    || "ipfs://QmScrollSoulMetadata/";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ScrollVerse Trinity — Sovereign Contract Deployment");
  console.log("  ALLĀHU AKBAR · KUN FAYAKŪN × ∞");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Deployer:         ${deployer.address}`);
  console.log(`  Sovereign Wallet: ${SOVEREIGN_WALLET}`);
  console.log(`  Network:          ${network.name} (chainId ${network.chainId})`);
  console.log(`  Balance:          ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC`);
  console.log("═══════════════════════════════════════════════════════\n");

  // ── Step 1: Deploy ZakatDistribution ──────────────────────────────────
  console.log("1/4  Deploying ZakatDistribution...");
  const ZakatFactory = await ethers.getContractFactory("ZakatDistribution");
  const zakat = await ZakatFactory.deploy(SOVEREIGN_WALLET);
  await zakat.waitForDeployment();
  const zakatAddress = await zakat.getAddress();
  console.log(`     ✓ ZakatDistribution deployed: ${zakatAddress}`);

  // ── Step 2: Deploy LONDCToken ──────────────────────────────────────────
  console.log("2/4  Deploying LONDCToken ($LONDC)...");
  const LONDCFactory = await ethers.getContractFactory("LONDCToken");
  const londc = await LONDCFactory.deploy(zakatAddress);
  await londc.waitForDeployment();
  const londcAddress = await londc.getAddress();
  console.log(`     ✓ LONDCToken deployed:        ${londcAddress}`);

  // ── Step 3: Deploy ScrollSoulNFT ──────────────────────────────────────
  console.log("3/4  Deploying ScrollSoulNFT...");
  const SOULFactory = await ethers.getContractFactory("ScrollSoulNFT");
  const soul = await SOULFactory.deploy(SOVEREIGN_WALLET, SOUL_BASE_URI);
  await soul.waitForDeployment();
  const soulAddress = await soul.getAddress();
  console.log(`     ✓ ScrollSoulNFT deployed:     ${soulAddress}`);

  // ── Step 4: Wire ZakatDistribution ← LONDCToken ───────────────────────
  console.log("4/4  Wiring ZakatDistribution with LONDC token address...");
  const wireTx = await zakat.setLONDCToken(londcAddress);
  await wireTx.wait();
  console.log(`     ✓ ZakatDistribution wired to LONDCToken`);

  // ── Summary ───────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE — SOVEREIGN CONTRACTS ARE LIVE");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  LONDC Token:         ${londcAddress}`);
  console.log(`  ZakatDistribution:   ${zakatAddress}`);
  console.log(`  ScrollSoul NFT:      ${soulAddress}`);
  console.log(`  Sovereign Wallet:    ${SOVEREIGN_WALLET}`);
  console.log("\n  Next steps:");
  console.log("  1. Add LONDC_CONTRACT_ADDRESS to portal Secrets");
  console.log("  2. Add GUARDIAN_CONTRACT_ADDRESS (ScrollSoulNFT) to portal Secrets");
  console.log("  3. Verify contracts on Polygonscan:");
  console.log(`     npx hardhat verify --network polygon ${londcAddress} "${zakatAddress}"`);
  console.log(`     npx hardhat verify --network polygon ${zakatAddress} "${SOVEREIGN_WALLET}"`);
  console.log(`     npx hardhat verify --network polygon ${soulAddress} "${SOVEREIGN_WALLET}" "${SOUL_BASE_URI}"`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Save addresses to file for portal integration
  const fs = require("fs");
  const deployOutput = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    sovereignWallet: SOVEREIGN_WALLET,
    contracts: {
      LONDCToken: londcAddress,
      ZakatDistribution: zakatAddress,
      ScrollSoulNFT: soulAddress,
    },
  };
  fs.writeFileSync("./deployed-addresses.json", JSON.stringify(deployOutput, null, 2));
  console.log("  Addresses saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
