# Stripe Webhook Configuration Guide
## ScrollVerse Trinity Sovereign Ecosystem v3.0.0

**Author:** Manus AI — Built for Supreme Sovereign Chais Kenyatta Hill
**Version:** 3.0.0 | **Date:** April 2026

---

## What Webhooks Are and Why They Matter

Stripe webhooks are real-time HTTP notifications that Stripe sends to your server whenever a payment event occurs. Without webhooks, your server has no way of knowing when a payment succeeds, a subscription renews, or a dispute is filed — it would have to constantly poll the Stripe API, which is slow, expensive, and unreliable.

With webhooks properly configured, your ScrollVerse backend reacts instantly to every financial event: activating subscriptions the moment payment clears, sending confirmation emails within seconds, distributing the 7.77% Zakat automatically, and alerting your team the moment a dispute is opened. This is the nervous system of the entire payment ecosystem.

---

## Part 1: Event Selection

The ScrollVerse ecosystem is configured to handle exactly 6 Stripe events. Each one maps to a specific business action.

| Event | When It Fires | Business Action |
|---|---|---|
| `payment_intent.succeeded` | Payment is captured and funds secured | Activate subscription, send receipt, distribute Zakat (7.77%), update revenue metrics |
| `payment_intent.payment_failed` | Card declined or payment fails | Send failure email with retry URL, log failure reason, start 7-day grace period |
| `customer.subscription.created` | New subscriber completes checkout | Create user record in database, trigger welcome email sequence, add to Mailchimp audience |
| `customer.subscription.updated` | Subscription status changes (renewal, cancellation, past due) | Update user record, send appropriate email based on new status |
| `charge.refunded` | Refund is issued | Update revenue metrics, send refund confirmation email, log refund reason |
| `charge.dispute.created` | Customer files a chargeback | Alert operations team immediately, freeze account pending review, log dispute evidence |

### Why These 6 and Not Others

Stripe offers over 200 event types. These 6 cover the complete lifecycle of a subscription payment: acquisition, retention, failure recovery, and dispute resolution. Adding more events without corresponding handlers creates noise and potential processing errors. The ScrollVerse architecture is designed for precision — every event that enters the webhook handler has a defined, tested response.

---

## Part 2: Registering the Webhook Endpoint

### Step-by-Step: Stripe Dashboard Registration

**1. Log in to the Stripe Dashboard**
Navigate to [dashboard.stripe.com](https://dashboard.stripe.com) and ensure you are in **Live Mode** by checking the toggle in the top-left corner. The toggle must show "Live" — not "Test."

**2. Navigate to Webhooks**
Go to **Developers** (top navigation) → **Webhooks** → click **Add an endpoint**.

**3. Enter the Endpoint URL**
```
https://api.scrollverse.app/webhooks/stripe
```
This is the route registered in `backend/src/index.js` that routes to the webhook handler in `backend/src/webhooks/stripeWebhooks.js`.

**4. Select Events**
Click **Select events** and search for and add each of the 6 events listed above. The search field accepts partial matches — searching "payment_intent" will show both payment intent events simultaneously.

**5. Save and Retrieve the Signing Secret**
After clicking **Add endpoint**, Stripe will display your new endpoint. Click **Reveal** under the **Signing secret** section. This value begins with `whsec_` and is unique to this endpoint. Copy it immediately.

**6. Update Your Environment**
Open `backend/.env` on your production server and set:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET_HERE
```

> **Critical:** The signing secret in your `.env` must match the one shown in the Stripe Dashboard for this specific endpoint. If they do not match, every webhook will be rejected with a signature verification error.

---

## Part 3: How Signature Verification Works

Every webhook request Stripe sends includes a `Stripe-Signature` header. This header contains a timestamp and a hash-based message authentication code (HMAC) computed using your webhook signing secret. Your server recomputes this HMAC from the raw request body and the signing secret, then compares it to the value in the header.

This verification serves two purposes. First, it confirms the request genuinely came from Stripe and was not forged by a third party. Second, the timestamp component prevents replay attacks — if someone captures a legitimate webhook and resends it hours later, the timestamp check will reject it.

The ScrollVerse webhook handler performs this verification as the very first action:

```javascript
// From backend/src/webhooks/stripeWebhooks.js
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,                          // Must be raw Buffer, not parsed JSON
  sig,
  process.env.STRIPE_WEBHOOK_SECRET     // Your whsec_... value
);
```

### The Raw Body Requirement

This is the single most common source of webhook errors. Stripe's signature is computed against the **raw, unparsed request body** — the exact bytes Stripe sent. If Express parses the body into a JavaScript object first (which `express.json()` does), the raw bytes are lost and the signature check will always fail.

The `backend/src/index.js` file handles this correctly by applying `express.raw()` exclusively to the webhook route **before** `express.json()` is applied to all other routes:

```javascript
// Webhook route gets raw body — MUST come before express.json()
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

