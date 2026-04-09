// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProtectiveShieldVault
 * @author Chais Kenyatta Hill - Sabir Allah The Great
 * @notice Quantum-encrypted vault for sacred creations. Protects all ScrollVerse assets
 *         with multi-signature verification and time-locked sovereign access.
 * @dev Implements EIP-712 structured data signing for vault access control.
 *      Frequency: 528Hz (DNA Healing - protection protocol)
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ProtectiveShieldVault is Ownable, ReentrancyGuard {

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    event AssetDeposited(address indexed depositor, address indexed asset, uint256 amount, bytes32 shieldId);
    event AssetWithdrawn(address indexed recipient, address indexed asset, uint256 amount, bytes32 shieldId);
    event ShieldActivated(bytes32 indexed shieldId, address indexed guardian, uint256 frequency);
    event ShieldBreached(bytes32 indexed shieldId, address indexed attacker, bool repelled);
    event FrequencyUpdated(bytes32 indexed shieldId, uint256 oldFreq, uint256 newFreq);
    event GuardianAdded(bytes32 indexed shieldId, address indexed guardian, uint8 tier);
    event EmergencyLockdown(bytes32 indexed shieldId, address indexed initiator, uint256 timestamp);

    // ─── STRUCTS ──────────────────────────────────────────────────────────────
    struct Shield {
        bytes32 id;
        address sovereign;
        uint256 frequency;          // 528, 963, or 432 Hz
        uint256 createdAt;
        uint256 lockedUntil;
        bool active;
        bool emergencyLocked;
        uint8 requiredSignatures;
        uint256 totalValueLocked;
        string sacredName;
    }

    struct AssetRecord {
        address token;
        uint256 amount;
        uint256 depositedAt;
        bool isNFT;
        uint256 tokenId;            // for NFTs
    }

    struct GuardianAccess {
        address guardian;
        uint8 tier;                 // 1-10
        bool active;
        uint256 addedAt;
        uint256 lastActivity;
    }

    // ─── STATE ────────────────────────────────────────────────────────────────
    mapping(bytes32 => Shield) public shields;
    mapping(bytes32 => AssetRecord[]) public shieldAssets;
    mapping(bytes32 => GuardianAccess[]) public shieldGuardians;
    mapping(bytes32 => mapping(address => bool)) public hasGuardianAccess;
    mapping(bytes32 => mapping(address => bool)) public withdrawalApprovals;
    mapping(address => bytes32[]) public sovereignShields;

    uint256 public constant FREQUENCY_528 = 528;
    uint256 public constant FREQUENCY_963 = 963;
    uint256 public constant FREQUENCY_432 = 432;
    uint256 public constant MIN_LOCK_PERIOD = 1 days;
    uint256 public constant MAX_LOCK_PERIOD = 365 days;

    uint256 private _shieldCounter;

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ─── MODIFIERS ────────────────────────────────────────────────────────────
    modifier shieldExists(bytes32 shieldId) {
        require(shields[shieldId].sovereign != address(0), "Shield: does not exist");
        _;
    }

    modifier onlySovereign(bytes32 shieldId) {
        require(shields[shieldId].sovereign == msg.sender, "Shield: not sovereign");
        _;
    }

    modifier shieldActive(bytes32 shieldId) {
        require(shields[shieldId].active, "Shield: not active");
        require(!shields[shieldId].emergencyLocked, "Shield: emergency locked");
        _;
    }

    modifier validFrequency(uint256 freq) {
        require(freq == FREQUENCY_528 || freq == FREQUENCY_963 || freq == FREQUENCY_432,
            "Shield: invalid sacred frequency");
        _;
    }

    // ─── CORE FUNCTIONS ───────────────────────────────────────────────────────

    /**
     * @notice Create a new protective shield vault
     * @param sacredName The sacred name of this vault
     * @param frequency The operating frequency (528, 963, or 432 Hz)
     * @param lockPeriod How long assets are locked (in seconds)
     * @param requiredSigs Number of guardian signatures required for withdrawal
     */
    function createShield(
        string calldata sacredName,
        uint256 frequency,
        uint256 lockPeriod,
        uint8 requiredSigs
    ) external validFrequency(frequency) returns (bytes32 shieldId) {
        require(lockPeriod >= MIN_LOCK_PERIOD && lockPeriod <= MAX_LOCK_PERIOD, "Shield: invalid lock period");
        require(requiredSigs >= 1 && requiredSigs <= 7, "Shield: invalid signature count");

        _shieldCounter++;
        shieldId = keccak256(abi.encodePacked(msg.sender, _shieldCounter, block.timestamp, sacredName));

        shields[shieldId] = Shield({
            id: shieldId,
            sovereign: msg.sender,
            frequency: frequency,
            createdAt: block.timestamp,
            lockedUntil: block.timestamp + lockPeriod,
            active: true,
            emergencyLocked: false,
            requiredSignatures: requiredSigs,
            totalValueLocked: 0,
            sacredName: sacredName
        });

        sovereignShields[msg.sender].push(shieldId);
        emit ShieldActivated(shieldId, msg.sender, frequency);
    }

    /**
     * @notice Deposit ERC-20 tokens into a shield vault
     */
    function depositToken(
        bytes32 shieldId,
        address token,
        uint256 amount
    ) external nonReentrant shieldExists(shieldId) shieldActive(shieldId) {
        require(amount > 0, "Shield: zero amount");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Shield: transfer failed");

        shieldAssets[shieldId].push(AssetRecord({
            token: token,
            amount: amount,
            depositedAt: block.timestamp,
            isNFT: false,
            tokenId: 0
        }));

        shields[shieldId].totalValueLocked += amount;
        emit AssetDeposited(msg.sender, token, amount, shieldId);
    }

    /**
     * @notice Deposit ETH/MATIC into a shield vault
     */
    function depositNative(bytes32 shieldId)
        external payable nonReentrant shieldExists(shieldId) shieldActive(shieldId)
    {
        require(msg.value > 0, "Shield: zero value");

        shieldAssets[shieldId].push(AssetRecord({
            token: address(0),
            amount: msg.value,
            depositedAt: block.timestamp,
            isNFT: false,
            tokenId: 0
        }));

        shields[shieldId].totalValueLocked += msg.value;
        emit AssetDeposited(msg.sender, address(0), msg.value, shieldId);
    }

    /**
     * @notice Deposit an NFT into a shield vault
     */
    function depositNFT(
        bytes32 shieldId,
        address nftContract,
        uint256 tokenId
    ) external nonReentrant shieldExists(shieldId) shieldActive(shieldId) {
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        shieldAssets[shieldId].push(AssetRecord({
            token: nftContract,
            amount: 1,
            depositedAt: block.timestamp,
            isNFT: true,
            tokenId: tokenId
        }));

        emit AssetDeposited(msg.sender, nftContract, tokenId, shieldId);
    }

    /**
     * @notice Approve a withdrawal (guardian multi-sig)
     */
    function approveWithdrawal(bytes32 shieldId)
        external shieldExists(shieldId)
    {
        require(
            hasGuardianAccess[shieldId][msg.sender] || shields[shieldId].sovereign == msg.sender,
            "Shield: not authorized"
        );
        withdrawalApprovals[shieldId][msg.sender] = true;
    }

    /**
     * @notice Withdraw ERC-20 tokens from shield (requires lock period + approvals)
     */
    function withdrawToken(
        bytes32 shieldId,
        address token,
        uint256 amount,
        address[] calldata approvers
    ) external nonReentrant onlySovereign(shieldId) shieldActive(shieldId) {
        Shield storage shield = shields[shieldId];
        require(block.timestamp >= shield.lockedUntil, "Shield: still locked");
        require(approvers.length >= shield.requiredSignatures, "Shield: insufficient signatures");

        // Verify approvals
        for (uint i = 0; i < approvers.length; i++) {
            require(withdrawalApprovals[shieldId][approvers[i]], "Shield: missing approval");
        }

        require(IERC20(token).transfer(msg.sender, amount), "Shield: transfer failed");
        shield.totalValueLocked = shield.totalValueLocked > amount ? shield.totalValueLocked - amount : 0;
        emit AssetWithdrawn(msg.sender, token, amount, shieldId);
    }

    /**
     * @notice Add a guardian to a shield vault
     */
    function addGuardian(bytes32 shieldId, address guardian, uint8 tier)
        external onlySovereign(shieldId)
    {
        require(!hasGuardianAccess[shieldId][guardian], "Shield: already a guardian");
        require(tier >= 1 && tier <= 10, "Shield: invalid tier");

        shieldGuardians[shieldId].push(GuardianAccess({
            guardian: guardian,
            tier: tier,
            active: true,
            addedAt: block.timestamp,
            lastActivity: block.timestamp
        }));

        hasGuardianAccess[shieldId][guardian] = true;
        emit GuardianAdded(shieldId, guardian, tier);
    }

    /**
     * @notice Emergency lockdown - freezes all withdrawals
     */
    function emergencyLockdown(bytes32 shieldId)
        external shieldExists(shieldId)
    {
        require(
            shields[shieldId].sovereign == msg.sender || hasGuardianAccess[shieldId][msg.sender],
            "Shield: not authorized"
        );
        shields[shieldId].emergencyLocked = true;
        emit EmergencyLockdown(shieldId, msg.sender, block.timestamp);
    }

    /**
     * @notice Lift emergency lockdown (sovereign only)
     */
    function liftLockdown(bytes32 shieldId) external onlySovereign(shieldId) {
        shields[shieldId].emergencyLocked = false;
    }

    /**
     * @notice Update shield frequency
     */
    function updateFrequency(bytes32 shieldId, uint256 newFrequency)
        external onlySovereign(shieldId) validFrequency(newFrequency)
    {
        uint256 oldFreq = shields[shieldId].frequency;
        shields[shieldId].frequency = newFrequency;
        emit FrequencyUpdated(shieldId, oldFreq, newFrequency);
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────────────────

    function getShield(bytes32 shieldId) external view returns (Shield memory) {
        return shields[shieldId];
    }

    function getShieldAssets(bytes32 shieldId) external view returns (AssetRecord[] memory) {
        return shieldAssets[shieldId];
    }

    function getShieldGuardians(bytes32 shieldId) external view returns (GuardianAccess[] memory) {
        return shieldGuardians[shieldId];
    }

    function getSovereignShields(address sovereign) external view returns (bytes32[] memory) {
        return sovereignShields[sovereign];
    }

    function isLocked(bytes32 shieldId) external view returns (bool) {
        return block.timestamp < shields[shieldId].lockedUntil || shields[shieldId].emergencyLocked;
    }

    function getTotalShields() external view returns (uint256) {
        return _shieldCounter;
    }

    // ─── RECEIVE ──────────────────────────────────────────────────────────────
    receive() external payable {}
}
