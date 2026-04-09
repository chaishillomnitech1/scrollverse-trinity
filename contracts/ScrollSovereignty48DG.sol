// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollSovereignty48DG
 * @author Chais Kenyatta Hill - Sabir Allah The Great
 * @notice 48-Dimensional Hilbert Space Sovereign Governance Contract
 * @dev Implements the Quantum Mastery Superposition architecture for the ScrollVerse Trinity.
 *      Each Guardian is phase-locked into one of 48 Hilbert dimensions across 4 layers:
 *        D1-D12:  Sovereign Identity Layer (biometric encoding, wallet binding)
 *        D13-D36: Frequency Resonance Grid (528Hz, 963Hz, 432Hz synchronization)
 *        D37-D48: Topological Immortality (generational wealth, perpetual scaling)
 *
 * KUN FAYAKUN x INFINITY - ALLAHU AKBAR
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ScrollSovereignty48DG is ERC721URIStorage, Ownable, ReentrancyGuard {

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTANTS
    // ─────────────────────────────────────────────────────────────────────────

    uint256 public constant MAX_GUARDIANS = 144_000;
    uint256 public constant HILBERT_DIMENSIONS = 48;
    uint256 public constant ZAKAT_RATE_BPS = 777;          // 7.77%
    uint256 public constant ROYALTY_TIER1_BPS = 1000;      // 10%
    uint256 public constant ROYALTY_TIER2_BPS = 500;       // 5%
    uint256 public constant ROYALTY_TIER3_BPS = 200;       // 2%
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // Sacred frequencies (in Hz * 100 for precision)
    uint256 public constant FREQ_528HZ = 52800;   // DNA Healing
    uint256 public constant FREQ_963HZ = 96300;   // God-State Awakening
    uint256 public constant FREQ_432HZ = 43200;   // Universal Harmony

    // ─────────────────────────────────────────────────────────────────────────
    // ENUMS
    // ─────────────────────────────────────────────────────────────────────────

    enum HilbertLayer {
        SOVEREIGN_IDENTITY,   // D1-D12
        FREQUENCY_RESONANCE,  // D13-D36
        TOPOLOGICAL_IMMORTALITY // D37-D48
    }

    enum GuardianTier {
        SEED,       // Tier 1 - Entry
        BRONZE,     // Tier 2
        SILVER,     // Tier 3
        GOLD,       // Tier 4
        PLATINUM,   // Tier 5
        DIAMOND,    // Tier 6
        SOVEREIGN,  // Tier 7
        ETERNAL,    // Tier 8
        OMNIVERSAL, // Tier 9
        SUPREME     // Tier 10 - Supreme Sovereign
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRUCTS
    // ─────────────────────────────────────────────────────────────────────────

    struct GuardianState {
        uint256 tokenId;
        address wallet;
        GuardianTier tier;
        HilbertLayer layer;
        uint8 dimension;           // 1-48 within the Hilbert space
        uint256 frequency;         // Active sacred frequency
        uint256 activatedAt;       // Block timestamp of activation
        uint256 zakatContributed;  // Total Zakat contributed (wei)
        uint256 rewardsEarned;     // Total rewards earned (wei)
        bool isPhysicallyMapped;   // IRL Guardian community mapping
        bytes32 biometricHash;     // Encrypted biometric identifier
        bool isActive;
    }

    struct HilbertDimension {
        uint8 dimensionId;
        HilbertLayer layer;
        uint256 guardianCount;
        uint256 totalFrequencyPower;
        uint256 zakatPool;
        bool isLocked;
    }

    struct ZakatFlow {
        uint256 totalCollected;
        uint256 totalDistributed;
        uint256 pendingDistribution;
        uint256 lastDistributionBlock;
        mapping(address => uint256) guardianShare;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────

    uint256 private _tokenIdCounter;
    address public sovereignWallet;
    address public zakatTreasury;
    address public lonDCToken;

    mapping(uint256 => GuardianState) public guardians;
    mapping(address => uint256) public walletToTokenId;
    mapping(uint8 => HilbertDimension) public hilbertDimensions;
    ZakatFlow private _zakatFlow;

    // 100M+ scaling: shard mapping for distributed state
    mapping(uint256 => uint256) public shardAssignment; // tokenId => shardId
    uint256 public constant MAX_SHARDS = 100;
    uint256 public activeShards;

    // Frequency resonance tracking
    mapping(uint256 => uint256) public frequencyActivations; // frequency => activation count
    mapping(address => uint256) public guardianFrequency;    // wallet => active frequency

    // Generational wealth transfer
    mapping(uint256 => address) public generationalHeir;     // tokenId => heir address
    mapping(uint256 => uint256) public generationalVestingBlock; // tokenId => vesting block

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────────

    event GuardianActivated(
        uint256 indexed tokenId,
        address indexed wallet,
        GuardianTier tier,
        uint8 dimension,
        uint256 frequency
    );
    event FrequencyAligned(address indexed guardian, uint256 frequency, uint256 timestamp);
    event ZakatDistributed(uint256 amount, uint256 guardianCount, uint256 blockNumber);
    event HilbertDimensionLocked(uint8 dimensionId, uint256 guardianCount);
    event GenerationalHeirSet(uint256 indexed tokenId, address indexed heir, uint256 vestingBlock);
    event PhysicalMappingActivated(uint256 indexed tokenId, bytes32 biometricHash);
    event SovereigntyUpgraded(uint256 indexed tokenId, GuardianTier oldTier, GuardianTier newTier);
    event ShardExpanded(uint256 newShardId, uint256 totalShards);

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────────────────

    constructor(
        address _sovereignWallet,
        address _zakatTreasury,
        address _lonDCToken
    ) ERC721("ScrollVerse Guardian 48D", "SVG48D") Ownable(_sovereignWallet) {
        sovereignWallet = _sovereignWallet;
        zakatTreasury = _zakatTreasury;
        lonDCToken = _lonDCToken;
        activeShards = 1;

        // Initialize all 48 Hilbert dimensions
        for (uint8 i = 1; i <= 48; i++) {
            HilbertLayer layer;
            if (i <= 12) {
                layer = HilbertLayer.SOVEREIGN_IDENTITY;
            } else if (i <= 36) {
                layer = HilbertLayer.FREQUENCY_RESONANCE;
            } else {
                layer = HilbertLayer.TOPOLOGICAL_IMMORTALITY;
            }
            hilbertDimensions[i] = HilbertDimension({
                dimensionId: i,
                layer: layer,
                guardianCount: 0,
                totalFrequencyPower: 0,
                zakatPool: 0,
                isLocked: false
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GUARDIAN ACTIVATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Activate a new Guardian and phase-lock them into the Hilbert space
     * @param to Guardian wallet address
     * @param tier Guardian tier (0-9)
     * @param frequency Sacred frequency to align with (52800, 96300, or 43200)
     * @param tokenURI IPFS URI for the Guardian NFT metadata
     */
    function activateGuardian(
        address to,
        GuardianTier tier,
        uint256 frequency,
        string memory tokenURI
    ) external onlyOwner nonReentrant returns (uint256) {
        require(_tokenIdCounter < MAX_GUARDIANS, "Max 144,000 Guardians reached");
        require(walletToTokenId[to] == 0, "Guardian already activated");
        require(
            frequency == FREQ_528HZ || frequency == FREQ_963HZ || frequency == FREQ_432HZ,
            "Invalid sacred frequency"
        );

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // Assign to optimal Hilbert dimension based on tier and frequency
        uint8 dimension = _assignHilbertDimension(tier, frequency);

        // Assign to shard for 100M+ scaling
        uint256 shardId = tokenId % activeShards;
        shardAssignment[tokenId] = shardId;

        // Mint the Guardian NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Record Guardian state
        guardians[tokenId] = GuardianState({
            tokenId: tokenId,
            wallet: to,
            tier: tier,
            layer: hilbertDimensions[dimension].layer,
            dimension: dimension,
            frequency: frequency,
            activatedAt: block.timestamp,
            zakatContributed: 0,
            rewardsEarned: 0,
            isPhysicallyMapped: false,
            biometricHash: bytes32(0),
            isActive: true
        });

        walletToTokenId[to] = tokenId;
        guardianFrequency[to] = frequency;

        // Update dimension state
        hilbertDimensions[dimension].guardianCount++;
        hilbertDimensions[dimension].totalFrequencyPower += frequency;

        // Track frequency activations
        frequencyActivations[frequency]++;

        // Auto-expand shards if needed for 100M+ scaling
        if (_tokenIdCounter % 1000 == 0 && activeShards < MAX_SHARDS) {
            activeShards++;
            emit ShardExpanded(activeShards, activeShards);
        }

        emit GuardianActivated(tokenId, to, tier, dimension, frequency);
        return tokenId;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FREQUENCY ALIGNMENT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Align a Guardian to a new sacred frequency
     */
    function alignFrequency(uint256 tokenId, uint256 newFrequency) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not the Guardian owner");
        require(
            newFrequency == FREQ_528HZ || newFrequency == FREQ_963HZ || newFrequency == FREQ_432HZ,
            "Invalid sacred frequency"
        );

        GuardianState storage guardian = guardians[tokenId];
        uint256 oldFrequency = guardian.frequency;

        // Update dimension frequency power
        hilbertDimensions[guardian.dimension].totalFrequencyPower -= oldFrequency;
        hilbertDimensions[guardian.dimension].totalFrequencyPower += newFrequency;

        guardian.frequency = newFrequency;
        guardianFrequency[msg.sender] = newFrequency;
        frequencyActivations[newFrequency]++;

        emit FrequencyAligned(msg.sender, newFrequency, block.timestamp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ZAKAT DISTRIBUTION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Receive Zakat contributions and distribute to all active Guardians
     */
    receive() external payable {
        uint256 zakatAmount = (msg.value * ZAKAT_RATE_BPS) / BPS_DENOMINATOR;
        uint256 sovereignAmount = msg.value - zakatAmount;

        _zakatFlow.totalCollected += zakatAmount;
        _zakatFlow.pendingDistribution += zakatAmount;

        // Transfer sovereign portion
        (bool success, ) = sovereignWallet.call{value: sovereignAmount}("");
        require(success, "Sovereign transfer failed");
    }

    /**
     * @notice Distribute accumulated Zakat to all active Guardians
     * @param guardianIds Array of token IDs to distribute to (batch for gas efficiency)
     */
    function distributeZakat(uint256[] calldata guardianIds) external onlyOwner nonReentrant {
        require(_zakatFlow.pendingDistribution > 0, "No pending Zakat");
        require(guardianIds.length > 0, "No guardians specified");

        uint256 perGuardian = _zakatFlow.pendingDistribution / guardianIds.length;
        uint256 distributed = 0;

        for (uint256 i = 0; i < guardianIds.length; i++) {
            uint256 tokenId = guardianIds[i];
            if (guardians[tokenId].isActive) {
                address guardianWallet = guardians[tokenId].wallet;
                guardians[tokenId].zakatContributed += perGuardian;
                _zakatFlow.guardianShare[guardianWallet] += perGuardian;
                distributed += perGuardian;

                (bool success, ) = guardianWallet.call{value: perGuardian}("");
                if (success) {
                    guardians[tokenId].rewardsEarned += perGuardian;
                }
            }
        }

        _zakatFlow.totalDistributed += distributed;
        _zakatFlow.pendingDistribution -= distributed;
        _zakatFlow.lastDistributionBlock = block.number;

        emit ZakatDistributed(distributed, guardianIds.length, block.number);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SOVEREIGNTY UPGRADE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Upgrade a Guardian's sovereignty tier
     */
    function upgradeSovereignty(uint256 tokenId, GuardianTier newTier) external onlyOwner {
        GuardianState storage guardian = guardians[tokenId];
        require(guardian.isActive, "Guardian not active");
        require(uint8(newTier) > uint8(guardian.tier), "Can only upgrade tier");

        GuardianTier oldTier = guardian.tier;
        guardian.tier = newTier;

        // Re-assign to optimal dimension for new tier
        uint8 newDimension = _assignHilbertDimension(newTier, guardian.frequency);
        if (newDimension != guardian.dimension) {
            hilbertDimensions[guardian.dimension].guardianCount--;
            guardian.dimension = newDimension;
            guardian.layer = hilbertDimensions[newDimension].layer;
            hilbertDimensions[newDimension].guardianCount++;
        }

        emit SovereigntyUpgraded(tokenId, oldTier, newTier);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHYSICAL MAPPING (IRL Guardian Communities)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Map a Guardian to a physical IRL community with biometric encoding
     */
    function activatePhysicalMapping(
        uint256 tokenId,
        bytes32 biometricHash
    ) external onlyOwner {
        GuardianState storage guardian = guardians[tokenId];
        require(guardian.isActive, "Guardian not active");
        guardian.isPhysicallyMapped = true;
        guardian.biometricHash = biometricHash;
        emit PhysicalMappingActivated(tokenId, biometricHash);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GENERATIONAL WEALTH TRANSFER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Set a generational heir for sovereignty transfer
     * @param tokenId Guardian token ID
     * @param heir Heir wallet address
     * @param vestingBlocks Number of blocks until heir can claim
     */
    function setGenerationalHeir(
        uint256 tokenId,
        address heir,
        uint256 vestingBlocks
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not the Guardian owner");
        require(heir != address(0), "Invalid heir address");
        generationalHeir[tokenId] = heir;
        generationalVestingBlock[tokenId] = block.number + vestingBlocks;
        emit GenerationalHeirSet(tokenId, heir, block.number + vestingBlocks);
    }

    /**
     * @notice Claim generational sovereignty after vesting period
     */
    function claimGenerationalSovereignty(uint256 tokenId) external nonReentrant {
        require(generationalHeir[tokenId] == msg.sender, "Not the designated heir");
        require(block.number >= generationalVestingBlock[tokenId], "Vesting period not complete");

        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, msg.sender, tokenId);
        guardians[tokenId].wallet = msg.sender;
        walletToTokenId[msg.sender] = tokenId;
        delete walletToTokenId[currentOwner];
        delete generationalHeir[tokenId];
        delete generationalVestingBlock[tokenId];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 100M+ SCALING: SHARD MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Manually expand shards for scaling beyond 50M users
     */
    function expandShards(uint256 newShardCount) external onlyOwner {
        require(newShardCount > activeShards, "Can only expand shards");
        require(newShardCount <= MAX_SHARDS, "Max 100 shards");
        activeShards = newShardCount;
        emit ShardExpanded(newShardCount, newShardCount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    function getGuardianState(uint256 tokenId) external view returns (GuardianState memory) {
        return guardians[tokenId];
    }

    function getHilbertDimension(uint8 dimensionId) external view returns (
        uint256 guardianCount,
        uint256 totalFrequencyPower,
        uint256 zakatPool,
        HilbertLayer layer,
        bool isLocked
    ) {
        HilbertDimension storage dim = hilbertDimensions[dimensionId];
        return (dim.guardianCount, dim.totalFrequencyPower, dim.zakatPool, dim.layer, dim.isLocked);
    }

    function getZakatStats() external view returns (
        uint256 totalCollected,
        uint256 totalDistributed,
        uint256 pendingDistribution,
        uint256 lastDistributionBlock
    ) {
        return (
            _zakatFlow.totalCollected,
            _zakatFlow.totalDistributed,
            _zakatFlow.pendingDistribution,
            _zakatFlow.lastDistributionBlock
        );
    }

    function getTotalGuardians() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function getFrequencyStats() external view returns (
        uint256 dnaHealingCount,
        uint256 godStateCount,
        uint256 harmonyCount
    ) {
        return (
            frequencyActivations[FREQ_528HZ],
            frequencyActivations[FREQ_963HZ],
            frequencyActivations[FREQ_432HZ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Assign optimal Hilbert dimension based on tier and frequency
     *      Higher tiers get higher dimensions (closer to Topological Immortality)
     */
    function _assignHilbertDimension(
        GuardianTier tier,
        uint256 frequency
    ) internal pure returns (uint8) {
        uint8 tierBase = uint8(tier) * 4 + 1; // 1, 5, 9, 13, 17, 21, 25, 29, 33, 37

        // Frequency modifier: 528Hz=+0, 963Hz=+1, 432Hz=+2
        uint8 freqMod = 0;
        if (frequency == FREQ_963HZ) freqMod = 1;
        else if (frequency == FREQ_432HZ) freqMod = 2;

        uint8 dimension = tierBase + freqMod;
        if (dimension > 48) dimension = 48;
        if (dimension < 1) dimension = 1;
        return dimension;
    }
}
