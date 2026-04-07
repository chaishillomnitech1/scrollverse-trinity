/**
 * ============================================================
 * SCROLLVERSE TRINITY SOVEREIGN ECOSYSTEM
 * PILLAR 1: Stripe Environment Integration
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 * Version: 3.0.0 | Mode: LIVE
 * ============================================================
 */

'use strict';

const Stripe = require('stripe');
const logger = require('../utils/logger');

// ─── Validate Required Stripe Credentials ───────────────────
const validateStripeCredentials = () => {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_ACCOUNT_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[Stripe] Missing required credentials: ${missing.join(', ')}`
    );
  }

  // Verify live mode
  if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    logger.warn('[Stripe] WARNING: Not using live mode secret key!');
  } else {
    logger.info('[Stripe] ✅ LIVE MODE CONFIRMED - Real transactions enabled');
  }
};

// ─── Initialize Stripe Client ────────────────────────────────
let stripeInstance = null;

const getStripeClient = () => {
  if (!stripeInstance) {
    validateStripeCredentials();

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      appInfo: {
        name: 'ScrollVerse Trinity Sovereign',
        version: '3.0.0',
        url: 'https://scrollverse.app',
      },
      maxNetworkRetries: 3,
      timeout: 30000,
      telemetry: false,
    });

    logger.info('[Stripe] ✅ Client initialized successfully');
    logger.info(`[Stripe] Account ID: ${process.env.STRIPE_ACCOUNT_ID}`);
    logger.info(`[Stripe] Mode: ${process.env.STRIPE_MODE || 'live'}`);
  }

  return stripeInstance;
};

// ─── Stripe Credential Verification ─────────────────────────
const verifyStripeConnection = async () => {
  try {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(
      process.env.STRIPE_ACCOUNT_ID
    );

    logger.info('[Stripe] ✅ Connection verified');
    logger.info(`[Stripe] Account: ${account.email || account.id}`);
    logger.info(`[Stripe] Country: ${account.country}`);
    logger.info(`[Stripe] Currency: ${account.default_currency}`);
    logger.info(
      `[Stripe] Charges Enabled: ${account.charges_enabled}`
    );
    logger.info(
      `[Stripe] Payouts Enabled: ${account.payouts_enabled}`
    );

    return {
      verified: true,
      accountId: account.id,
      email: account.email,
      country: account.country,
      currency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  } catch (error) {
    logger.error(`[Stripe] ❌ Connection failed: ${error.message}`);
    throw error;
  }
};

// ─── Create Subscription Product & Price ────────────────────
const ensureSubscriptionProducts = async () => {
  const stripe = getStripeClient();

  try {
    // Check/create ScrollVerse product
    let product;
    const products = await stripe.products.list({ limit: 10 });
    const existing = products.data.find(
      (p) => p.name === 'ScrollVerse Trinity Sovereign'
    );

    if (existing) {
      product = existing;
      logger.info(`[Stripe] Product exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: 'ScrollVerse Trinity Sovereign',
        description:
          'Access to the ScrollVerse Trinity Sovereign Ecosystem - 50M+ user platform',
        metadata: {
          ecosystem: 'scrollverse',
          version: '3.0.0',
          sovereign: 'Chais Kenyatta Hill',
        },
      });
      logger.info(`[Stripe] ✅ Product created: ${product.id}`);
    }

    // Monthly price ($9.99/month)
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    let monthlyPrice = prices.data.find(
      (p) =>
        p.recurring?.interval === 'month' && p.unit_amount === 999
    );

    if (!monthlyPrice) {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 999,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan: 'monthly', ecosystem: 'scrollverse' },
      });
      logger.info(`[Stripe] ✅ Monthly price created: ${monthlyPrice.id}`);
    }

    // Annual price ($99.99/year)
    let annualPrice = prices.data.find(
      (p) =>
        p.recurring?.interval === 'year' && p.unit_amount === 9999
    );

    if (!annualPrice) {
      annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 9999,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { plan: 'annual', ecosystem: 'scrollverse' },
      });
      logger.info(`[Stripe] ✅ Annual price created: ${annualPrice.id}`);
    }

    return { product, monthlyPrice, annualPrice };
  } catch (error) {
    logger.error(
      `[Stripe] ❌ Product setup failed: ${error.message}`
    );
    throw error;
  }
};

