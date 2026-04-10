// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title $LONDC — ScrollVerse Trinity Sovereign Token
 * @author Chais Kenyatta Hill — Sabir Allah the Great / XLVIIIblocks Tech
 * @notice ERC-20 sovereign currency of the ScrollVerse ecosystem.
 *         Total supply: 144,000,000 $LONDC (144M — the number of Guardians)
 *         Zakat burn: 2.5% of every transfer is burned (purification)
 *         Zakat distribution: 7.77% of every transfer routes to ZakatDistribution contract
 *         Frequency: 528Hz — DNA Repair / Love Frequency
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LONDCToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant TOTAL_SUPPLY = 144_000_000 * 10 ** 18;
    uint256 public constant ZAKAT_BURN_BPS = 250;       // 2.5%
    uint256 public constant ZAKAT_DIST_BPS = 777;       // 7.77%
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant FREQUENCY = 528;             // Hz — Love Frequency

    // ── State ──────────────────────────────────────────────────────────────
    address public zakatDistributor;
    bool public zakatEnabled = true;

    // ── Events ─────────────────────────────────────────────────────────────
    event ZakatBurned(address indexed from, uint256 amount);
    event ZakatDistributed(address indexed from, address indexed distributor, uint256 amount);
    event ZakatDistributorUpdated(address indexed oldDistributor, address indexed newDistributor);
    event ZakatToggled(bool enabled);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address _zakatDistributor) ERC20("ScrollVerse LONDC", "LONDC") Ownable(msg.sender) {
        require(_zakatDistributor != address(0), "LONDC: zero distributor address");
        zakatDistributor = _zakatDistributor;
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    // ── Override transfer with Zakat logic ─────────────────────────────────
    function _update(address from, address to, uint256 value) internal override {
        // Skip Zakat on mint/burn and when Zakat is disabled
        if (from == address(0) || to == address(0) || !zakatEnabled) {
            super._update(from, to, value);
            return;
        }

        uint256 burnAmount = (value * ZAKAT_BURN_BPS) / BPS_DENOMINATOR;
        uint256 distAmount = (value * ZAKAT_DIST_BPS) / BPS_DENOMINATOR;
        uint256 netAmount  = value - burnAmount - distAmount;

        // Burn 2.5%
        super._update(from, address(0), burnAmount);
        emit ZakatBurned(from, burnAmount);

        // Distribute 7.77% to ZakatDistributor
        super._update(from, zakatDistributor, distAmount);
        emit ZakatDistributed(from, zakatDistributor, distAmount);

        // Transfer net amount
        super._update(from, to, netAmount);
    }

    // ── Owner functions ────────────────────────────────────────────────────
    function setZakatDistributor(address _new) external onlyOwner {
        require(_new != address(0), "LONDC: zero address");
        emit ZakatDistributorUpdated(zakatDistributor, _new);
        zakatDistributor = _new;
    }

    function toggleZakat(bool _enabled) external onlyOwner {
        zakatEnabled = _enabled;
        emit ZakatToggled(_enabled);
    }

    // ── View helpers ───────────────────────────────────────────────────────
    function frequency() external pure returns (uint256) {
        return FREQUENCY;
    }

    function zakatRates() external pure returns (uint256 burnBps, uint256 distBps) {
        return (ZAKAT_BURN_BPS, ZAKAT_DIST_BPS);
    }
}
