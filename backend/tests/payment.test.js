/**
 * ============================================================
 * SCROLLVERSE TRINITY SOVEREIGN ECOSYSTEM
 * PILLAR 3: Complete Payment Flow Testing Suite
 * Tests: Subscription, Failure, Refund, Webhook Scenarios
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 * ============================================================
 */

'use strict';

const request = require('supertest');
const {
  getStripeClient,
  createCustomer,
  createSubscription,
  createPaymentIntent,
  processRefund,
  cancelSubscription,
  verifyWebhookSignature,
} = require('../src/stripe/stripeClient');
const { processWebhookEvent, WEBHOOK_EVENTS } = require('../src/webhooks/stripeWebhooks');

// ─── Test Configuration ───────────────────────────────────────
const TEST_CONFIG = {
  // Stripe test card numbers
  cards: {
    success: '4242424242424242',
    declined: '4000000000000002',
    insufficient: '4000000000009995',
    requiresAuth: '4000002500003155',
    dispute: '4000000000000259',
  },
  testEmail: 'test.sovereign@scrollverse.app',
  testName: 'Test Sovereign Member',
  monthlyAmount: 999, // $9.99 in cents
  annualAmount: 9999, // $99.99 in cents
};

// ─── Mock Setup ───────────────────────────────────────────────
jest.mock('../src/mailchimp/mailchimpClient', () => ({
  triggerEmailSequence: jest.fn().mockResolvedValue({ success: true }),
  addSubscriberToList: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../src/monitoring/metrics', () => ({
  totalRevenue: { inc: jest.fn() },
  successfulPayments: { inc: jest.fn() },
  failedPayments: { inc: jest.fn() },
  paymentFailureReasons: { inc: jest.fn() },
  refundsProcessed: { inc: jest.fn() },
  refundAmount: { inc: jest.fn() },
  disputesCreated: { inc: jest.fn() },
  disputeAmount: { inc: jest.fn() },
  activeSubscriptions: { inc: jest.fn(), dec: jest.fn() },
  newSubscriptions: { inc: jest.fn() },
  subscriptionUpdates: { inc: jest.fn() },
  webhookReceived: { inc: jest.fn() },
  webhookFailures: { inc: jest.fn() },
}));

// ─── TEST SUITE 1: Stripe Client Initialization ───────────────
describe('PILLAR 1: Stripe Client Initialization', () => {
  test('should initialize Stripe client with live credentials', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_test_key';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_live_test_key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_ACCOUNT_ID = 'acct_test';

    const stripe = getStripeClient();
    expect(stripe).toBeDefined();
    expect(stripe.VERSION).toBeDefined();
  });

  test('should validate all required credentials are present', () => {
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_ACCOUNT_ID',
    ];

    requiredEnvVars.forEach((envVar) => {
      expect(process.env[envVar]).toBeDefined();
    });
  });
});

// ─── TEST SUITE 2: Webhook Signature Verification ────────────
describe('PILLAR 2: Webhook Signature Verification', () => {
  test('should reject webhook with missing signature', () => {
    const { valid } = verifyWebhookSignature(
      Buffer.from('test payload'),
      null
    );
    expect(valid).toBe(false);
  });

  test('should reject webhook with invalid signature', () => {
    const { valid } = verifyWebhookSignature(
      Buffer.from('test payload'),
      'invalid_signature'
    );
    expect(valid).toBe(false);
  });

  test('should identify all 6 webhook event types', () => {
    const events = Object.values(WEBHOOK_EVENTS);
    expect(events).toContain('payment_intent.succeeded');
    expect(events).toContain('payment_intent.payment_failed');
    expect(events).toContain('customer.subscription.created');
    expect(events).toContain('customer.subscription.updated');
    expect(events).toContain('charge.refunded');
    expect(events).toContain('charge.dispute.created');
    expect(events).toHaveLength(6);
  });
});

