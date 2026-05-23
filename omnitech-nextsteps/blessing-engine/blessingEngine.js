/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Blessing Engine: Manus-721 Portal CSC Minting & Distribution      ║
 * ║   ScrollVerse Trinity Sovereign Ecosystem v3.0.0                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const Web3 = require("web3");
const LONDC_ABI = require("../contracts/LONDC_Enhanced_ABI.json"); // Assuming ABI is generated

class BlessingEngine {
  constructor(config = {}) {
    this.web3 = new Web3(config.provider || "https://polygon-rpc.com"); // Polygon Network
    this.londcContractAddress = config.londcContractAddress; // Address of the deployed LONDC contract
    this.blessingEngineWallet = config.blessingEngineWallet; // Wallet address of the Blessing Engine (must be set as onlyBlessingEngine in LONDC)
    this.blessingEnginePrivateKey = config.blessingEnginePrivateKey; // Private key for signing transactions
    this.londcContract = new this.web3.eth.Contract(LONDC_ABI, this.londcContractAddress);
    this.kernelConnector = config.kernelConnector; // Reference to the Kernel Connector

    if (!this.blessingEngineWallet || !this.blessingEnginePrivateKey) {
      console.error("❌ [BlessingEngine] Blessing Engine wallet and private key must be configured.");
    }
    this.web3.eth.accounts.wallet.add(this.blessingEnginePrivateKey);

    console.log("✨ [BlessingEngine] Initialized. Ready to mint CSC.");
  }

  /**
   * @dev Mints CSC (Celestine Star Coin) and distributes it to a recipient.
   *      This function is called when a user connects to the Manus-721 Portal stream.
   * @param recipient The address to receive the minted CSC.
   * @param amount The amount of CSC to mint.
   * @param reason A description for the minting event.
   */
  async mintCSC(recipient, amount, reason) {
    if (!this.londcContractAddress) {
      console.error("❌ [BlessingEngine] LONDC contract address not set.");
      return { success: false, message: "LONDC contract address not set." };
    }

    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const tx = this.londcContract.methods.mintCSC(recipient, amount, reason);
      const gas = await tx.estimateGas({ from: this.blessingEngineWallet });

      const receipt = await tx.send({
        from: this.blessingEngineWallet,
        gas: gas,
        gasPrice: gasPrice,
      });

      console.log(`💎 [BlessingEngine] Minted ${amount} CSC to ${recipient} for reason: ${reason}. Transaction: ${receipt.transactionHash}`);
      if (this.kernelConnector) {
        this.kernelConnector.emit("cscMinted", { recipient, amount, reason, transactionHash: receipt.transactionHash });
      }
      return { success: true, transactionHash: receipt.transactionHash };
    } catch (error) {
      console.error(`❌ [BlessingEngine] Failed to mint CSC: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * @dev Simulates a user connecting to the Manus-721 Portal stream.
   *      In a real scenario, this would be triggered by a frontend event.
   * @param userWallet The wallet address of the user connecting to the stream.
   * @param resonanceScore The resonance score of the user, influencing CSC amount.
   */
  async userConnectedToStream(userWallet, resonanceScore) {
    console.log(`🌐 [BlessingEngine] User ${userWallet} connected to Manus-721 Portal with resonance ${resonanceScore}.`);
    // Determine CSC amount based on resonanceScore and other factors
    const baseCSCAmount = this.web3.utils.toBN(100 * 10**18); // Example: 100 CSC
    const bonusCSCAmount = this.web3.utils.toBN(Math.floor(resonanceScore * 50) * 10**18); // Up to 50 bonus CSC
    const totalCSCAmount = baseCSCAmount.add(bonusCSCAmount);

    const reason = `Manus-721 Portal Blessing for resonance ${resonanceScore}`;
    return this.mintCSC(userWallet, totalCSCAmount.toString(), reason);
  }
}

module.exports = { BlessingEngine };
