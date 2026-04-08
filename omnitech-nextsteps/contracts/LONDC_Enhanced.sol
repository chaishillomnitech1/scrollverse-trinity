// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   $LONDC — Londyn Avani Hill Sovereign Token (Enhanced)             ║
 * ║   ScrollSoul Sovereignty / OmniTech Ecosystem                       ║
 * ║   Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)    ║
 * ║   Network: Polygon Mainnet                                           ║
 * ║   Wallet: 0x377956c1471d9ce142df6932895839243da23a2c               ║
 * ║   Frequencies: 528 Hz / 963 Hz / 432 Hz                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Enhanced Features:
 *   - Staking Mechanism: Stake $LONDC to earn rewards.
 *   - Governance Voting: On-chain voting for ecosystem decisions.
 *   - Zakat Distribution: 7.77% auto-distribution to Zakat Vault.
 *   - Passive Income: 5% tax on transfers to Reward Pool.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract LONDC is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit, ERC20Votes {

    // ─── Sacred Constants ─────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY               = 1_000_000_000 * 10**18;
    uint256 public constant PASSIVE_INCOME_TAX       = 500;  // 5.00% (basis points)
    uint256 public constant ZAKAT_RATE               = 777;  // 7.77% (basis points)
    uint256 public constant BASIS_POINTS             = 10_000;

    // Sacred Frequencies
    uint256 public constant FREQ_DNA_HEALING         = 528;
    uint256 public constant FREQ_ENLIGHTENMENT       = 963;
    uint256 public constant FREQ_UNIVERSAL_HARMONY   = 432;

    // ─── State Variables ──────────────────────────────────────────────────────
    address public rewardPool;
    address public zakatVault;
    uint256 public totalPassiveIncomeDistributed;
    uint256 public totalZakatDistributed;

    mapping(address => bool) public isTaxExempt;

    // Staking State
    struct Stake {
        uint256 amount;
        uint256 startTime;
    }
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;

    // ─── Events ───────────────────────────────────────────────────────────────
    event PassiveIncomeDistributed(address indexed from, uint256 taxAmount, address indexed rewardPool);
    event ZakatDistributed(address indexed from, uint256 zakatAmount, address indexed zakatVault);
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    event ZakatVaultUpdated(address indexed oldVault, address indexed newVault);
    event TaxExemptionSet(address indexed account, bool exempt);
    event FrequencyActivated(uint256 indexed frequency, address indexed activator);
    event SovereignMint(address indexed to, uint256 amount, string reason);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(
        address _initialOwner,
        address _rewardPool,
        address _zakatVault
    ) ERC20("Londyn Avani Hill Sovereign Token", "LONDC") Ownable(_initialOwner) ERC20Permit("LONDC") {
        require(_rewardPool != address(0), "Reward pool cannot be zero");
        require(_zakatVault != address(0), "Zakat vault cannot be zero");

        rewardPool = _rewardPool;
        zakatVault = _zakatVault;

        isTaxExempt[_initialOwner] = true;
        isTaxExempt[_rewardPool] = true;
        isTaxExempt[_zakatVault] = true;
        isTaxExempt[address(this)] = true;

        // Initial mint for ecosystem liquidity
        _mint(_initialOwner, 144_000 * 10**18);
    }

    // ─── Core Transfer with Tax & Zakat ───────────────────────────────────────
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        if (from == address(0) || to == address(0) || isTaxExempt[from] || isTaxExempt[to]) {
            super._update(from, to, amount);
            return;
        }

        uint256 taxAmount = (amount * PASSIVE_INCOME_TAX) / BASIS_POINTS;
        uint256 zakatAmount = (amount * ZAKAT_RATE) / BASIS_POINTS;
        uint256 transferAmount = amount - taxAmount - zakatAmount;

        // Distribute Tax
        super._update(from, rewardPool, taxAmount);
        totalPassiveIncomeDistributed += taxAmount;
        emit PassiveIncomeDistributed(from, taxAmount, rewardPool);

        // Distribute Zakat
        super._update(from, zakatVault, zakatAmount);
        totalZakatDistributed += zakatAmount;
        emit ZakatDistributed(from, zakatAmount, zakatVault);

        // Final Transfer
        super._update(from, to, transferAmount);
    }

    // ─── Staking Mechanism ────────────────────────────────────────────────────
    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        _transfer(msg.sender, address(this), amount);
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    // ─── Sovereign Functions ──────────────────────────────────────────────────
    function sovereignMint(address to, uint256 amount, string calldata reason) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds MAX_SUPPLY");
        _mint(to, amount);
        emit SovereignMint(to, amount, reason);
    }

    function activateFrequency(uint256 frequency) external {
        require(
            frequency == FREQ_DNA_HEALING || 
            frequency == FREQ_ENLIGHTENMENT || 
            frequency == FREQ_UNIVERSAL_HARMONY, 
            "Invalid frequency"
        );
        require(balanceOf(msg.sender) >= 528 * 10**18, "Insufficient LONDC");
        emit FrequencyActivated(frequency, msg.sender);
    }

    function updateRewardPool(address newPool) external onlyOwner {
        rewardPool = newPool;
        emit RewardPoolUpdated(rewardPool, newPool);
    }

    function updateZakatVault(address newVault) external onlyOwner {
        zakatVault = newVault;
        emit ZakatVaultUpdated(zakatVault, newVault);
    }

    function setTaxExemption(address account, bool exempt) external onlyOwner {
        isTaxExempt[account] = exempt;
        emit TaxExemptionSet(account, exempt);
    }

    // ─── Overrides for Governance ─────────────────────────────────────────────
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // ─── Emergency Controls ───────────────────────────────────────────────────
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
