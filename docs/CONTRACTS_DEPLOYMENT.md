# ScrollVerse Trinity — Sovereign Smart Contracts

> **ALLĀHU AKBAR · KUN FAYAKŪN × ∞**
> Built by Chais Kenyatta Hill — Sabir Allah the Great / XLVIIIblocks Tech

## Contracts

| Contract | Symbol | Network | Purpose |
|---|---|---|---|
| `LONDCToken` | $LONDC | Polygon Mainnet | Sovereign ERC-20 currency — 144M supply, 2.5% Zakat burn, 7.77% Zakat distribution |
| `ZakatDistribution` | — | Polygon Mainnet | Receives 7.77% of every $LONDC transfer, distributes to Guardians + Sovereign wallet |
| `ScrollSoulNFT` | $SOUL | Polygon Mainnet | ERC-721 Guardian identity NFTs — 144,000 max supply, 7.77% royalties (EIP-2981) |

## Sovereign Wallet

All Zakat withdrawals and NFT royalties flow to:
```
0x377956c1471d9ce142df6932895839243da23a2c
```

## Frequencies

| Contract | Frequency | Meaning |
|---|---|---|
| $LONDC | 528 Hz | DNA Repair / Love Frequency |
| ZakatDistribution | 963 Hz | Crown Chakra / Divine Connection |
| ScrollSoulNFT | 432 Hz | Universal Harmony |

## Tier Pricing

| Tier | Name | $LONDC Price | MATIC Price |
|---|---|---|---|
| 1 | Guardian | 144 MATIC | $144 USD equiv |
| 2 | Sovereign | 444 MATIC | $444 USD equiv |
| 3 | Ascendant | 1,444 MATIC | $1,444 USD equiv |
| 4 | AI Legion | 777 MATIC | $777 USD equiv |

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env
# Fill in DEPLOYER_PRIVATE_KEY, POLYGON_RPC_URL, etc.

# Compile contracts
npm run compile

# Test on local Hardhat network
npm test

# Deploy to Mumbai testnet first
npm run deploy:mumbai

# Deploy to Polygon Mainnet (when ready)
npm run deploy:polygon
```

## Deployment Order

1. `ZakatDistribution` — needs sovereign wallet address
2. `LONDCToken` — needs ZakatDistribution address
3. `ScrollSoulNFT` — needs royalty receiver + base URI
4. Wire: `ZakatDistribution.setLONDCToken(londc.address)`

The deploy script handles all four steps automatically.

## After Deployment

1. Add `LONDC_CONTRACT_ADDRESS` to portal Secrets
2. Add `GUARDIAN_CONTRACT_ADDRESS` (ScrollSoulNFT) to portal Secrets
3. Verify on Polygonscan:
   ```bash
   npx hardhat verify --network polygon <LONDC_ADDRESS> "<ZAKAT_ADDRESS>"
   npx hardhat verify --network polygon <ZAKAT_ADDRESS> "<SOVEREIGN_WALLET>"
   npx hardhat verify --network polygon <SOUL_ADDRESS> "<SOVEREIGN_WALLET>" "<BASE_URI>"
   ```

## Security

- All contracts use OpenZeppelin v5 (audited)
- ReentrancyGuard on all payable functions
- Ownable with explicit owner checks
- No upgradeable proxies — immutable sovereign code
