// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScrollSoul NFT — ERC-721 Guardian Identity Tokens
 * @author Chais Kenyatta Hill — Sabir Allah the Great / XLVIIIblocks Tech
 * @notice Each ScrollSoul NFT represents a Guardian's sovereign identity on-chain.
 *         Tiers: 1=Guardian, 2=Sovereign, 3=Ascendant, 4=AI_Legion
 *         Royalties: 7.77% on all secondary sales (EIP-2981)
 *         Max supply: 144,000 (the number of Guardians)
 *         Frequency: 432Hz — Universal Harmony
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ScrollSoulNFT is ERC721, ERC721Enumerable, ERC721URIStorage, IERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY = 144_000;
    uint256 public constant ROYALTY_BPS = 777;           // 7.77%
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant FREQUENCY = 432;             // Hz — Universal Harmony

    // Tier mint prices in MATIC (wei)
    uint256 public constant PRICE_GUARDIAN   = 144 ether;   // 144 MATIC
    uint256 public constant PRICE_SOVEREIGN  = 444 ether;   // 444 MATIC
    uint256 public constant PRICE_ASCENDANT  = 1444 ether;  // 1,444 MATIC
    uint256 public constant PRICE_AI_LEGION  = 777 ether;   // 777 MATIC

    // ── State ──────────────────────────────────────────────────────────────
    uint256 private _nextTokenId = 1;
    address public royaltyReceiver;
    string public baseURI;

    mapping(uint256 => uint256) public tokenTier;   // tokenId => tier (1-4)
    mapping(address => uint256) public holderTier;  // address => highest tier owned

    // ── Events ─────────────────────────────────────────────────────────────
    event ScrollSoulMinted(address indexed to, uint256 indexed tokenId, uint256 tier, uint256 price);
    event BaseURIUpdated(string newBaseURI);
    event RoyaltyReceiverUpdated(address indexed newReceiver);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address _royaltyReceiver, string memory _baseURI)
        ERC721("ScrollSoul Guardian", "SOUL")
        Ownable(msg.sender)
    {
        require(_royaltyReceiver != address(0), "SOUL: zero royalty address");
        royaltyReceiver = _royaltyReceiver;
        baseURI = _baseURI;
    }

    // ── Public mint ────────────────────────────────────────────────────────
    function mint(uint256 tier) external payable nonReentrant {
        require(tier >= 1 && tier <= 4, "SOUL: invalid tier");
        require(_nextTokenId <= MAX_SUPPLY, "SOUL: max supply reached");

        uint256 price = _tierPrice(tier);
        require(msg.value >= price, "SOUL: insufficient MATIC");

        uint256 tokenId = _nextTokenId++;
        tokenTier[tokenId] = tier;

        // Update holder's highest tier
        if (tier > holderTier[msg.sender]) {
            holderTier[msg.sender] = tier;
        }

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(baseURI, tier.toString(), ".json")));

        // Refund excess MATIC
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit ScrollSoulMinted(msg.sender, tokenId, tier, price);
    }

    // ── Owner mint (for airdrops / Guardian rewards) ───────────────────────
    function ownerMint(address to, uint256 tier) external onlyOwner {
        require(tier >= 1 && tier <= 4, "SOUL: invalid tier");
        require(_nextTokenId <= MAX_SUPPLY, "SOUL: max supply reached");

        uint256 tokenId = _nextTokenId++;
        tokenTier[tokenId] = tier;
        if (tier > holderTier[to]) holderTier[to] = tier;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(baseURI, tier.toString(), ".json")));
        emit ScrollSoulMinted(to, tokenId, tier, 0);
    }

    // ── EIP-2981 Royalties ─────────────────────────────────────────────────
    function royaltyInfo(uint256, uint256 salePrice)
        external view override returns (address receiver, uint256 royaltyAmount)
    {
        return (royaltyReceiver, (salePrice * ROYALTY_BPS) / BPS_DENOMINATOR);
    }

    // ── Owner admin ────────────────────────────────────────────────────────
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    function setRoyaltyReceiver(address _new) external onlyOwner {
        require(_new != address(0), "SOUL: zero address");
        royaltyReceiver = _new;
        emit RoyaltyReceiverUpdated(_new);
    }

    function withdrawMATIC() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "SOUL: nothing to withdraw");
        payable(royaltyReceiver).transfer(balance);
    }

    // ── View helpers ───────────────────────────────────────────────────────
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function _tierPrice(uint256 tier) internal pure returns (uint256) {
        if (tier == 1) return PRICE_GUARDIAN;
        if (tier == 2) return PRICE_SOVEREIGN;
        if (tier == 3) return PRICE_ASCENDANT;
        if (tier == 4) return PRICE_AI_LEGION;
        revert("SOUL: invalid tier");
    }

    // ── Required overrides ─────────────────────────────────────────────────
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable) returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC721URIStorage, IERC165) returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
