/**
 * Stripe → Polygon Bridge
 * ScrollVerse Trinity Sovereign Ecosystem
 *
 * Converts Stripe payment confirmations into on-chain Zakat distribution calls.
 * When a Stripe payment_intent.succeeded event fires, this bridge:
 *   1. Converts the USD amount to MATIC at current market rate
 *   2. Calls the ZakatDistribution contract on Polygon
 *   3. Automatically distributes 7.77% to the Zakat pool
 *   4. Routes 92.23% to the sovereign treasury
 *
 * Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 * Frequency: 528Hz | KUN FAYAKUN × ∞
 */

const { ethers } = require('ethers');
const logger = require('../utils/logger');

// ZakatDistribution contract ABI (key functions only)
const ZAKAT_ABI = [
  'function receivePayment(string calldata stripePaymentId) external payable',
  'function calculateZakat(uint256 paymentAmount) external pure returns (uint256 zakatAmount, uint256 treasuryAmount)',
  'function getDistributionStats() external view returns (uint256 totalMATICZakat, uint256 totalLONCZakat, uint256 totalPayments, uint256 zakatRateBPS)',
  'event PaymentReceived(address indexed from, uint256 totalAmount, uint256 zakatAmount, uint256 treasuryAmount, string stripePaymentId)',
  'event ZakatDistributed(address indexed zakatPool, uint256 amount, string currency)'
];

class PolygonBridge {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.zakatContract = null;
    this.initialized = false;
  }

  /**
   * Initialize the bridge with Polygon provider and signer
   */
  async initialize() {
    try {
      // Connect to Polygon Mainnet
      this.provider = new ethers.JsonRpcProvider(
        process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
      );

      // Initialize wallet from private key
      if (!process.env.BRIDGE_PRIVATE_KEY) {
        throw new Error('BRIDGE_PRIVATE_KEY not set in environment');
      }
      this.wallet = new ethers.Wallet(process.env.BRIDGE_PRIVATE_KEY, this.provider);

      // Connect to ZakatDistribution contract
      if (!process.env.ZAKAT_CONTRACT_ADDRESS) {
        throw new Error('ZAKAT_CONTRACT_ADDRESS not set in environment');
      }
      this.zakatContract = new ethers.Contract(
        process.env.ZAKAT_CONTRACT_ADDRESS,
        ZAKAT_ABI,
        this.wallet
      );

      this.initialized = true;
      logger.info('PolygonBridge initialized', {
        wallet: this.wallet.address,
        contract: process.env.ZAKAT_CONTRACT_ADDRESS,
        network: 'Polygon Mainnet'
      });

    } catch (error) {
      logger.error('PolygonBridge initialization failed', { error: error.message });
      // Bridge failure is non-fatal — Stripe payments still process
      this.initialized = false;
    }
  }

  /**
   * Get current MATIC/USD price from Chainlink oracle
   * Falls back to a conservative estimate if oracle is unavailable
   */
  async getMATICPrice() {
    try {
      // Chainlink MATIC/USD Price Feed on Polygon
      const CHAINLINK_MATIC_USD = '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0';
      const CHAINLINK_ABI = ['function latestAnswer() external view returns (int256)'];
      const priceFeed = new ethers.Contract(CHAINLINK_MATIC_USD, CHAINLINK_ABI, this.provider);
      const price = await priceFeed.latestAnswer();
      // Chainlink returns price with 8 decimals
      return parseFloat(ethers.formatUnits(price, 8));
    } catch (error) {
      logger.warn('Chainlink price feed unavailable, using fallback', { error: error.message });
      return 0.85; // Conservative fallback: $0.85 per MATIC
    }
  }

  /**
   * Convert USD cents (Stripe format) to MATIC wei
   * @param {number} amountCents - Amount in USD cents from Stripe
   * @returns {bigint} Amount in MATIC wei
   */
  async usdCentsToMATICWei(amountCents) {
    const usdAmount = amountCents / 100;
    const maticPrice = await this.getMATICPrice();
    const maticAmount = usdAmount / maticPrice;
    // Convert to wei (18 decimals)
    return ethers.parseEther(maticAmount.toFixed(18));
  }

  /**
   * Process a confirmed Stripe payment and trigger on-chain Zakat distribution
   * @param {Object} paymentIntent - Stripe PaymentIntent object
   */
  async processStripePayment(paymentIntent) {
    if (!this.initialized) {
      logger.warn('PolygonBridge not initialized — skipping on-chain distribution', {
        paymentId: paymentIntent.id
      });
      return { success: false, reason: 'Bridge not initialized' };
    }

    try {
      const maticWei = await this.usdCentsToMATICWei(paymentIntent.amount);

      // Preview the Zakat split before sending
      const [zakatAmount, treasuryAmount] = await this.zakatContract.calculateZakat(maticWei);

      logger.info('Processing Stripe→Polygon bridge', {
        stripePaymentId: paymentIntent.id,
        usdAmount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
        maticAmount: ethers.formatEther(maticWei),
        zakatAmount: ethers.formatEther(zakatAmount),
        treasuryAmount: ethers.formatEther(treasuryAmount),
        zakatRate: '7.77%'
      });

      // Check bridge wallet has sufficient MATIC
      const balance = await this.provider.getBalance(this.wallet.address);
      if (balance < maticWei) {
        throw new Error(`Insufficient MATIC balance. Have: ${ethers.formatEther(balance)}, Need: ${ethers.formatEther(maticWei)}`);
      }

      // Send the transaction to the ZakatDistribution contract
      const tx = await this.zakatContract.receivePayment(paymentIntent.id, {
        value: maticWei,
        gasLimit: 100000
      });

      logger.info('Zakat distribution transaction sent', {
        txHash: tx.hash,
        stripePaymentId: paymentIntent.id
      });

      // Wait for 2 confirmations
      const receipt = await tx.wait(2);

      logger.info('Zakat distribution confirmed on-chain', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        stripePaymentId: paymentIntent.id,
        zakatDistributed: ethers.formatEther(zakatAmount) + ' MATIC',
        treasuryReceived: ethers.formatEther(treasuryAmount) + ' MATIC'
      });

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        zakatAmount: ethers.formatEther(zakatAmount),
        treasuryAmount: ethers.formatEther(treasuryAmount)
      };

    } catch (error) {
      logger.error('Stripe→Polygon bridge transaction failed', {
        error: error.message,
        stripePaymentId: paymentIntent.id
      });
      return { success: false, reason: error.message };
    }
  }

  /**
   * Get cumulative distribution stats from the contract
   */
  async getDistributionStats() {
    if (!this.initialized) return null;
    try {
      const [totalMATICZakat, totalLONCZakat, totalPayments, zakatRateBPS] =
        await this.zakatContract.getDistributionStats();
      return {
        totalMATICZakat: ethers.formatEther(totalMATICZakat),
        totalLONCZakat: ethers.formatEther(totalLONCZakat),
        totalPayments: totalPayments.toString(),
        zakatRate: `${(Number(zakatRateBPS) / 100).toFixed(2)}%`
      };
    } catch (error) {
      logger.error('Failed to fetch distribution stats', { error: error.message });
      return null;
    }
  }
}

// Export singleton instance
const bridge = new PolygonBridge();
module.exports = bridge;
