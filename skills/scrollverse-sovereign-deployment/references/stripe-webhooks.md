# Stripe Webhook Reference

## Table of Contents
1. [The 6 Core Events](#the-6-core-events)
2. [Handler Pattern](#handler-pattern)
3. [Signature Verification](#signature-verification)
4. [Testing Procedures](#testing-procedures)
5. [Common Errors](#common-errors)

---

## The 6 Core Events

| Event | Trigger | Action Required |
|---|---|---|
| `payment_intent.succeeded` | Payment captured | Activate subscription, send confirmation email, distribute Zakat |
| `payment_intent.payment_failed` | Payment declined | Send failure email with retry URL, log failure reason |
| `customer.subscription.created` | New subscriber | Create user record, send welcome sequence, add to Mailchimp |
| `customer.subscription.updated` | Plan change or renewal | Update user record, handle cancellation scheduling |
| `charge.refunded` | Refund issued | Update revenue metrics, send refund confirmation email |
| `charge.dispute.created` | Chargeback opened | Alert team, freeze account, log dispute evidence |

---

## Handler Pattern

Every webhook handler MUST follow this exact pattern:

```javascript
case 'event.name': {
  const object = event.data.object;
  // 1. Extract metadata
  // 2. Update database
  // 3. Trigger email sequence (non-blocking, wrapped in try/catch)
  // 4. Update Prometheus metrics
  // 5. Return { received: true }
}
```

**Critical rules:**
- Always return HTTP 200 immediately after signature verification — Stripe retries on any non-2xx response
- Process business logic asynchronously after acknowledging receipt
- Use idempotency keys to prevent duplicate processing on retries
- Wrap all email/Mailchimp calls in try/catch — email failure must never break payment flow

---

## Signature Verification

```javascript
// MUST use raw body — not parsed JSON
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,          // Buffer, not string
  sig,
  process.env.STRIPE_WEBHOOK_SECRET  // whsec_...
);
```

**Express setup for raw body:**
```javascript
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
// All other routes use express.json() AFTER this line
```

---

## Testing Procedures

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger specific events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger charge.refunded
stripe trigger charge.dispute.created
```

### Dashboard Testing (Production)

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click your endpoint URL
3. Click **Send test webhook**
4. Select event type and click **Send test webhook**
5. Check the **Attempts** tab for response details

### Verify Signature in Test Mode

Use `whsec_` secret from the Stripe CLI output (different from Dashboard secret):
```
> Ready! Using webhook signing secret 'whsec_test_...' (^C to quit)
```

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `No signatures found matching the expected signature` | Using parsed JSON body instead of raw | Use `express.raw()` before webhook route |
| `Webhook signature verification failed` | Wrong `STRIPE_WEBHOOK_SECRET` | Use CLI secret for local, Dashboard secret for production |
| `400 Bad Request` on retry | Handler threw an error | Wrap all logic in try/catch, always return 200 |
| Duplicate event processing | Stripe retried after timeout | Check `event.id` against database before processing |
