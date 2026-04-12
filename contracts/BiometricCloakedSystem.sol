// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BiometricCloakedSystem
 * @author Chais Kenyatta Hill - Sabir Allah The Great
 * @notice One-of-none biometric identity system for sovereign creators.
 *         Each identity is unique, non-transferable, and cloaked with
 *         Chais Kenyatta Hill's proprietary frequency-physics methodology.
 * @dev Soulbound identity tokens with biometric hash verification.
 *      Frequency: 963Hz (Enlightenment - identity activation)
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BiometricCloakedSystem is Ownable, ReentrancyGuard {

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    event IdentityCreated(uint256 indexed identityId, address indexed sovereign, bytes32 biometricHash);
    event IdentityVerified(uint256 indexed identityId, address indexed verifier, bool success);
    event IdentityRevoked(uint256 indexed identityId, address indexed revoker, string reason);
    event CloakActivated(uint256 indexed identityId, uint256 cloakLevel, uint256 frequency);
    event BiometricUpdated(uint256 indexed identityId, bytes32 oldHash, bytes32 newHash);
    event SovereignAccessGranted(uint256 indexed identityId, address indexed grantee, uint8 accessLevel);
    event FrequencyResonanceActivated(uint256 indexed identityId, uint256 frequency, uint256 timestamp);

    // ─── STRUCTS ──────────────────────────────────────────────────────────────
    struct SovereignIdentity {
        uint256 id;
        address wallet;
        bytes32 biometricHash;      // Hash of biometric data (never stored raw)
        bytes32 frequencySignature; // Unique frequency-physics signature
        uint256 cloakLevel;         // 1-7 (7 = maximum cloak)
        uint256 createdAt;
        uint256 lastVerified;
        bool active;
        bool revoked;
        string sacredName;
        uint256 frequency;          // Operating frequency
        uint256 verificationCount;
    }

    struct AccessGrant {
        address grantee;
        uint8 accessLevel;          // 1-10 (mirrors Guardian tiers)
        uint256 grantedAt;
        uint256 expiresAt;
        bool active;
    }

    struct FrequencyResonance {
        uint256 frequency;
        uint256 activatedAt;
        uint256 duration;
        bool active;
    }

    // ─── STATE ────────────────────────────────────────────────────────────────
    mapping(uint256 => SovereignIdentity) public identities;
    mapping(address => uint256) public walletToIdentity;
    mapping(uint256 => AccessGrant[]) public identityAccess;
    mapping(uint256 => FrequencyResonance[]) public resonanceHistory;
    mapping(bytes32 => bool) public biometricHashUsed;
    mapping(uint256 => mapping(address => bool)) public hasAccess;

    uint256 private _identityCounter;
    uint256 public constant MAX_CLOAK_LEVEL = 7;
    uint256 public constant FREQUENCY_528 = 528;
    uint256 public constant FREQUENCY_963 = 963;
    uint256 public constant FREQUENCY_432 = 432;

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ─── MODIFIERS ────────────────────────────────────────────────────────────
    modifier identityExists(uint256 identityId) {
        require(identities[identityId].wallet != address(0), "BCS: identity does not exist");
        _;
    }

    modifier identityActive(uint256 identityId) {
        require(identities[identityId].active && !identities[identityId].revoked, "BCS: identity not active");
        _;
    }

    modifier onlyIdentityOwner(uint256 identityId) {
        require(identities[identityId].wallet == msg.sender, "BCS: not identity owner");
        _;
    }

    // ─── CORE FUNCTIONS ───────────────────────────────────────────────────────

    /**
     * @notice Create a sovereign biometric identity
     * @param biometricHash Keccak256 hash of biometric data (fingerprint, retina, voice)
     * @param frequencySignature Unique frequency-physics signature from Chais's methodology
     * @param sacredName The sacred name of the identity holder
     * @param initialFrequency Starting operating frequency (528, 963, or 432)
     */
    function createIdentity(
        bytes32 biometricHash,
        bytes32 frequencySignature,
        string calldata sacredName,
        uint256 initialFrequency
    ) external nonReentrant returns (uint256 identityId) {
        require(walletToIdentity[msg.sender] == 0, "BCS: identity already exists");
        require(!biometricHashUsed[biometricHash], "BCS: biometric already registered");
        require(
            initialFrequency == FREQUENCY_528 || initialFrequency == FREQUENCY_963 || initialFrequency == FREQUENCY_432,
            "BCS: invalid frequency"
        );
        require(bytes(sacredName).length > 0 && bytes(sacredName).length <= 64, "BCS: invalid name length");

        _identityCounter++;
        identityId = _identityCounter;

        identities[identityId] = SovereignIdentity({
            id: identityId,
            wallet: msg.sender,
            biometricHash: biometricHash,
            frequencySignature: frequencySignature,
            cloakLevel: 1,
            createdAt: block.timestamp,
            lastVerified: block.timestamp,
            active: true,
            revoked: false,
            sacredName: sacredName,
            frequency: initialFrequency,
            verificationCount: 0
        });

        walletToIdentity[msg.sender] = identityId;
        biometricHashUsed[biometricHash] = true;

        emit IdentityCreated(identityId, msg.sender, biometricHash);
        emit CloakActivated(identityId, 1, initialFrequency);
    }

    /**
     * @notice Verify biometric identity
     * @param identityId The identity to verify
     * @param providedHash The biometric hash provided for verification
     */
    function verifyIdentity(uint256 identityId, bytes32 providedHash)
        external identityExists(identityId) identityActive(identityId)
        returns (bool verified)
    {
        SovereignIdentity storage identity = identities[identityId];
        verified = identity.biometricHash == providedHash;

        if (verified) {
            identity.lastVerified = block.timestamp;
            identity.verificationCount++;
        }

        emit IdentityVerified(identityId, msg.sender, verified);
    }

    /**
     * @notice Increase cloak level (max 7)
     */
    function increaseCloakLevel(uint256 identityId)
        external onlyIdentityOwner(identityId) identityActive(identityId)
    {
        SovereignIdentity storage identity = identities[identityId];
        require(identity.cloakLevel < MAX_CLOAK_LEVEL, "BCS: maximum cloak level reached");
        identity.cloakLevel++;
        emit CloakActivated(identityId, identity.cloakLevel, identity.frequency);
    }

    /**
     * @notice Activate frequency resonance for a duration
     */
    function activateFrequencyResonance(
        uint256 identityId,
        uint256 frequency,
        uint256 duration
    ) external onlyIdentityOwner(identityId) identityActive(identityId) {
        require(
            frequency == FREQUENCY_528 || frequency == FREQUENCY_963 || frequency == FREQUENCY_432,
            "BCS: invalid frequency"
        );
        require(duration >= 1 hours && duration <= 30 days, "BCS: invalid duration");

        identities[identityId].frequency = frequency;

        resonanceHistory[identityId].push(FrequencyResonance({
            frequency: frequency,
            activatedAt: block.timestamp,
            duration: duration,
            active: true
        }));

        emit FrequencyResonanceActivated(identityId, frequency, block.timestamp);
    }

    /**
     * @notice Update biometric hash (requires current hash verification)
     */
    function updateBiometricHash(
        uint256 identityId,
        bytes32 currentHash,
        bytes32 newHash
    ) external onlyIdentityOwner(identityId) identityActive(identityId) {
        SovereignIdentity storage identity = identities[identityId];
        require(identity.biometricHash == currentHash, "BCS: current hash mismatch");
        require(!biometricHashUsed[newHash], "BCS: new hash already in use");

        biometricHashUsed[identity.biometricHash] = false;
        bytes32 oldHash = identity.biometricHash;
        identity.biometricHash = newHash;
        biometricHashUsed[newHash] = true;

        emit BiometricUpdated(identityId, oldHash, newHash);
    }

    /**
     * @notice Grant access to another address
     */
    function grantAccess(
        uint256 identityId,
        address grantee,
        uint8 accessLevel,
        uint256 duration
    ) external onlyIdentityOwner(identityId) identityActive(identityId) {
        require(accessLevel >= 1 && accessLevel <= 10, "BCS: invalid access level");
        require(!hasAccess[identityId][grantee], "BCS: already has access");

        identityAccess[identityId].push(AccessGrant({
            grantee: grantee,
            accessLevel: accessLevel,
            grantedAt: block.timestamp,
            expiresAt: block.timestamp + duration,
            active: true
        }));

        hasAccess[identityId][grantee] = true;
        emit SovereignAccessGranted(identityId, grantee, accessLevel);
    }

    /**
     * @notice Revoke identity (irreversible)
     */
    function revokeIdentity(uint256 identityId, string calldata reason)
        external identityExists(identityId)
    {
        require(
            identities[identityId].wallet == msg.sender || owner() == msg.sender,
            "BCS: not authorized"
        );
        identities[identityId].revoked = true;
        identities[identityId].active = false;
        emit IdentityRevoked(identityId, msg.sender, reason);
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────────────────

    function getIdentity(uint256 identityId) external view returns (SovereignIdentity memory) {
        return identities[identityId];
    }

    function getIdentityByWallet(address wallet) external view returns (SovereignIdentity memory) {
        uint256 id = walletToIdentity[wallet];
        require(id != 0, "BCS: no identity for wallet");
        return identities[id];
    }

    function getResonanceHistory(uint256 identityId) external view returns (FrequencyResonance[] memory) {
        return resonanceHistory[identityId];
    }

    function getAccessGrants(uint256 identityId) external view returns (AccessGrant[] memory) {
        return identityAccess[identityId];
    }

    function getTotalIdentities() external view returns (uint256) {
        return _identityCounter;
    }

    function isVerified(uint256 identityId) external view returns (bool) {
        SovereignIdentity memory identity = identities[identityId];
        return identity.active && !identity.revoked && (block.timestamp - identity.lastVerified) < 30 days;
    }
}
