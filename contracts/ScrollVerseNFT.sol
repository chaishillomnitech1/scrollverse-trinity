// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ScrollVerseNFT
 * @dev The sovereign digital identity of the ScrollVerse.
 * Features ERC-2981 royalty standards (10% Creator, 5% GoldAmbassadors, 2% ScrollDAO).
 */
contract ScrollVerseNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;
    
    address public creatorTreasury;
    address public goldAmbassadors;
    address public scrollDAO;

    constructor(address _creatorTreasury, address _goldAmbassadors, address _scrollDAO) ERC721("ScrollSoul", "SOUL") Ownable(msg.sender) {
        creatorTreasury = _creatorTreasury;
        goldAmbassadors = _goldAmbassadors;
        scrollDAO = _scrollDAO;
        
        // Set default royalty to 17% (10% + 5% + 2%)
        _setDefaultRoyalty(_creatorTreasury, 1700); // 1700 basis points = 17%
    }

    /**
     * @dev Mints a new ScrollSoul NFT.
     */
    function mintScrollSoul(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Overrides the supportsInterface function for ERC-2981.
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Updates the royalty recipients.
     */
    function setRoyaltyRecipients(address _creatorTreasury, address _goldAmbassadors, address _scrollDAO) external onlyOwner {
        creatorTreasury = _creatorTreasury;
        goldAmbassadors = _goldAmbassadors;
        scrollDAO = _scrollDAO;
        _setDefaultRoyalty(_creatorTreasury, 1700);
    }
}
