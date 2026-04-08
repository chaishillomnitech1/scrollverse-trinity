// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title LONDC - Londyn Legacy Protocol Token
 * @author Supreme King Chais Kenyatta Hill (Sabir Allah the Great)
 * @notice The sovereign currency of the ScrollVerse Empire.
 *         Features: Passive Income Tax (5%), Zakat Auto-Distribution (7.77%),
 *         Governance Voting, Staking Mechanism, and Frequency Activation.
 */
contract LONDC is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit, ERC20Votes {
    // ─── Constants ────────────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion LONDC
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PASSIVE_INCOME_TAX = 500; // 5%
    uint256 public constant ZAKAT_RATE = 777; // 7.77% of tax collected
    
    // Sacred Frequencies
    uint256 public constant FREQ_DNA_HEALING = 528;
    uint256 public constant FREQ_ENLIGHTENMENT = 963;
    uint256 public constant FREQ_UNIVERSAL_HARMONY = 432;

    // ─── State Variables ──────────────────────────────────────────────────────
    address public rewardPool;
    address public zakatTreasury;
    uint256 public totalPassiveIncomeDistributed;
    uint256 public totalZakatDistributed;

    mapping(address => bool) public isTaxExempt;
    
    // Staking State
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lastClaimed;
    }
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public stakingRewardRate = 1000; // 10% APY base

    // ─── Events ───────────────────────────────────────────────────────────────
    event PassiveIncomeDistributed(address indexed from, uint256 amount, address indexed pool);
    event ZakatDistributed(uint256 amount, address indexed treasury);
    event SovereignMint(address indexed to, uint256 amount, string reason);
    event FrequencyActivated(uint256 indexed frequency, address indexed activator);
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    event ZakatTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TaxExemptionSet(address indexed account, bool exempt);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakingRewardClaimed(address indexed user, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(
        address initialOwner,
        address _rewardPool,
        address _zakatTreasury
    )
        ERC20("Londyn Legacy Protocol", "LONDC")
        Ownable(initialOwner)
        ERC20Permit("LONDC")
    {
        require(_rewardPool != address(0), "Reward pool cannot be zero");
        require(_zakatTreasury != address(0), "Zakat treasury cannot be zero");
        
        rewardPool = _rewardPool;
        zakatTreasury = _zakatTreasury;
        
        isTaxExempt[initialOwner] = true;
        isTaxExempt[address(this)] = true;
        isTaxExempt[_rewardPool] = true;
        isTaxExempt[_zakatTreasury] = true;

        // Initial supply for ecosystem foundation
        _mint(initialOwner, 333_333_333 * 10**18); // 33.3% initial
    }

    // ─── Overrides ────────────────────────────────────────────────────────────
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        if (from == address(0) || to == address(0) || isTaxExempt[from] || isTaxExempt[to]) {
            super._update(from, to, amount);
            return;
        }

        // Calculate taxes
        uint256 taxAmount = (amount * PASSIVE_INCOME_TAX) / BASIS_POINTS;
        uint256 zakatAmount = (taxAmount * ZAKAT_RATE) / BASIS_POINTS;
        uint256 rewardAmount = taxAmount - zakatAmount;
        uint256 transferAmount = amount - taxAmount;

        // Distribute taxes
        super._update(from, rewardPool, rewardAmount);
        super._update(from, zakatTreasury, zakatAmount);
        
        totalPassiveIncomeDistributed += rewardAmount;
        totalZakatDistributed += zakatAmount;

        // Final transfer
        super._update(from, to, transferAmount);

        emit PassiveIncomeDistributed(from, rewardAmount, rewardPool);
        emit ZakatDistributed(zakatAmount, zakatTreasury);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // ─── Staking Mechanism ────────────────────────────────────────────────────
    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        if (stakes[msg.sender].amount > 0) {
            _claimStakingRewards(msg.sender);
        }

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].lastClaimed = block.timestamp;
        totalStaked += amount;

        _transfer(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        _claimStakingRewards(msg.sender);
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        _transfer(address(this), msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external {
        _claimStakingRewards(msg.sender);
    }

    function _claimStakingRewards(address user) internal {
        uint256 reward = calculateRewards(user);
        if (reward > 0) {
            stakes[user].lastClaimed = block.timestamp;
            _mint(user, reward);
            emit StakingRewardClaimed(user, reward);
        }
    }

    function calculateRewards(address user) public view returns (uint256) {
        Stake storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 duration = block.timestamp - userStake.lastClaimed;
        return (userStake.amount * stakingRewardRate * duration) / (BASIS_POINTS * 365 days);
    }

    // ─── Sovereign Functions ──────────────────────────────────────────────────
    function sovereignMint(address to, uint256 amount, string calldata reason) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
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
        require(balanceOf(msg.sender) >= 528 * 10**18, "Hold 528 LONDC to activate");
        emit FrequencyActivated(frequency, msg.sender);
    }

    function updateRewardPool(address newPool) external onlyOwner {
        rewardPool = newPool;
        emit RewardPoolUpdated(rewardPool, newPool);
    }

    function updateZakatTreasury(address newTreasury) external onlyOwner {
        zakatTreasury = newTreasury;
        emit ZakatTreasuryUpdated(zakatTreasury, newTreasury);
    }

    function setTaxExemption(address account, bool exempt) external onlyOwner {
        isTaxExempt[account] = exempt;
        emit TaxExemptionSet(account, exempt);
    }

    function setStakingRewardRate(uint256 newRate) external onlyOwner {
        stakingRewardRate = newRate;
    }

    // ─── Emergency Controls ───────────────────────────────────────────────────
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
