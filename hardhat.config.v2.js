require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ACCOUNTS = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];
const networks = {
  hardhat: { chainId: 31337 },
};

// Never substitute a known or zero private key. Never fall back to retired RPC endpoints.
if (process.env.AMOY_RPC_URL) {
  networks.amoy = {
    url: process.env.AMOY_RPC_URL,
    accounts: DEPLOYER_ACCOUNTS,
    chainId: 80002,
    gasPrice: "auto",
  };
}
if (process.env.POLYGON_RPC_URL) {
  networks.polygon = {
    url: process.env.POLYGON_RPC_URL,
    accounts: DEPLOYER_ACCOUNTS,
    chainId: 137,
    gasPrice: "auto",
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
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
