// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZakatDistribution
 * @dev Automatic 7.77% Zakat distribution contract for the ScrollVerse Trinity ecosystem.
 *      On every incoming payment (via Stripe→Polygon bridge), this contract
 *      automatically distributes 7.77% to the Zakat pool and routes the
 *      remainder to the sovereign treasury.
 *
 * Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 * Frequency: 528Hz | 963Hz | 432Hz
 * KUN FAYAKUN × ∞
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ZakatDistribution is Ownable, ReentrancyGuard {

    // ============================================================
    // STATE VARIABLES
    // ============================================================

    /// @notice The $LONDC token contract address
    IERC20 public loncToken;

    /// @notice Zakat rate: 7.77% = 777 basis points (out of 10000)
    uint256 public constant ZAKAT_RATE_BPS = 777;

    /// @notice Total basis points (100%)
    uint256 public constant TOTAL_BPS = 10000;

    /// @notice The sovereign treasury wallet (receives 92.23%)
    address public sovereignTreasury;

    /// @notice The Zakat pool wallet (receives 7.77%)
    address public zakatPool;

    /// @notice The Stripe→Polygon bridge address (authorized caller)
    address public stripeBridge;

    /// @notice Total MATIC distributed via Zakat
    uint256 public totalZakatDistributedMATIC;

    /// @notice Total $LONDC distributed via Zakat
    uint256 public totalZakatDistributedLONC;

    /// @notice Total payments processed
    uint256 public totalPaymentsProcessed;

    // ============================================================
    // EVENTS
    // ============================================================

    event PaymentReceived(
        address indexed from,
        uint256 totalAmount,
        uint256 zakatAmount,
        uint256 treasuryAmount,
        string stripePaymentId
    );

    event ZakatDistributed(
        address indexed zakatPool,
        uint256 amount,
        string currency
    );

    event BridgeAddressUpdated(address indexed newBridge);
    event TreasuryAddressUpdated(address indexed newTreasury);
    event ZakatPoolAddressUpdated(address indexed newZakatPool);

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor(
        address _loncToken,
        address _sovereignTreasury,
        address _zakatPool,
        address _stripeBridge
    ) Ownable(msg.sender) {
        require(_loncToken != address(0), "Invalid LONC token address");
        require(_sovereignTreasury != address(0), "Invalid treasury address");
        require(_zakatPool != address(0), "Invalid zakat pool address");
        require(_stripeBridge != address(0), "Invalid bridge address");

        loncToken = IERC20(_loncToken);
        sovereignTreasury = _sovereignTreasury;
        zakatPool = _zakatPool;
        stripeBridge = _stripeBridge;
    }

    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier onlyBridge() {
        require(msg.sender == stripeBridge, "Caller is not the Stripe bridge");
        _;
    }

    // ============================================================
    // CORE FUNCTIONS
    // ============================================================

    /**
     * @notice Receive MATIC payment from the Stripe→Polygon bridge and
     *         automatically distribute 7.77% to the Zakat pool.
     * @param stripePaymentId The original Stripe payment intent ID for audit trail
     */
    function receivePayment(string calldata stripePaymentId)
        external
        payable
        onlyBridge
        nonReentrant
    {
        require(msg.value > 0, "Payment amount must be greater than zero");

        uint256 totalAmount = msg.value;
        uint256 zakatAmount = (totalAmount * ZAKAT_RATE_BPS) / TOTAL_BPS;
        uint256 treasuryAmount = totalAmount - zakatAmount;

        // Transfer Zakat to the pool
        (bool zakatSuccess, ) = payable(zakatPool).call{value: zakatAmount}("");
        require(zakatSuccess, "Zakat transfer failed");

        // Transfer remainder to sovereign treasury
        (bool treasurySuccess, ) = payable(sovereignTreasury).call{value: treasuryAmount}("");
        require(treasurySuccess, "Treasury transfer failed");

        // Update state
        totalZakatDistributedMATIC += zakatAmount;
        totalPaymentsProcessed++;

        emit PaymentReceived(msg.sender, totalAmount, zakatAmount, treasuryAmount, stripePaymentId);
        emit ZakatDistributed(zakatPool, zakatAmount, "MATIC");
    }

    /**
     * @notice Distribute $LONDC tokens with 7.77% Zakat applied.
     *         Called by the bridge when $LONDC rewards are being distributed.
     * @param totalAmount Total $LONDC to distribute
     * @param stripePaymentId The original Stripe payment intent ID
     */
    function distributeLONC(uint256 totalAmount, string calldata stripePaymentId)
        external
        onlyBridge
        nonReentrant
    {
        require(totalAmount > 0, "Amount must be greater than zero");
        require(
            loncToken.allowance(msg.sender, address(this)) >= totalAmount,
            "Insufficient allowance"
        );

        uint256 zakatAmount = (totalAmount * ZAKAT_RATE_BPS) / TOTAL_BPS;
        uint256 treasuryAmount = totalAmount - zakatAmount;

        // Transfer $LONDC Zakat to pool
        require(
            loncToken.transferFrom(msg.sender, zakatPool, zakatAmount),
            "LONC Zakat transfer failed"
        );

        // Transfer $LONDC remainder to treasury
        require(
            loncToken.transferFrom(msg.sender, sovereignTreasury, treasuryAmount),
            "LONC treasury transfer failed"
        );

        totalZakatDistributedLONC += zakatAmount;
        totalPaymentsProcessed++;

        emit PaymentReceived(msg.sender, totalAmount, zakatAmount, treasuryAmount, stripePaymentId);
        emit ZakatDistributed(zakatPool, zakatAmount, "LONC");
    }

    // ============================================================
    // VIEW FUNCTIONS
    // ============================================================

    /**
     * @notice Calculate the Zakat amount for a given payment
     * @param paymentAmount The total payment amount in wei or token units
     * @return zakatAmount The 7.77% Zakat portion
     * @return treasuryAmount The 92.23% treasury portion
     */
    function calculateZakat(uint256 paymentAmount)
        external
        pure
        returns (uint256 zakatAmount, uint256 treasuryAmount)
    {
        zakatAmount = (paymentAmount * ZAKAT_RATE_BPS) / TOTAL_BPS;
        treasuryAmount = paymentAmount - zakatAmount;
    }

    /**
     * @notice Get the full ecosystem distribution stats
     */
    function getDistributionStats()
        external
        view
        returns (
            uint256 totalMATICZakat,
            uint256 totalLONCZakat,
            uint256 totalPayments,
            uint256 zakatRateBPS
        )
    {
        return (
            totalZakatDistributedMATIC,
            totalZakatDistributedLONC,
            totalPaymentsProcessed,
            ZAKAT_RATE_BPS
        );
    }

    // ============================================================
    // ADMIN FUNCTIONS (OWNER ONLY)
    // ============================================================

    function updateBridgeAddress(address _newBridge) external onlyOwner {
        require(_newBridge != address(0), "Invalid bridge address");
        stripeBridge = _newBridge;
        emit BridgeAddressUpdated(_newBridge);
    }

    function updateTreasuryAddress(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        sovereignTreasury = _newTreasury;
        emit TreasuryAddressUpdated(_newTreasury);
    }

    function updateZakatPoolAddress(address _newZakatPool) external onlyOwner {
        require(_newZakatPool != address(0), "Invalid zakat pool address");
        zakatPool = _newZakatPool;
        emit ZakatPoolAddressUpdated(_newZakatPool);
    }

    /// @notice Emergency withdrawal by owner
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    /// @notice Accept MATIC directly (for testing)
    receive() external payable {}
}