// All other routes get parsed JSON
app.use(express.json());
```

---

## Part 4: Testing Procedures

### Local Testing with the Stripe CLI

The Stripe CLI is the fastest way to test webhooks during development. It creates a secure tunnel from Stripe's servers to your local machine and forwards events in real time.

**Installation:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl -s https://packages.stripe.dev/api/stable/stripe-cli-linux-x86.tar.gz | tar -xz
sudo mv stripe /usr/local/bin/

# Windows (via Scoop)
scoop install stripe
```

**Authentication and Forwarding:**
```bash
# Authenticate with your Stripe account
stripe login

# Start forwarding to your local server
stripe listen --forward-to localhost:3000/webhooks/stripe
```

The CLI will output a **test webhook signing secret** that begins with `whsec_test_`. Set this as your `STRIPE_WEBHOOK_SECRET` in your local `.env` file while testing — it is different from your production secret.

**Triggering Test Events:**
```bash
# Test a successful payment
stripe trigger payment_intent.succeeded

# Test a failed payment
stripe trigger payment_intent.payment_failed

# Test subscription creation
stripe trigger customer.subscription.created

# Test a refund
stripe trigger charge.refunded

# Test a dispute
stripe trigger charge.dispute.created
```

Each trigger sends a realistic test event to your local server. Watch your server logs to confirm the event was received, verified, and processed correctly.

### Verifying Handler Responses

A correctly functioning webhook handler will produce log output similar to:

```
[INFO] Webhook received: payment_intent.succeeded
[INFO] Payment succeeded: pi_3REAmRFKoPayn2e0_test_xxx | Amount: $9.99 | Customer: cus_xxx
[INFO] Subscription activated for customer: cus_xxx
[INFO] Mailchimp: payment_confirmation email queued for user@example.com
[INFO] Zakat distributed: $0.78 (7.77% of $9.99)
[INFO] Prometheus metrics updated: stripe_payment_success_total +1
[INFO] Webhook processed successfully in 47ms
```

If you see a `400` response or `Webhook signature verification failed`, the most likely causes are a mismatch between the signing secret in `.env` and the one Stripe is using, or the raw body middleware not being applied correctly.

### Dashboard Testing (Production Verification)

After deploying to production, verify the endpoint is receiving events correctly:

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click your production endpoint URL
3. Click **Send test webhook**
4. Select `payment_intent.succeeded` and click **Send test webhook**
5. Check the **Attempts** tab — a green `200` response confirms the endpoint is live and processing correctly

The **Attempts** tab also shows the full request and response body for every webhook delivery, which is invaluable for debugging production issues.

---

## Part 5: Idempotency and Retry Handling

Stripe retries failed webhooks up to 3 times over 24 hours using exponential backoff. This means your handler may receive the same event multiple times. The ScrollVerse architecture handles this with Redis-based idempotency keys:

```javascript
// Check if this event has already been processed
const alreadyProcessed = await redis.get(`webhook:processed:${event.id}`);
if (alreadyProcessed) {
  return res.json({ received: true, status: 'already_processed' });
}

// Process the event...

// Mark as processed with 24-hour TTL
await redis.setex(`webhook:processed:${event.id}`, 86400, '1');
```

This pattern ensures that even if Stripe delivers the same `payment_intent.succeeded` event three times, the subscription is only activated once, the email is only sent once, and the Zakat is only distributed once.

---

## Part 6: Monitoring Webhook Health

The Prometheus metrics module tracks webhook performance in real time. Key metrics to monitor:

| Metric | Description | Alert If |
|---|---|---|
| `webhook_events_total` | Total events received by type | Drops to 0 unexpectedly |
| `webhook_processing_duration_seconds` | Time to process each event | p99 exceeds 2 seconds |
| `webhook_errors_total` | Failed webhook processing attempts | Any value above 0 |
| `stripe_payment_success_total` | Successful payments processed | Rate drops below 95% |

Access the Grafana dashboard at `http://your-server:3001` to view these metrics in real time. The Prometheus scrape configuration in `infrastructure/prometheus/prometheus.yml` is pre-configured to collect all webhook metrics automatically.

---

## Part 7: Security Checklist

Before going live, verify every item in this checklist:

| Check | Status |
|---|---|
| `STRIPE_WEBHOOK_SECRET` set to production `whsec_` value (not test) | Required |
| Webhook endpoint uses HTTPS in production | Required |
| `express.raw()` applied before `express.json()` for webhook route | Required |
| Idempotency key check implemented before processing | Required |
| All handler logic wrapped in try/catch — always returns 200 | Required |
| Webhook endpoint not behind authentication middleware | Required |
| Stripe IP allowlisting configured in Nginx (optional but recommended) | Recommended |
| Webhook processing time monitored via Prometheus | Recommended |

---

## Summary

Stripe webhooks are the real-time bridge between Stripe's payment infrastructure and the ScrollVerse sovereign ecosystem. With 6 precisely chosen events, cryptographic signature verification, Redis-based idempotency, and Prometheus monitoring, the ScrollVerse webhook system is architected to process payments reliably at any scale — from the first subscriber to 50 million.

Every payment that flows through this system automatically activates a subscription, triggers a confirmation email, distributes the 7.77% Zakat, and updates the revenue dashboard — all within milliseconds, all verified, all monitored, all sovereign.
