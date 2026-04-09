// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PublicProtectiveFramework
 * @author Chais Kenyatta Hill - Sabir Allah The Great
 * @notice Open-source protective framework for 50M+ guardians.
 *         Based on Chais's proprietary physics, math, science, frequency,
 *         and Omni methods - freely available to all ScrollVerse guardians.
 * @dev Implements the 10-tier Guardian protection protocol with
 *      frequency-based access control and community governance.
 *      Frequency: 432Hz (Universal Harmony - open access)
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PublicProtectiveFramework is Ownable, ReentrancyGuard {

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    event GuardianRegistered(address indexed guardian, uint8 tier, uint256 frequency);
    event ProtectionActivated(address indexed guardian, bytes32 protectionId, uint256 level);
    event CommunityProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event CommunityVoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed, uint256 forVotes, uint256 againstVotes);
    event FrequencyBroadcast(uint256 frequency, address indexed broadcaster, uint256 timestamp, uint256 listeners);
    event OmniMethodActivated(bytes32 indexed methodId, address indexed activator, string methodName);

    // ─── STRUCTS ──────────────────────────────────────────────────────────────
    struct Guardian {
        address wallet;
        uint8 tier;
        uint256 frequency;
        uint256 registeredAt;
        uint256 protectionScore;
        bool active;
        uint256 votingPower;
    }

    struct Protection {
        bytes32 id;
        address guardian;
        uint8 level;                // 1-10
        uint256 activatedAt;
        uint256 expiresAt;
        bool active;
        string protectionType;
    }

    struct CommunityProposal {
        uint256 id;
        address proposer;
        string description;
        string methodName;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 createdAt;
        uint256 votingEndsAt;
        bool executed;
        bool passed;
    }

    struct OmniMethod {
        bytes32 id;
        string name;
        string description;
        uint256 frequency;
        uint256 activationCount;
        bool active;
        address creator;
    }

    // ─── STATE ────────────────────────────────────────────────────────────────
    mapping(address => Guardian) public guardians;
    mapping(bytes32 => Protection) public protections;
    mapping(uint256 => CommunityProposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => OmniMethod) public omniMethods;
    mapping(address => bytes32[]) public guardianProtections;

    address[] public registeredGuardians;
    bytes32[] public activeMethods;

    uint256 private _proposalCounter;
    uint256 private _protectionCounter;
    uint256 public totalGuardians;
    uint256 public totalProtectionsActivated;

    uint256 public constant VOTING_PERIOD = 7 days;
    uint8 public constant MIN_TIER_TO_PROPOSE = 4;  // Council Guardian+
    uint256 public constant QUORUM_PERCENTAGE = 10;   // 10% of guardians

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {
        // Initialize the 3 core Omni Methods
        _createOmniMethod("FREQUENCY_528_HEALING", "DNA Healing Protocol - 528Hz activation for guardian protection", 528);
        _createOmniMethod("FREQUENCY_963_ENLIGHTENMENT", "Crown Activation Protocol - 963Hz for sovereign consciousness", 963);
        _createOmniMethod("FREQUENCY_432_HARMONY", "Universal Harmony Protocol - 432Hz for ecosystem alignment", 432);
    }

    // ─── MODIFIERS ────────────────────────────────────────────────────────────
    modifier onlyGuardian() {
        require(guardians[msg.sender].active, "PPF: not a registered guardian");
        _;
    }

    modifier onlyTier(uint8 minTier) {
        require(guardians[msg.sender].tier >= minTier, "PPF: insufficient tier");
        _;
    }

    // ─── CORE FUNCTIONS ───────────────────────────────────────────────────────

    /**
     * @notice Register as a Guardian in the public framework
     * @param tier Guardian tier (1-10)
     * @param frequency Operating frequency (528, 963, or 432)
     */
    function registerGuardian(uint8 tier, uint256 frequency) external {
        require(!guardians[msg.sender].active, "PPF: already registered");
        require(tier >= 1 && tier <= 10, "PPF: invalid tier");
        require(frequency == 528 || frequency == 963 || frequency == 432, "PPF: invalid frequency");

        guardians[msg.sender] = Guardian({
            wallet: msg.sender,
            tier: tier,
            frequency: frequency,
            registeredAt: block.timestamp,
            protectionScore: 0,
            active: true,
            votingPower: uint256(tier) * 100  // Higher tier = more voting power
        });

        registeredGuardians.push(msg.sender);
        totalGuardians++;
        emit GuardianRegistered(msg.sender, tier, frequency);
    }

    /**
     * @notice Activate protection for a guardian
     */
    function activateProtection(
        uint8 level,
        string calldata protectionType,
        uint256 duration
    ) external onlyGuardian returns (bytes32 protectionId) {
        require(level >= 1 && level <= 10, "PPF: invalid level");
        require(duration >= 1 hours && duration <= 365 days, "PPF: invalid duration");

        _protectionCounter++;
        protectionId = keccak256(abi.encodePacked(msg.sender, _protectionCounter, block.timestamp));

        protections[protectionId] = Protection({
            id: protectionId,
            guardian: msg.sender,
            level: level,
            activatedAt: block.timestamp,
            expiresAt: block.timestamp + duration,
            active: true,
            protectionType: protectionType
        });

        guardianProtections[msg.sender].push(protectionId);
        guardians[msg.sender].protectionScore += uint256(level);
        totalProtectionsActivated++;

        emit ProtectionActivated(msg.sender, protectionId, level);
    }

    /**
     * @notice Create a community governance proposal
     */
    function createProposal(
        string calldata description,
        string calldata methodName
    ) external onlyGuardian onlyTier(MIN_TIER_TO_PROPOSE) returns (uint256 proposalId) {
        _proposalCounter++;
        proposalId = _proposalCounter;

        proposals[proposalId] = CommunityProposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            methodName: methodName,
            forVotes: 0,
            againstVotes: 0,
            createdAt: block.timestamp,
            votingEndsAt: block.timestamp + VOTING_PERIOD,
            executed: false,
            passed: false
        });

        emit CommunityProposalCreated(proposalId, msg.sender, description);
    }

    /**
     * @notice Cast a vote on a community proposal
     */
    function castVote(uint256 proposalId, bool support) external onlyGuardian {
        CommunityProposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.votingEndsAt, "PPF: voting ended");
        require(!hasVoted[proposalId][msg.sender], "PPF: already voted");

        uint256 weight = guardians[msg.sender].votingPower;
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        hasVoted[proposalId][msg.sender] = true;
        emit CommunityVoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @notice Execute a proposal after voting ends
     */
    function executeProposal(uint256 proposalId) external {
        CommunityProposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.votingEndsAt, "PPF: voting not ended");
        require(!proposal.executed, "PPF: already executed");

        proposal.executed = true;
        proposal.passed = proposal.forVotes > proposal.againstVotes;

        emit ProposalExecuted(proposalId, proposal.passed, proposal.forVotes, proposal.againstVotes);
    }

    /**
     * @notice Broadcast a frequency to all guardians
     */
    function broadcastFrequency(uint256 frequency) external onlyGuardian {
        require(frequency == 528 || frequency == 963 || frequency == 432, "PPF: invalid frequency");
        emit FrequencyBroadcast(frequency, msg.sender, block.timestamp, totalGuardians);
    }

    /**
     * @notice Activate an Omni Method
     */
    function activateOmniMethod(bytes32 methodId) external onlyGuardian {
        require(omniMethods[methodId].active, "PPF: method not active");
        omniMethods[methodId].activationCount++;
        emit OmniMethodActivated(methodId, msg.sender, omniMethods[methodId].name);
    }

    // ─── INTERNAL ─────────────────────────────────────────────────────────────
    function _createOmniMethod(string memory name, string memory description, uint256 frequency) internal {
        bytes32 methodId = keccak256(abi.encodePacked(name));
        omniMethods[methodId] = OmniMethod({
            id: methodId,
            name: name,
            description: description,
            frequency: frequency,
            activationCount: 0,
            active: true,
            creator: msg.sender
        });
        activeMethods.push(methodId);
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────────────────
    function getGuardian(address wallet) external view returns (Guardian memory) {
        return guardians[wallet];
    }

    function getProposal(uint256 proposalId) external view returns (CommunityProposal memory) {
        return proposals[proposalId];
    }

    function getOmniMethod(bytes32 methodId) external view returns (OmniMethod memory) {
        return omniMethods[methodId];
    }

    function getActiveMethods() external view returns (bytes32[] memory) {
        return activeMethods;
    }

    function getGuardianProtections(address guardian) external view returns (bytes32[] memory) {
        return guardianProtections[guardian];
    }

    function getTotalProposals() external view returns (uint256) {
        return _proposalCounter;
    }
}
