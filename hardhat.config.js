require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const deployerAccounts = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];
const networks = {
  hardhat: { chainId: 31337 },
};

// Use maintained, owner-configured RPC endpoints only.
// Polygon retired its public Amoy and mainnet RPC endpoints in July 2026.
if (process.env.AMOY_RPC_URL) {
  networks.amoy = {
    url: process.env.AMOY_RPC_URL,
    accounts: deployerAccounts,
    chainId: 80002,
    gasPrice: "auto",
  };
}
if (process.env.POLYGON_RPC_URL) {
  networks.polygon = {
    url: process.env.POLYGON_RPC_URL,
    accounts: deployerAccounts,
    chainId: 137,
    gasPrice: "auto",
  };
}

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
    ],
  },
  networks,
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
