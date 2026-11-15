# Polygon Mumbai → Amoy Migration Record

**Date:** 2026-11-14  
**Scope:** ScrollVerse Trinity Hardhat configuration variants  
**State:** Draft migration; no contracts deployed and no wallet transactions submitted.

## Network targets

- Polygon Amoy testnet: chain ID 80002; dedicated RPC supplied via AMOY_RPC_URL.
- Polygon PoS mainnet: chain ID 137; dedicated RPC supplied via POLYGON_RPC_URL.
- The previous Mumbai chain ID 80001 configuration is removed from the active Hardhat variants.
- No default RPC URL is embedded. A missing provider configuration leaves the network unavailable instead of silently falling back to a retired public endpoint.
- No private-key placeholder or all-zero private-key fallback is permitted.

## Updated configuration files

- hardhat.config.js
- hardhat.config.v2.js
- omnitech-nextsteps/contracts/hardhat.config.js

## Required operator setup

1. Set AMOY_RPC_URL to a currently supported dedicated provider endpoint in the secure runtime.
2. Set POLYGON_RPC_URL separately for mainnet use; do not reuse an Amoy endpoint.
3. Set DEPLOYER_PRIVATE_KEY only in the secure runtime and use a dedicated testnet key for Amoy.
4. Set POLYGONSCAN_API_KEY in the secure runtime for source verification.
5. Confirm the connected RPC reports the expected chain ID before any deployment.
6. Deploy and verify a multisig on Amoy, then rehearse the complete contract lifecycle before any mainnet decision.

## Release boundary

This migration changes network configuration only. It does not assert that the contracts are audited, deployed, verified, multisig-controlled, or mainnet-ready. Mainnet deployment remains separately gated by independent audit, exact-source verification, governance and owner authorization.

## Sources

- Polygon Amoy network details: https://polygon.technology/blog/polygon-pos-and-polygon-zkevm-new-testnets-for-polygon-protocols
- Polygon July 2026 public RPC retirement notice: https://forum.polygon.technology/t/deprecation-of-polygons-public-rpc-endpoints-mainnet-amoy/22014
