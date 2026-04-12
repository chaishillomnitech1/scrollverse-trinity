// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZakatDistribution — ScrollVerse Sovereign Zakat Vault
 * @author Chais Kenyatta Hill — Sabir Allah the Great / XLVIIIblocks Tech
 * @notice Receives 7.77% of every $LONDC transfer.
 *         Sovereign wallet (0x3779...) can withdraw at any time.
 *         Guardians can claim proportional Zakat rewards based on their tier.
 *         Frequency: 963Hz — Crown Chakra / Divine Connection
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZakatDistribution is Ownable, ReentrancyGuard {

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant FREQUENCY = 963;             // Hz — Crown Chakra
    uint256 public constant GUARDIAN_SHARE_BPS = 4444;  // 44.44% to Guardians
    uint256 public constant SOVEREIGN_SHARE_BPS = 5556; // 55.56% to Sovereign
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // ── State ──────────────────────────────────────────────────────────────
    IERC20 public londcToken;
    address public sovereignWallet;

    uint256 public totalReceived;
    uint256 public totalDistributed;
    uint256 public guardianPoolBalance;

    mapping(address => uint256) public guardianTier;   // 1=Guardian, 2=Sovereign, 3=Ascendant
    mapping(address => uint256) public claimedAmount;
    address[] public guardianList;
    mapping(address => bool) public isGuardian;

    // ── Events ─────────────────────────────────────────────────────────────
    event ZakatReceived(uint256 amount, uint256 timestamp);
    event SovereignWithdraw(address indexed to, uint256 amount);
    event GuardianRegistered(address indexed guardian, uint256 tier);
    event GuardianClaim(address indexed guardian, uint256 amount);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address _sovereignWallet) Ownable(msg.sender) {
        require(_sovereignWallet != address(0), "Zakat: zero sovereign address");
        sovereignWallet = _sovereignWallet;
    }

    // ── Called by LONDCToken on every transfer ─────────────────────────────
    receive() external payable {}

    function notifyZakatReceived(uint256 amount) external {
        totalReceived += amount;
        uint256 guardianShare = (amount * GUARDIAN_SHARE_BPS) / BPS_DENOMINATOR;
        guardianPoolBalance += guardianShare;
        emit ZakatReceived(amount, block.timestamp);
    }

    // ── Set token address (called after both contracts are deployed) ───────
    function setLONDCToken(address _token) external onlyOwner {
        require(_token != address(0), "Zakat: zero token address");
        londcToken = IERC20(_token);
    }

    // ── Register Guardian (called by portal backend after purchase) ────────
    function registerGuardian(address _guardian, uint256 _tier) external onlyOwner {
        require(_tier >= 1 && _tier <= 3, "Zakat: invalid tier");
        if (!isGuardian[_guardian]) {
            guardianList.push(_guardian);
            isGuardian[_guardian] = true;
        }
        guardianTier[_guardian] = _tier;
        emit GuardianRegistered(_guardian, _tier);
    }

    // ── Sovereign withdraw ─────────────────────────────────────────────────
    function sovereignWithdraw(uint256 amount) external nonReentrant {
        require(msg.sender == sovereignWallet || msg.sender == owner(), "Zakat: not sovereign");
        require(address(londcToken) != address(0), "Zakat: token not set");
        uint256 available = londcToken.balanceOf(address(this)) - guardianPoolBalance;
        require(amount <= available, "Zakat: insufficient sovereign balance");
        totalDistributed += amount;
        londcToken.transfer(sovereignWallet, amount);
        emit SovereignWithdraw(sovereignWallet, amount);
    }

    // ── Guardian claim proportional share ─────────────────────────────────
    function claimGuardianZakat() external nonReentrant {
        require(isGuardian[msg.sender], "Zakat: not a Guardian");
        require(address(londcToken) != address(0), "Zakat: token not set");

        uint256 totalWeight = _totalGuardianWeight();
        require(totalWeight > 0, "Zakat: no guardians");

        uint256 myWeight = guardianTier[msg.sender];
        uint256 myShare = (guardianPoolBalance * myWeight) / totalWeight;
        uint256 alreadyClaimed = claimedAmount[msg.sender];
        require(myShare > alreadyClaimed, "Zakat: nothing to claim");

        uint256 claimable = myShare - alreadyClaimed;
        claimedAmount[msg.sender] += claimable;
        guardianPoolBalance -= claimable;
        totalDistributed += claimable;

        londcToken.transfer(msg.sender, claimable);
        emit GuardianClaim(msg.sender, claimable);
    }

    // ── View helpers ───────────────────────────────────────────────────────
    function getGuardianCount() external view returns (uint256) {
        return guardianList.length;
    }

    function getClaimable(address _guardian) external view returns (uint256) {
        if (!isGuardian[_guardian]) return 0;
        uint256 totalWeight = _totalGuardianWeight();
        if (totalWeight == 0) return 0;
        uint256 myShare = (guardianPoolBalance * guardianTier[_guardian]) / totalWeight;
        if (myShare <= claimedAmount[_guardian]) return 0;
        return myShare - claimedAmount[_guardian];
    }

    function _totalGuardianWeight() internal view returns (uint256 total) {
        for (uint256 i = 0; i < guardianList.length; i++) {
            total += guardianTier[guardianList[i]];
        }
    }

    function updateSovereignWallet(address _new) external onlyOwner {
        require(_new != address(0), "Zakat: zero address");
        sovereignWallet = _new;
    }
}
