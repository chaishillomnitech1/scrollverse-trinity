# Mailchimp Automation Reference

## Table of Contents
1. [Setup Checklist](#setup-checklist)
2. [The 9 Email Sequences](#the-9-email-sequences)
3. [Trigger Map](#trigger-map)
4. [API Integration Pattern](#api-integration-pattern)
5. [Troubleshooting](#troubleshooting)

---

## Setup Checklist

Before any email sequence can fire, confirm these 3 values are in `.env`:

| Variable | Where to Find |
|---|---|
| `MAILCHIMP_API_KEY` | Mailchimp → Account → Extras → API Keys → Create A Key |
| `MAILCHIMP_SERVER_PREFIX` | The prefix in your Mailchimp URL (e.g., `us14` from `us14.admin.mailchimp.com`) |
| `MAILCHIMP_LIST_ID` | Mailchimp → Audience → Settings → Audience name and defaults → Audience ID |

---

## The 9 Email Sequences

| Sequence Key | Trigger Event | Purpose |
|---|---|---|
| `new_subscriber_welcome` | `customer.subscription.created` | Onboarding, platform overview, next steps |
| `payment_confirmation` | `payment_intent.succeeded` | Receipt, Zakat amount distributed, billing date |
| `payment_failed` | `payment_intent.payment_failed` | Failure reason, retry URL, 7-day grace period notice |
| `zakat_distribution` | After each payment | Sacred obligation fulfilled, amount distributed |
| `referral_reward` | Referral converts | Reward amount, total referrals, referral dashboard link |
| `subscription_cancellation_scheduled` | `customer.subscription.updated` (cancel_at_period_end=true) | Win-back offer, expiry date, reactivation CTA |
| `subscription_reactivated` | `customer.subscription.updated` (cancel_at_period_end=false) | Welcome back, dashboard link |
| `subscription_past_due` | `customer.subscription.updated` (status=past_due) | Update payment method CTA |
| `refund_confirmation` | `charge.refunded` | Refund amount, processing days, support contact |

---

## Trigger Map

```
Stripe Event                    →  Email Sequence
─────────────────────────────────────────────────
payment_intent.succeeded        →  payment_confirmation + zakat_distribution
payment_intent.payment_failed   →  payment_failed
customer.subscription.created   →  new_subscriber_welcome
customer.subscription.updated   →  (conditional based on status/cancel_at_period_end)
charge.refunded                 →  refund_confirmation
```

---

## API Integration Pattern

```javascript
// Non-blocking pattern — email failure never breaks payment flow
const { triggerEmailSequence } = require('../mailchimp/mailchimpClient');

// Inside webhook handler (after DB update):
triggerEmailSequence('payment_confirmation', {
  email: customerEmail,
  name: customerName,
  amount: (amount / 100).toFixed(2),
  currency: currency.toUpperCase(),
  zakatAmount: ((amount * 0.0777) / 100).toFixed(2),
  paymentId: paymentIntentId,
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
}).catch(err => logger.error(`[Mailchimp] Non-critical: ${err.message}`));
```

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Wrong API key or server prefix | Verify `MAILCHIMP_API_KEY` and `MAILCHIMP_SERVER_PREFIX` |
| `404 Not Found` on list | Wrong List ID | Re-check Audience ID in Mailchimp settings |
| Subscriber not appearing | Email already exists with different status | Use PUT (upsert) not POST — already implemented |
| Tags not applying | Subscriber added but tag call failed silently | Check logs for `addTagsToSubscriber` errors |
