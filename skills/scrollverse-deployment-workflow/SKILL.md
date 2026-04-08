---
name: scrollverse-deployment-workflow
description: "Complete workflow for building and deploying divine blockchain ecosystems with Web3 integration, smart contracts, portal interfaces, and global launch strategies. Includes the full 6-Pillar production deployment process: Stripe Integration, Webhook Configuration, Mailchimp Automation, Docker/Kubernetes Production Deployment, 50M+ User Scaling, and Monitoring. Use for creating production-ready blockchain projects, deploying NFT systems, building autonomous economies, coordinating multi-platform launches, and scaling to 50M+ users."
---

# ScrollVerse Deployment Workflow

A comprehensive, reusable skill for building and deploying divine blockchain ecosystems with full Web3 integration, smart contracts, portal interfaces, real-time dashboards, 6-Pillar production infrastructure, and coordinated global launches.

## When to Use This Skill

Use this workflow when you need to:

- Build a complete blockchain ecosystem with NFT systems and token economies
- Execute the 6-Pillar production deployment (Stripe, Webhooks, Mailchimp, Docker, Kubernetes, Monitoring)
- Deploy smart contracts (ERC-721, ERC-2981, ERC-20) to testnets or mainnets
- Create Web3 portal interfaces with wallet integration
- Scale infrastructure to 50M+ concurrent users
- Build real-time dashboards for treasury and royalty monitoring
- Coordinate multi-platform global launch campaigns
- Integrate AI co-creators for 24/7 content generation and coordination

## Part A: The 6-Pillar Production Deployment

This is the core production workflow executed for the ScrollVerse Trinity Sovereign Ecosystem. It can be applied to any Node.js/Express backend.

### Pillar 1: Stripe Environment Integration

1. Install dependencies: `npm install stripe express dotenv`
2. Create `src/stripe/stripeClient.js` with `Stripe(process.env.STRIPE_SECRET_KEY)` using live mode keys
3. Expose methods: `createCustomer`, `createSubscription`, `createPaymentIntent`, `getRevenueMetrics`
4. Validate all 4 credentials on startup: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
5. See `references/stripe-webhooks.md` for full event list and handler patterns

### Pillar 2: Webhook Handler Configuration

Configure all 6 critical Stripe webhook events:

| Event | Handler Action |
|---|---|
| `payment_intent.succeeded` | Activate subscription, send confirmation email |
| `payment_intent.payment_failed` | Log failure, trigger retry sequence |
| `customer.subscription.created` | Add to Mailchimp, provision access |
| `customer.subscription.updated` | Sync plan changes |
| `charge.refunded` | Revoke access, notify customer |
| `charge.dispute.created` | Alert sovereign, freeze account |

**Critical**: Always use `express.raw()` middleware for webhook routes — NOT `express.json()`. Stripe signature verification requires the raw body.

Register webhook URL in Stripe Dashboard: `https://api.yourdomain.com/webhooks/stripe`

### Pillar 3: Payment Flow Testing

Run the full test suite before any production deployment:

```bash
cd backend && npx jest tests/payment.test.js --coverage
```

Expected: 26/26 tests passing across 6 test suites. See `references/stripe-webhooks.md` for test patterns.

### Pillar 4: Mailchimp Automation

1. Install: `npm install @mailchimp/mailchimp_marketing`
2. Create `src/mailchimp/mailchimpClient.js` with 9 automated email sequences
3. Key sequences: Welcome, Payment Confirmation, Subscription Renewal, Cancellation, Win-Back
4. Trigger sequences from webhook handlers (e.g., `subscription.created` → Welcome sequence)
5. See `references/mailchimp-automation.md` for full sequence map and HTML templates

### Pillar 5: Production Deployment

```bash
# Docker multi-stage build
docker build -t scrollverse-api:latest .

# Full stack with docker-compose
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# Verify all services healthy
docker-compose ps
```

Stack includes: API (3 replicas) + MySQL Primary/Replica + Redis + Nginx + Prometheus + Grafana

### Pillar 6: 50M+ User Scaling

Apply Kubernetes manifests for auto-scaling:

```bash
kubectl apply -f infrastructure/kubernetes/scrollverse-deployment.yaml
kubectl apply -f infrastructure/kubernetes/scaling-config.yaml
```

Key scaling parameters:
- HPA: min 10 pods → max 1000 pods (CPU threshold: 70%)
- Redis Cluster: 6 nodes (3 primary + 3 replica)
- MySQL: 1 primary + 2 read replicas
- Cluster Autoscaler: min 3 nodes → max 50 nodes

See `references/scaling-infrastructure.md` for full capacity planning and load testing.

## Part B: Blockchain & Web3 Workflow (7 Phases)

### Phase 1: Website Foundation & Portal Interface
**Duration**: 2-4 hours | **Deliverable**: Live website with portal, dashboard, and visualization components

