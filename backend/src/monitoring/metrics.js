/**
 * ScrollVerse Trinity Sovereign - Prometheus Metrics
 * Real-time monitoring for payment system and platform health
 */

'use strict';

const promClient = require('prom-client');

// Enable default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics({
  prefix: 'scrollverse_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ─── Payment Metrics ──────────────────────────────────────────
const totalRevenue = new promClient.Counter({
  name: 'scrollverse_total_revenue_dollars',
  help: 'Total revenue processed in USD',
});

const successfulPayments = new promClient.Counter({
  name: 'scrollverse_payments_successful_total',
  help: 'Total number of successful payments',
});

const failedPayments = new promClient.Counter({
  name: 'scrollverse_payments_failed_total',
  help: 'Total number of failed payments',
});

const paymentFailureReasons = new promClient.Counter({
  name: 'scrollverse_payment_failure_reasons_total',
  help: 'Payment failure reasons breakdown',
  labelNames: ['reason'],
});

const refundsProcessed = new promClient.Counter({
  name: 'scrollverse_refunds_total',
  help: 'Total number of refunds processed',
});

const refundAmount = new promClient.Counter({
  name: 'scrollverse_refund_amount_dollars',
  help: 'Total refund amount in USD',
});

const disputesCreated = new promClient.Counter({
  name: 'scrollverse_disputes_total',
  help: 'Total number of disputes created',
  labelNames: ['reason'],
});

const disputeAmount = new promClient.Counter({
  name: 'scrollverse_dispute_amount_dollars',
  help: 'Total disputed amount in USD',
});

// ─── Subscription Metrics ─────────────────────────────────────
const activeSubscriptions = new promClient.Gauge({
  name: 'scrollverse_active_subscriptions',
  help: 'Current number of active subscriptions',
});

const newSubscriptions = new promClient.Counter({
  name: 'scrollverse_subscriptions_new_total',
  help: 'Total new subscriptions created',
  labelNames: ['plan'],
});

const subscriptionUpdates = new promClient.Counter({
  name: 'scrollverse_subscription_updates_total',
  help: 'Total subscription status updates',
  labelNames: ['status'],
});

// ─── Webhook Metrics ──────────────────────────────────────────
const webhookReceived = new promClient.Counter({
  name: 'scrollverse_webhooks_received_total',
  help: 'Total webhooks received from Stripe',
  labelNames: ['event'],
});

const webhookFailures = new promClient.Counter({
  name: 'scrollverse_webhooks_failed_total',
  help: 'Total webhook processing failures',
  labelNames: ['event'],
});

const webhookProcessingDuration = new promClient.Histogram({
  name: 'scrollverse_webhook_processing_duration_seconds',
  help: 'Webhook processing duration in seconds',
  labelNames: ['event'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// ─── API Metrics ──────────────────────────────────────────────
const httpRequestDuration = new promClient.Histogram({
  name: 'scrollverse_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'scrollverse_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// ─── User Metrics ─────────────────────────────────────────────
const totalUsers = new promClient.Gauge({
  name: 'scrollverse_total_users',
  help: 'Total registered users',
});

const activeUsers = new promClient.Gauge({
  name: 'scrollverse_active_users_24h',
  help: 'Active users in last 24 hours',
});

// ─── Zakat Metrics ────────────────────────────────────────────
const zakatDistributed = new promClient.Counter({
  name: 'scrollverse_zakat_distributed_dollars',
  help: 'Total Zakat distributed in USD',
});

// ─── Metrics Endpoint ─────────────────────────────────────────
const getMetricsHandler = async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
};

module.exports = {
  totalRevenue,
  successfulPayments,
  failedPayments,
  paymentFailureReasons,
  refundsProcessed,
  refundAmount,
  disputesCreated,
  disputeAmount,
  activeSubscriptions,
  newSubscriptions,
  subscriptionUpdates,
  webhookReceived,
  webhookFailures,
  webhookProcessingDuration,
  httpRequestDuration,
  httpRequestsTotal,
  totalUsers,
  activeUsers,
  zakatDistributed,
  getMetricsHandler,
  register: promClient.register,
};