// ─── Create Customer ─────────────────────────────────────────
const createCustomer = async ({ email, name, userId, metadata = {} }) => {
  const stripe = getStripeClient();

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
      ecosystem: 'scrollverse',
      createdAt: new Date().toISOString(),
      ...metadata,
    },
  });

  logger.info(`[Stripe] ✅ Customer created: ${customer.id} (${email})`);
  return customer;
};

// ─── Create Subscription ─────────────────────────────────────
const createSubscription = async ({
  customerId,
  priceId,
  trialDays = 0,
  metadata = {},
}) => {
  const stripe = getStripeClient();

  const subscriptionData = {
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      ecosystem: 'scrollverse',
      sovereign: 'Chais Kenyatta Hill',
      ...metadata,
    },
  };

  if (trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }

  const subscription = await stripe.subscriptions.create(subscriptionData);

  logger.info(
    `[Stripe] ✅ Subscription created: ${subscription.id} for customer ${customerId}`
  );
  return subscription;
};

// ─── Create Payment Intent ───────────────────────────────────
const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  customerId,
  metadata = {},
}) => {
  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      ecosystem: 'scrollverse',
      ...metadata,
    },
  });

  logger.info(
    `[Stripe] ✅ PaymentIntent created: ${paymentIntent.id} ($${amount / 100})`
  );
  return paymentIntent;
};

// ─── Process Refund ──────────────────────────────────────────
const processRefund = async ({ chargeId, amount, reason }) => {
  const stripe = getStripeClient();

  const refund = await stripe.refunds.create({
    charge: chargeId,
    amount,
    reason: reason || 'requested_by_customer',
    metadata: { ecosystem: 'scrollverse', processedAt: new Date().toISOString() },
  });

  logger.info(
    `[Stripe] ✅ Refund processed: ${refund.id} for charge ${chargeId}`
  );
  return refund;
};

// ─── Cancel Subscription ─────────────────────────────────────
const cancelSubscription = async (subscriptionId, immediately = false) => {
  const stripe = getStripeClient();

  let subscription;
  if (immediately) {
    subscription = await stripe.subscriptions.cancel(subscriptionId);
  } else {
    subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  logger.info(
    `[Stripe] ✅ Subscription ${immediately ? 'cancelled' : 'scheduled for cancellation'}: ${subscriptionId}`
  );
  return subscription;
};

// ─── Verify Webhook Signature ────────────────────────────────
const verifyWebhookSignature = (payload, signature) => {
  const stripe = getStripeClient();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return { valid: true, event };
  } catch (error) {
    logger.error(
      `[Stripe] ❌ Webhook signature verification failed: ${error.message}`
    );
    return { valid: false, error: error.message };
  }
};

// ─── Get Revenue Metrics ─────────────────────────────────────
const getRevenueMetrics = async () => {
  const stripe = getStripeClient();

  try {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const [charges, subscriptions, customers] = await Promise.all([
      stripe.charges.list({ created: { gte: thirtyDaysAgo }, limit: 100 }),
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.customers.list({ created: { gte: thirtyDaysAgo }, limit: 100 }),
    ]);

    const totalRevenue = charges.data
      .filter((c) => c.paid && !c.refunded)
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      totalRevenueCents: totalRevenue,
      totalRevenueDollars: (totalRevenue / 100).toFixed(2),
      activeSubscriptions: subscriptions.data.length,
      newCustomers30Days: customers.data.length,
      chargesLast30Days: charges.data.length,
    };
  } catch (error) {
    logger.error(`[Stripe] ❌ Revenue metrics failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getStripeClient,
  validateStripeCredentials,
  verifyStripeConnection,
  ensureSubscriptionProducts,
  createCustomer,
  createSubscription,
  createPaymentIntent,
  processRefund,
  cancelSubscription,
  verifyWebhookSignature,
  getRevenueMetrics,
};
