// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Advanced Staking Pools
 * @dev Multi-tier staking with variable APY based on frequency alignment
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AdvancedStakingPools is ReentrancyGuard, Ownable {
    
    IERC20 public londcToken;
    
    enum StakingTier {
        BRONZE,      // 1K - 10K LONDC, 8% APY
        SILVER,      // 10K - 100K LONDC, 12% APY
        GOLD,        // 100K - 1M LONDC, 15% APY
        PLATINUM,    // 1M+ LONDC, 20% APY
        FREQUENCY    // Frequency-aligned, +5% bonus
    }
    
    struct StakingPosition {
        address staker;
        uint256 amount;
        uint256 startTime;
        StakingTier tier;
        uint256 frequency; // 528, 963, or 432
        uint256 rewardsEarned;
        bool active;
    }
    
    mapping(address => StakingPosition[]) public stakingPositions;
    mapping(address => uint256) public totalStaked;
    
    uint256 public totalPoolValue;
    uint256 public frequencyBonusMultiplier = 105; // 5% bonus
    
    event Staked(address indexed staker, uint256 amount, StakingTier tier, uint256 frequency);
    event Unstaked(address indexed staker, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed staker, uint256 rewards);
    
    constructor(address _londcAddress) {
        londcToken = IERC20(_londcAddress);
    }
    
    /**
     * @dev Determine staking tier based on amount
     */
    function getTierForAmount(uint256 amount) public pure returns (StakingTier) {
        if (amount >= 1000000 ether) return StakingTier.PLATINUM;
        if (amount >= 100000 ether) return StakingTier.GOLD;
        if (amount >= 10000 ether) return StakingTier.SILVER;
        return StakingTier.BRONZE;
    }
    
    /**
     * @dev Get base APY for tier
     */
    function getBaseAPY(StakingTier tier) public pure returns (uint256) {
        if (tier == StakingTier.PLATINUM) return 2000; // 20%
        if (tier == StakingTier.GOLD) return 1500; // 15%
        if (tier == StakingTier.SILVER) return 1200; // 12%
        return 800; // 8% for BRONZE
    }
    
    /**
     * @dev Stake LONDC with frequency alignment
     */
    function stake(uint256 amount, uint256 frequency) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(frequency == 528 || frequency == 963 || frequency == 432, "Invalid frequency");
        
        // Transfer tokens from staker
        require(
            londcToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        StakingTier tier = getTierForAmount(amount);
        
        stakingPositions[msg.sender].push(StakingPosition({
            staker: msg.sender,
            amount: amount,
            startTime: block.timestamp,
            tier: tier,
            frequency: frequency,
            rewardsEarned: 0,
            active: true
        }));
        
        totalStaked[msg.sender] += amount;
        totalPoolValue += amount;
        
        emit Staked(msg.sender, amount, tier, frequency);
    }
    
    /**
     * @dev Calculate rewards for a staking position
     */
    function calculateRewards(address staker, uint256 positionIndex) public view returns (uint256) {
        require(positionIndex < stakingPositions[staker].length, "Invalid position");
        
        StakingPosition memory position = stakingPositions[staker][positionIndex];
        require(position.active, "Position not active");
        
        uint256 timeStaked = block.timestamp - position.startTime;
        uint256 baseAPY = getBaseAPY(position.tier);
        
        // Apply frequency bonus
        uint256 effectiveAPY = baseAPY;
        if (position.frequency == 528 || position.frequency == 963 || position.frequency == 432) {
            effectiveAPY = (baseAPY * frequencyBonusMultiplier) / 100;
        }
        
        uint256 rewards = (position.amount * effectiveAPY * timeStaked) / (10000 * 365 days);
        return rewards + position.rewardsEarned;
    }
    
    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards(uint256 positionIndex) external nonReentrant {
        require(positionIndex < stakingPositions[msg.sender].length, "Invalid position");
        
        StakingPosition storage position = stakingPositions[msg.sender][positionIndex];
        require(position.active, "Position not active");
        
        uint256 rewards = calculateRewards(msg.sender, positionIndex);
        require(rewards > 0, "No rewards");
        
        position.rewardsEarned = 0;
        position.startTime = block.timestamp;
        
        require(londcToken.transfer(msg.sender, rewards), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Unstake and claim all rewards
     */
    function unstake(uint256 positionIndex) external nonReentrant {
        require(positionIndex < stakingPositions[msg.sender].length, "Invalid position");
        
        StakingPosition storage position = stakingPositions[msg.sender][positionIndex];
        require(position.active, "Position not active");
        
        uint256 rewards = calculateRewards(msg.sender, positionIndex);
        uint256 totalReturn = position.amount + rewards;
        
        totalStaked[msg.sender] -= position.amount;
        totalPoolValue -= position.amount;
        position.active = false;
        
        require(londcToken.transfer(msg.sender, totalReturn), "Transfer failed");
        
        emit Unstaked(msg.sender, position.amount, rewards);
    }
    
    /**
     * @dev Get all staking positions for a user
     */
    function getStakingPositions(address staker) external view returns (StakingPosition[] memory) {
        return stakingPositions[staker];
    }
    
    /**
     * @dev Get total rewards for a user
     */
    function getTotalRewards(address staker) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < stakingPositions[staker].length; i++) {
            if (stakingPositions[staker][i].active) {
                total += calculateRewards(staker, i);
            }
        }
        return total;
    }
}