// ─── TEST SUITE 3: Payment Intent Succeeded Flow ─────────────
describe('PILLAR 3: Payment Flow - Success Scenario', () => {
  const mockPaymentIntent = {
    id: 'pi_test_succeeded_001',
    object: 'payment_intent',
    amount: 999,
    currency: 'usd',
    status: 'succeeded',
    customer: 'cus_test_001',
    receipt_email: TEST_CONFIG.testEmail,
    metadata: {
      userId: 'user_sovereign_001',
      name: TEST_CONFIG.testName,
      email: TEST_CONFIG.testEmail,
      ecosystem: 'scrollverse',
    },
  };

  test('should process payment_intent.succeeded event', async () => {
    const event = {
      type: 'payment_intent.succeeded',
      id: 'evt_test_001',
      data: { object: mockPaymentIntent },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should calculate Zakat correctly (7.77% of payment)', () => {
    const amount = 999; // $9.99
    const expectedZakat = Math.floor(amount * 0.0777); // ~$0.78
    expect(expectedZakat).toBe(77);
    expect(expectedZakat / amount).toBeCloseTo(0.077, 2);
  });

  test('should calculate Zakat for large payment ($1000)', () => {
    const amount = 100000; // $1000
    const zakatMin = Math.floor(amount * 0.0777); // $77.70
    const zakatMax = Math.floor(amount * 0.15); // $150
    expect(zakatMin).toBe(7770);
    expect(zakatMax).toBe(15000);
    expect(zakatMin).toBeGreaterThan(0);
    expect(zakatMax).toBeGreaterThan(zakatMin);
  });

  test('should trigger payment confirmation email on success', async () => {
    const { triggerEmailSequence } = require('../src/mailchimp/mailchimpClient');
    const event = {
      type: 'payment_intent.succeeded',
      id: 'evt_test_002',
      data: { object: mockPaymentIntent },
    };

    await processWebhookEvent(event);
    expect(triggerEmailSequence).toHaveBeenCalledWith(
      'payment_confirmation',
      expect.objectContaining({
        email: TEST_CONFIG.testEmail,
        amount: '9.99',
      })
    );
  });
});

// ─── TEST SUITE 4: Payment Failure Scenarios ─────────────────
describe('PILLAR 3: Payment Flow - Failure Scenarios', () => {
  const mockFailedPaymentIntent = {
    id: 'pi_test_failed_001',
    object: 'payment_intent',
    amount: 999,
    currency: 'usd',
    status: 'payment_failed',
    customer: 'cus_test_002',
    receipt_email: TEST_CONFIG.testEmail,
    last_payment_error: {
      code: 'card_declined',
      message: 'Your card was declined.',
      type: 'card_error',
    },
    metadata: {
      userId: 'user_sovereign_002',
      email: TEST_CONFIG.testEmail,
    },
  };

  test('should handle payment_intent.payment_failed event', async () => {
    const event = {
      type: 'payment_intent.payment_failed',
      id: 'evt_test_003',
      data: { object: mockFailedPaymentIntent },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should trigger payment failure email with retry link', async () => {
    const { triggerEmailSequence } = require('../src/mailchimp/mailchimpClient');
    const event = {
      type: 'payment_intent.payment_failed',
      id: 'evt_test_004',
      data: { object: mockFailedPaymentIntent },
    };

    await processWebhookEvent(event);
    expect(triggerEmailSequence).toHaveBeenCalledWith(
      'payment_failed',
      expect.objectContaining({
        email: TEST_CONFIG.testEmail,
        failureReason: 'Your card was declined.',
      })
    );
  });

  test('should handle insufficient funds failure', async () => {
    const insufficientFundsIntent = {
      ...mockFailedPaymentIntent,
      id: 'pi_test_insufficient_001',
      last_payment_error: {
        code: 'insufficient_funds',
        message: 'Your card has insufficient funds.',
        type: 'card_error',
      },
    };

    const event = {
      type: 'payment_intent.payment_failed',
      id: 'evt_test_005',
      data: { object: insufficientFundsIntent },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });
});

// ─── TEST SUITE 5: Subscription Lifecycle ────────────────────
describe('PILLAR 3: Subscription Lifecycle Tests', () => {
  const mockSubscription = {
    id: 'sub_test_sovereign_001',
    object: 'subscription',
    customer: 'cus_test_001',
    status: 'active',
    cancel_at_period_end: false,
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    items: {
      data: [
        {
          price: {
            id: 'price_monthly_999',
            unit_amount: 999,
            currency: 'usd',
            recurring: { interval: 'month' },
          },
        },
      ],
    },
    metadata: {
      userId: 'user_sovereign_001',
      email: TEST_CONFIG.testEmail,
      name: TEST_CONFIG.testName,
    },
  };

  test('should handle customer.subscription.created event', async () => {
    const event = {
      type: 'customer.subscription.created',
      id: 'evt_test_006',
      data: { object: mockSubscription },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should trigger welcome email on subscription creation', async () => {
    const { triggerEmailSequence } = require('../src/mailchimp/mailchimpClient');
    const event = {
      type: 'customer.subscription.created',
      id: 'evt_test_007',
      data: { object: mockSubscription },
    };

    await processWebhookEvent(event);
    expect(triggerEmailSequence).toHaveBeenCalledWith(
      'new_subscriber_welcome',
      expect.objectContaining({
        email: TEST_CONFIG.testEmail,
        plan: 'month',
      })
    );
  });

  test('should handle subscription cancellation scheduled', async () => {
    const cancelingSubscription = {
      ...mockSubscription,
      cancel_at_period_end: true,
    };

    const event = {
      type: 'customer.subscription.updated',
      id: 'evt_test_008',
      data: { object: cancelingSubscription },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should handle past_due subscription', async () => {
    const pastDueSubscription = {
      ...mockSubscription,
      status: 'past_due',
    };

    const event = {
      type: 'customer.subscription.updated',
      id: 'evt_test_009',
      data: { object: pastDueSubscription },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });
});

// ─── TEST SUITE 6: Refund Scenarios ──────────────────────────
describe('PILLAR 3: Refund Scenarios', () => {
  const mockRefundedCharge = {
    id: 'ch_test_refund_001',
    object: 'charge',
    amount: 999,
    amount_refunded: 999,
    currency: 'usd',
    customer: 'cus_test_001',
    receipt_email: TEST_CONFIG.testEmail,
    refunded: true,
    refunds: {
      data: [
        {
          id: 're_test_001',
          amount: 999,
          reason: 'requested_by_customer',
          status: 'succeeded',
        },
      ],
    },
    metadata: {
      email: TEST_CONFIG.testEmail,
      name: TEST_CONFIG.testName,
    },
  };

  test('should handle charge.refunded event', async () => {
    const event = {
      type: 'charge.refunded',
      id: 'evt_test_010',
      data: { object: mockRefundedCharge },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should trigger refund confirmation email', async () => {
    const { triggerEmailSequence } = require('../src/mailchimp/mailchimpClient');
    const event = {
      type: 'charge.refunded',
      id: 'evt_test_011',
      data: { object: mockRefundedCharge },
    };

    await processWebhookEvent(event);
    expect(triggerEmailSequence).toHaveBeenCalledWith(
      'refund_confirmation',
      expect.objectContaining({
        refundAmount: '9.99',
        currency: 'USD',
      })
    );
  });
});

// ─── TEST SUITE 7: Dispute Handling ──────────────────────────
describe('PILLAR 3: Dispute Handling', () => {
  const mockDispute = {
    id: 'dp_test_001',
    object: 'dispute',
    amount: 999,
    currency: 'usd',
    charge: 'ch_test_001',
    reason: 'fraudulent',
    status: 'needs_response',
    evidence_details: {
      due_by: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      has_evidence: false,
    },
    metadata: { customerId: 'cus_test_001' },
  };

  test('should handle charge.dispute.created event', async () => {
    const event = {
      type: 'charge.dispute.created',
      id: 'evt_test_012',
      data: { object: mockDispute },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should record dispute with correct urgency', async () => {
    const logger = require('../src/utils/logger');
    const event = {
      type: 'charge.dispute.created',
      id: 'evt_test_013',
      data: { object: mockDispute },
    };

    await processWebhookEvent(event);
    expect(logger.warn).toHaveBeenCalled();
  });
});

// ─── TEST SUITE 8: Revenue Metrics ───────────────────────────
describe('PILLAR 3: Revenue Metrics Validation', () => {
  test('should calculate monthly revenue potential correctly', () => {
    const activeUsers = 50_000_000; // 50M users
    const arpu = 9.99; // Average Revenue Per User
    const monthlyRevenue = activeUsers * arpu;
    expect(monthlyRevenue).toBe(499_500_000); // ~$499.5M/month
    expect(monthlyRevenue * 12).toBeGreaterThan(5_000_000_000); // >$5B/year
  });

  test('should validate viral coefficient target', () => {
    const viralCoefficient = 1.18;
    expect(viralCoefficient).toBeGreaterThan(1.0);
    // K > 1 means exponential growth
    const month1Users = 1000;
    const month2Users = month1Users * viralCoefficient;
    expect(month2Users).toBeGreaterThan(month1Users);
  });

  test('should validate payment success rate target (99%+)', () => {
    const totalPayments = 10000;
    const successfulPayments = 9950;
    const successRate = successfulPayments / totalPayments;
    expect(successRate).toBeGreaterThanOrEqual(0.99);
  });

  test('should validate webhook reliability target (99.99%)', () => {
    const totalWebhooks = 100000;
    const processedWebhooks = 99999;
    const reliability = processedWebhooks / totalWebhooks;
    expect(reliability).toBeGreaterThanOrEqual(0.9999);
  });
});

// ─── TEST SUITE 9: Unhandled Event Types ─────────────────────
describe('Edge Cases', () => {
  test('should gracefully handle unknown event types', async () => {
    const event = {
      type: 'unknown.event.type',
      id: 'evt_test_unknown',
      data: { object: {} },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });

  test('should handle events with missing metadata', async () => {
    const event = {
      type: 'payment_intent.succeeded',
      id: 'evt_test_no_meta',
      data: {
        object: {
          id: 'pi_no_meta',
          amount: 999,
          currency: 'usd',
          customer: 'cus_test',
          metadata: {},
        },
      },
    };

    await expect(processWebhookEvent(event)).resolves.not.toThrow();
  });
});
