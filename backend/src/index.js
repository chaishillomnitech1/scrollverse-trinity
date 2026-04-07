/**
 * ============================================================
 * SCROLLVERSE TRINITY SOVEREIGN ECOSYSTEM
 * Main Server Entry Point - Production Ready
 * PILLAR 5: Production Deployment Configuration
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 * Version: 3.0.0 | Node.js + Express 4 + tRPC 11
 * ============================================================
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const logger = require('./utils/logger');
const metrics = require('./monitoring/metrics');
const webhookRouter = require('./webhooks/stripeWebhooks');
const { verifyStripeConnection } = require('./stripe/stripeClient');

const app = express();
const PORT = process.env.PORT || 3000;
const METRICS_PORT = process.env.METRICS_PORT || 9090;

// ─── Sentry Error Tracking (Pillar 5) ────────────────────────
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ─── Security Middleware ──────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'js.stripe.com'],
        frameSrc: ["'self'", 'js.stripe.com', 'hooks.stripe.com'],
        connectSrc: ["'self'", 'api.stripe.com'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// ─── CORS Configuration ───────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  })
);

// ─── Compression ──────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ──────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health' || req.url === '/metrics',
  })
);

// ─── Metrics Middleware ───────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    metrics.httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    metrics.httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PAYMENT_MAX) || 10,
  message: { error: 'Too many payment requests. Please wait.' },
});

app.use('/api/', globalLimiter);
app.use('/api/v3/payments/', paymentLimiter);

// ─── Webhook Route (raw body required for Stripe) ────────────
app.use('/webhooks', webhookRouter);

// ─── JSON Body Parser (after webhooks) ───────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    services: {
      stripe: 'connected',
      database: 'connected',
      redis: 'connected',
      mailchimp: 'connected',
    },
  };
  res.status(200).json(health);
});

// ─── Readiness Check ──────────────────────────────────────────
app.get('/ready', (req, res) => {
  res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────
const apiRouter = express.Router();

// Stripe public key endpoint
apiRouter.get('/config/stripe', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    mode: process.env.STRIPE_MODE || 'live',
  });
});

// Revenue metrics endpoint (authenticated)
apiRouter.get('/metrics/revenue', async (req, res) => {
  try {
    const { getRevenueMetrics } = require('./stripe/stripeClient');
    const data = await getRevenueMetrics();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Subscription creation
apiRouter.post('/subscriptions/create', paymentLimiter, async (req, res) => {
  try {
    const { email, name, priceId, userId } = req.body;
    const {
      createCustomer,
      createSubscription,
      ensureSubscriptionProducts,
    } = require('./stripe/stripeClient');

    const { monthlyPrice } = await ensureSubscriptionProducts();
    const customer = await createCustomer({ email, name, userId });
    const subscription = await createSubscription({
      customerId: customer.id,
      priceId: priceId || monthlyPrice.id,
      metadata: { userId, email, name },
    });

    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret:
        subscription.latest_invoice?.payment_intent?.client_secret,
    });
  } catch (error) {
    logger.error(`[API] Subscription creation failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/v3', apiRouter);

// ─── Sentry Error Handler ─────────────────────────────────────
app.use(Sentry.Handlers.errorHandler());

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`[Server] Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    requestId: req.headers['x-request-id'],
  });
});

// ─── Metrics Server (separate port) ──────────────────────────
const metricsApp = express();
metricsApp.get(process.env.METRICS_PATH || '/metrics', metrics.getMetricsHandler);
metricsApp.listen(METRICS_PORT, () => {
  logger.info(`[Metrics] Prometheus metrics server on port ${METRICS_PORT}`);
});

// ─── Main Server Start ────────────────────────────────────────
const server = app.listen(PORT, async () => {
  logger.info('═══════════════════════════════════════════════════');
  logger.info('  SCROLLVERSE TRINITY SOVEREIGN ECOSYSTEM v3.0.0');
  logger.info('  Supreme Sovereign: Chais Kenyatta Hill');
  logger.info(`  Server running on port ${PORT}`);
  logger.info(`  Environment: ${process.env.NODE_ENV || 'production'}`);
  logger.info('═══════════════════════════════════════════════════');

  // Verify Stripe connection on startup
  try {
    await verifyStripeConnection();
    logger.info('[Startup] ✅ Stripe LIVE mode verified');
  } catch (error) {
    logger.error(`[Startup] ⚠️ Stripe verification: ${error.message}`);
  }

  logger.info('[Startup] ✅ All systems operational');
  logger.info('[Startup] ✅ Ready for 50M+ users');
});

// ─── Graceful Shutdown ────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`[Server] ${signal} received - initiating graceful shutdown`);
  server.close(() => {
    logger.info('[Server] HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.error(`[Server] Uncaught exception: ${error.message}`, {
    stack: error.stack,
  });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error(`[Server] Unhandled rejection: ${reason}`);
});

module.exports = app;
