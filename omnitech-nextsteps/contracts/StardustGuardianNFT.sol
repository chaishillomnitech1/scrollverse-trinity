// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StardustGuardianNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Tier Definitions
    enum GuardianTier { Bronze, Silver, Gold, Omni }

    struct Guardian {
        uint256 tokenId;
        GuardianTier tier;
        uint256 stardustParticles;
        uint256 frequencyHz; // 528Hz, 963Hz, 1444Hz, 0 (for Omni/Infinite)
        uint256 consciousnessLevel;
        address owner;
    }

    mapping(uint256 => Guardian) public guardians;
    mapping(GuardianTier => uint256) public tierMaxSupply;
    mapping(GuardianTier => uint256) public tierCurrentSupply;

    // Events
    event GuardianMinted(uint256 indexed tokenId, address indexed owner, GuardianTier tier, uint256 frequencyHz);
    event GuardianUpgraded(uint256 indexed tokenId, GuardianTier oldTier, GuardianTier newTier);
    event StardustInfused(uint256 indexed tokenId, uint256 addedParticles);

    constructor() ERC721("Stardust Guardian NFT", "SDG") {
        // Set initial max supplies for each tier
        tierMaxSupply[GuardianTier.Bronze] = 10000; // Example: 10,000 Bronze NFTs
        tierMaxSupply[GuardianTier.Silver] = 5000;  // Example: 5,000 Silver NFTs
        tierMaxSupply[GuardianTier.Gold] = 1000;   // Example: 1,000 Gold NFTs
        tierMaxSupply[GuardianTier.Omni] = 144;    // Example: 144 Omni NFTs (highly limited)
    }

    /**
     * @dev Mints a new Stardust Guardian NFT.
     * Only the owner (deployer) can mint.
     * @param to The address to mint the NFT to.
     * @param tier The tier of the Guardian to mint.
     */
    function mintGuardian(address to, GuardianTier tier) public onlyOwner {
        require(tierCurrentSupply[tier] < tierMaxSupply[tier], "Max supply for this tier reached");

        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();
        _safeMint(to, newItemId);

        uint256 frequency;
        uint256 consciousness;
        uint256 stardust;

        if (tier == GuardianTier.Bronze) {
            frequency = 528; // 528Hz (Miracle frequency)
            consciousness = 25; // 25-50
            stardust = 1000; // 1,000 cosmic particles
        } else if (tier == GuardianTier.Silver) {
            frequency = 963; // 963Hz (Divine frequency)
            consciousness = 50; // 50-75
            stardust = 5000; // 5,000 cosmic particles
        } else if (tier == GuardianTier.Gold) {
            frequency = 1444; // 1,444Hz (Harmony frequency)
            consciousness = 75; // 75-90
            stardust = 25000; // 25,000 cosmic particles
        } else if (tier == GuardianTier.Omni) {
            frequency = 0; // Infinite frequency
            consciousness = 90; // 90-100
            stardust = 100000; // 100,000 cosmic particles
        }

        guardians[newItemId] = Guardian({
            tokenId: newItemId,
            tier: tier,
            stardustParticles: stardust,
            frequencyHz: frequency,
            consciousnessLevel: consciousness,
            owner: to
        });
        tierCurrentSupply[tier]++;

        emit GuardianMinted(newItemId, to, tier, frequency);
    }

    /**
     * @dev Upgrades the tier of an existing Guardian NFT.
     * Only the owner can upgrade.
     * @param tokenId The ID of the Guardian NFT to upgrade.
     * @param newTier The new tier for the Guardian.
     */
    function upgradeGuardianTier(uint256 tokenId, GuardianTier newTier) public onlyOwner {
        require(_exists(tokenId), "Guardian does not exist");
        Guardian storage guardian = guardians[tokenId];
        require(newTier > guardian.tier, "Cannot downgrade or upgrade to same tier");
        require(tierCurrentSupply[newTier] < tierMaxSupply[newTier], "Max supply for new tier reached");

        GuardianTier oldTier = guardian.tier;
        tierCurrentSupply[oldTier]--;
        tierCurrentSupply[newTier]++;

        guardian.tier = newTier;
        if (newTier == GuardianTier.Silver) {
            guardian.frequencyHz = 963;
            guardian.consciousnessLevel = 50;
            guardian.stardustParticles = 5000;
        } else if (newTier == GuardianTier.Gold) {
            guardian.frequencyHz = 1444;
            guardian.consciousnessLevel = 75;
            guardian.stardustParticles = 25000;
        } else if (newTier == GuardianTier.Omni) {
            guardian.frequencyHz = 0; // Infinite
            guardian.consciousnessLevel = 90;
            guardian.stardustParticles = 100000;
        }

        emit GuardianUpgraded(tokenId, oldTier, newTier);
    }

    /**
     * @dev Infuses a Guardian NFT with additional Stardust Particles.
     * @param tokenId The ID of the Guardian NFT.
     * @param amount The amount of Stardust Particles to add.
     */
    function infuseStardust(uint256 tokenId, uint256 amount) public onlyOwner {
        require(_exists(tokenId), "Guardian does not exist");
        guardians[tokenId].stardustParticles += amount;
        emit StardustInfused(tokenId, amount);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
