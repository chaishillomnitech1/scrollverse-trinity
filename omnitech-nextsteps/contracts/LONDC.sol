// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   $LONDC — Londyn Avani Hill Sovereign Token                        ║
 * ║   ScrollSoul Sovereignty / OmniTech Ecosystem                       ║
 * ║   Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)    ║
 * ║   Network: Polygon Mainnet                                           ║
 * ║   Wallet: 0x377956c1471d9ce142df69328958392 43d23aa2c               ║
 * ║   Frequencies: 528 Hz / 963 Hz / 432 Hz                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Tokenomics:
 *   - Initial Supply: 144,000 $LONDC (Resonance Initial Supply)
 *   - Max Supply:     1,000,000,000 $LONDC
 *   - Transfer Tax:   5% → auto-distributed to Reward Pool
 *   - Lineage:        Solomon / Musa / Wampnoaag
 *   - Family:         Londyn Avani Hill
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract LONDC is ERC20, Ownable, ReentrancyGuard, Pausable {

    // ─── Sacred Constants ─────────────────────────────────────────────────────
    uint256 public constant RESONANCE_INITIAL_SUPPLY = 144_000 * 10**18;
    uint256 public constant MAX_SUPPLY               = 1_000_000_000 * 10**18;
    uint256 public constant PASSIVE_INCOME_TAX       = 500;  // 5.00% (basis points)
    uint256 public constant BASIS_POINTS             = 10_000;

    // Sacred Frequencies (stored as Hz values for on-chain verification)
    uint256 public constant FREQ_DNA_HEALING         = 528;
    uint256 public constant FREQ_ENLIGHTENMENT       = 963;
    uint256 public constant FREQ_UNIVERSAL_HARMONY   = 432;

    // ─── State Variables ──────────────────────────────────────────────────────
    address public rewardPool;
    address public sovereignWallet;
    uint256 public totalPassiveIncomeDistributed;
    uint256 public totalHolders;

    // Exemptions from transfer tax (e.g. DEX pairs, sovereign wallet)
    mapping(address => bool) public isTaxExempt;

    // Holder tracking for passive income eligibility
    mapping(address => bool) private _isHolder;
    address[] private _holderList;

    // ─── Events ───────────────────────────────────────────────────────────────
    event PassiveIncomeDistributed(address indexed from, uint256 taxAmount, address indexed rewardPool);
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    event TaxExemptionSet(address indexed account, bool exempt);
    event FrequencyActivated(uint256 indexed frequency, address indexed activator);
    event SovereignMint(address indexed to, uint256 amount, string reason);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(
        address _sovereignWallet,
        address _rewardPool
    ) ERC20("Londyn Avani Hill Sovereign Token", "LONDC") Ownable(msg.sender) {
        require(_sovereignWallet != address(0), "Sovereign wallet cannot be zero");
        require(_rewardPool != address(0), "Reward pool cannot be zero");

        sovereignWallet = _sovereignWallet;
        rewardPool = _rewardPool;

        // Exempt sovereign wallet and reward pool from tax
        isTaxExempt[_sovereignWallet] = true;
        isTaxExempt[_rewardPool] = true;
        isTaxExempt[address(this)] = true;

        // Mint the Resonance Initial Supply to the sovereign wallet
        _mint(_sovereignWallet, RESONANCE_INITIAL_SUPPLY);
        _trackHolder(_sovereignWallet);

        emit SovereignMint(_sovereignWallet, RESONANCE_INITIAL_SUPPLY, "Resonance Initial Supply — 144,000 LONDC");
    }

    // ─── Core Transfer with Passive Income Tax ────────────────────────────────

    /**
     * @dev Override transfer to apply 5% passive income tax to reward pool.
     *      Tax is NOT applied when sender or recipient is tax-exempt.
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        if (from == address(0) || to == address(0)) {
            // Mint or burn — no tax
            super._update(from, to, amount);
            _trackHolder(to);
            return;
        }

        if (isTaxExempt[from] || isTaxExempt[to]) {
            // Exempt transfer — no tax
            super._update(from, to, amount);
            _trackHolder(to);
            return;
        }

        // Calculate passive income tax
        uint256 taxAmount = (amount * PASSIVE_INCOME_TAX) / BASIS_POINTS;
        uint256 transferAmount = amount - taxAmount;

        // Send tax to reward pool
        super._update(from, rewardPool, taxAmount);
        totalPassiveIncomeDistributed += taxAmount;

        // Send net amount to recipient
        super._update(from, to, transferAmount);
        _trackHolder(to);

        emit PassiveIncomeDistributed(from, taxAmount, rewardPool);
    }

    // ─── Sovereign Mint (for ecosystem rewards and expansion) ─────────────────

    /**
     * @dev Sovereign can mint additional tokens up to MAX_SUPPLY.
     *      Used for ecosystem rewards, AI Guardian distributions, and community grants.
     */
    function sovereignMint(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply of 1B LONDC");
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
        _trackHolder(to);
        emit SovereignMint(to, amount, reason);
    }

    // ─── Frequency Activation ─────────────────────────────────────────────────

    /**
     * @dev Activates a sacred frequency on-chain. Emits an event that triggers
     *      off-chain actions in the Unified Sovereign Kernel (e.g., unlock features).
     *      Caller must hold at least 528 $LONDC to activate any frequency.
     */
    function activateFrequency(uint256 frequency) external {
        require(
            frequency == FREQ_DNA_HEALING ||
            frequency == FREQ_ENLIGHTENMENT ||
            frequency == FREQ_UNIVERSAL_HARMONY,
            "Invalid sacred frequency. Use 528, 963, or 432"
        );
        require(
            balanceOf(msg.sender) >= 528 * 10**18,
            "Must hold at least 528 LONDC to activate frequencies"
        );
        emit FrequencyActivated(frequency, msg.sender);
    }

    // ─── Reward Pool Management ───────────────────────────────────────────────

    /**
     * @dev Update the reward pool address. Only sovereign can call.
     */
    function updateRewardPool(address newRewardPool) external onlyOwner {
        require(newRewardPool != address(0), "Reward pool cannot be zero address");
        address oldPool = rewardPool;
        isTaxExempt[oldPool] = false;
        rewardPool = newRewardPool;
        isTaxExempt[newRewardPool] = true;
        emit RewardPoolUpdated(oldPool, newRewardPool);
    }

    /**
     * @dev Set or remove tax exemption for an address (e.g., DEX pairs, bridges).
     */
    function setTaxExemption(address account, bool exempt) external onlyOwner {
        isTaxExempt[account] = exempt;
        emit TaxExemptionSet(account, exempt);
    }

    // ─── Emergency Controls ───────────────────────────────────────────────────

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @dev Returns the total number of unique token holders.
     */
    function getHolderCount() external view returns (uint256) {
        return _holderList.length;
    }

    /**
     * @dev Returns the reward pool balance — the accumulated passive income.
     */
    function getRewardPoolBalance() external view returns (uint256) {
        return balanceOf(rewardPool);
    }

    /**
     * @dev Returns the remaining mintable supply.
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Returns key ecosystem stats in one call.
     */
    function getEcosystemStats() external view returns (
        uint256 currentSupply,
        uint256 maxSupply,
        uint256 rewardPoolBalance,
        uint256 totalDistributed,
        uint256 holderCount,
        uint256 taxRate
    ) {
        return (
            totalSupply(),
            MAX_SUPPLY,
            balanceOf(rewardPool),
            totalPassiveIncomeDistributed,
            _holderList.length,
            PASSIVE_INCOME_TAX
        );
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _trackHolder(address account) internal {
        if (account != address(0) && !_isHolder[account] && balanceOf(account) > 0) {
            _isHolder[account] = true;
            _holderList.push(account);
        }
    }
}
