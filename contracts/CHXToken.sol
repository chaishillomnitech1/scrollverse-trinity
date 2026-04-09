// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CHXToken ($LONDC)
 * @dev The native currency of the ScrollVerse Divine Economy.
 * Features a 5% transfer tax for the Reward Pool and Zakat Distribution.
 */
contract CHXToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 144000 * 10**18;
    uint256 public constant TRANSFER_TAX = 5; // 5% tax on transfers
    
    address public rewardPool;
    address public zakatTreasury;

    constructor(address _rewardPool, address _zakatTreasury) ERC20("Cosmic Harmony X-change", "CHX") Ownable(msg.sender) {
        rewardPool = _rewardPool;
        zakatTreasury = _zakatTreasury;
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @dev Overrides the transfer function to implement the 5% tax.
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        uint256 taxAmount = (amount * TRANSFER_TAX) / 100;
        uint256 sendAmount = amount - taxAmount;
        
        _transfer(_msgSender(), rewardPool, taxAmount / 2);
        _transfer(_msgSender(), zakatTreasury, taxAmount / 2);
        _transfer(_msgSender(), to, sendAmount);
        
        return true;
    }

    /**
     * @dev Updates the reward pool address.
     */
    function setRewardPool(address _rewardPool) external onlyOwner {
        rewardPool = _rewardPool;
    }

    /**
     * @dev Updates the zakat treasury address.
     */
    function setZakatTreasury(address _zakatTreasury) external onlyOwner {
        zakatTreasury = _zakatTreasury;
    }
}
