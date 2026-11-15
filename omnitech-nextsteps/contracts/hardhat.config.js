require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const deployerAccounts = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];
const networks = {
  hardhat: { chainId: 31337 },
};

// Polygon PoS Amoy rehearsal and Polygon mainnet are separate, explicit targets.
if (process.env.AMOY_RPC_URL) {
  networks.amoy = {
    url: process.env.AMOY_RPC_URL,
    accounts: deployerAccounts,
    chainId: 80002,
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
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
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
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    token: "POL",
  },
};