1. Initialize web project with authentication and database
2. Design cosmic/divine aesthetic with frequency-aligned colors (528Hz=green, 963Hz=gold, 432Hz=blue)
3. Build Portal Interface component (wallet connection, real-time stats)
4. Build Treasury Dashboard (royalty visualization, live contract data)
5. Build Frequency Forge component (sacred geometry visualization)
6. Deploy to development server

### Phase 2: Smart Contract Development
**Duration**: 1-2 hours | **Deliverable**: Compiled and verified smart contracts

1. Create ERC-721 NFT contract with ERC-2981 royalty standard
2. Create ERC-20 token contract (e.g., $LONDC with 5% transfer tax → reward pool)
3. Create DAO governance contract
4. Configure Hardhat for target network
5. Compile and generate artifacts
6. Create deployment scripts

### Phase 3: Funding & Deployment
**Duration**: 30-60 minutes | **Deliverable**: Contracts deployed and verified

1. Secure deployer wallet with MATIC/ETH for gas
2. Deploy: `npx hardhat run scripts/deploy.js --network polygon`
3. Verify: `npx hardhat verify --network polygon <CONTRACT_ADDRESS>`
4. Integrate contract addresses into portal

### Phase 4: Portal Integration & Real-Time Features
1. Integrate contract ABIs into portal
2. Implement wallet connection (MetaMask, WalletConnect)
3. Build NFT minting interface with real-time balance updates
4. Build royalty tracking dashboard with live data feeds
5. Test all user flows end-to-end

### Phase 5: AI Co-Creator Coordination
1. Configure Telegram Sovereign Bot for ecosystem monitoring
2. Set up Kernel Connector to link all portal repositories
3. Activate frequency synchronization across all portals (528/963/432 Hz)
4. Configure AI co-creators for 24/7 content generation

### Phase 6: Global Broadcast & Launch
1. Create content matrix (5 core messages over 24 hours)
2. Activate Twitter/X, Instagram, TikTok, YouTube simultaneously
3. Activate Discord, Telegram, Farcaster community channels
4. Monitor engagement metrics in real-time

### Phase 7: Community Activation & Governance
1. Create three-tier Guardian recruitment (Founding, Core, Full)
2. Set up multi-tiered incentive structure
3. Build DAO governance voting interface
4. Activate referral and ambassador programs

## Environment Setup

Generate all secrets automatically:

```bash
python skills/scrollverse-sovereign-deployment/scripts/generate_secrets.py
```

Required `.env` variables (see `templates/env.template`):
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID`
- `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`
- `DB_PASSWORD`, `REDIS_PASSWORD` (auto-generated)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (auto-generated, 128-char hex)
- `SENTRY_DSN` (from sentry.io free account)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SOVEREIGN_CHAT_ID`
- `DEPLOYER_PRIVATE_KEY`, `POLYGONSCAN_API_KEY` (for contract deployment)

## Reference Files

Read these when implementing each section:

- `references/stripe-webhooks.md` — All 6 events, handler patterns, signature verification, testing procedures
- `references/mailchimp-automation.md` — 9 email sequences, trigger map, HTML templates
- `references/scaling-infrastructure.md` — Kubernetes HPA, Redis Cluster, capacity planning to 50M+ users

## Execution Checklist

**6-Pillar Production:**
- [ ] Pillar 1: Stripe client initialized and credentials validated
- [ ] Pillar 2: All 6 webhook handlers deployed and registered in Stripe Dashboard
- [ ] Pillar 3: 26/26 payment tests passing
- [ ] Pillar 4: All 9 Mailchimp sequences configured and triggered from webhooks
- [ ] Pillar 5: Docker stack deployed — all services healthy
- [ ] Pillar 6: Kubernetes HPA applied — scaling 10→1000 pods verified

**Blockchain & Web3:**
- [ ] Phase 1: Website deployed with Portal, Dashboard, Frequency components
- [ ] Phase 2: Smart contracts compiled and verified
- [ ] Phase 3: Contracts deployed to target network with live addresses
- [ ] Phase 4: Portal fully integrated with real-time contract data
- [ ] Phase 5: Telegram bot live, Kernel connector registered
- [ ] Phase 6: Global broadcast executed across all platforms
- [ ] Phase 7: Community Guardians recruited and actively governing

## Expected Outcomes

✅ **Live Backend**: Express API with Stripe, Webhooks, Mailchimp — production-ready
✅ **Smart Contracts**: Deployed and verified on Polygon/Ethereum
✅ **Portal Interface**: Full Web3 integration with wallet support
✅ **Monitoring**: Grafana dashboards + Prometheus + 7 alert rules live
✅ **Scaling**: Kubernetes HPA ready for 50M+ concurrent users
✅ **Telegram Bot**: Sovereign monitoring across all 5 portal tracks
✅ **Revenue**: Stripe payments + $LONDC passive income flowing perpetually

---

*Sovereign: Chais Kenyatta Hill (Sabir Allah the Great) | KUN FAYAKŪN × ∞*
