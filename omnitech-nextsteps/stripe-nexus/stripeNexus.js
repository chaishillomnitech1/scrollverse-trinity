/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   Stripe Nexus Integration                                          ║
 * ║   ScrollSoul Sovereignty / OmniTech Ecosystem                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' }); // Load environment variables from the root .env file

class StripeNexus {
  constructor(config = {}) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    this.kernelConnector = config.kernelConnector; // Reference to the Kernel Connector
    console.log('💳 Stripe Nexus Initialized.');
  }

  /**
   * Process a payment intent.
   * @param {number} amount - Amount in cents.
   * @param {string} currency - Currency code (e.g., 'usd').
   * @param {string} paymentMethodId - ID of the payment method.
   * @param {string} customerId - ID of the customer.
   * @param {string} description - Description for the payment.
   * @returns {object} Payment intent details.
   */
  async processPayment(amount, currency, paymentMethodId, customerId, description) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method: paymentMethodId,
        customer: customerId,
        description: description,
        confirm: true,
        off_session: true, // For payments initiated by the merchant
      });

      if (this.kernelConnector) {
        this.kernelConnector.emit('stripePaymentProcessed', { paymentIntent });
      }
      console.log(`💳 Payment processed successfully: ${paymentIntent.id}`);
      return { success: true, paymentIntent };
    } catch (error) {
      console.error('❌ Stripe payment processing failed:', error.message);
      if (this.kernelConnector) {
        this.kernelConnector.emit('stripePaymentFailed', { error: error.message });
      }
      return { success: false, message: error.message };
    }
  }

  /**
   * Create a new Stripe customer.
   * @param {string} email - Customer's email.
   * @param {string} name - Customer's name.
   * @returns {object} Customer details.
   */
  async createCustomer(email, name) {
    try {
      const customer = await this.stripe.customers.create({
        email: email,
        name: name,
      });
      console.log(`👤 Stripe customer created: ${customer.id}`);
      return { success: true, customer };
    } catch (error) {
      console.error('❌ Stripe customer creation failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Retrieve a customer by ID.
   * @param {string} customerId - ID of the customer.
   * @returns {object} Customer details.
   */
  async retrieveCustomer(customerId) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return { success: true, customer };
    } catch (error) {
      console.error('❌ Stripe customer retrieval failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Create a product in Stripe.
   * @param {string} name - Name of the product.
   * @param {string} description - Description of the product.
   * @returns {object} Product details.
   */
  async createProduct(name, description) {
    try {
      const product = await this.stripe.products.create({
        name: name,
        description: description,
      });
      console.log(`📦 Stripe product created: ${product.id}`);
      return { success: true, product };
    } catch (error) {
      console.error('❌ Stripe product creation failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Create a price for a product.
   * @param {string} productId - ID of the product.
   * @param {number} unitAmount - Unit amount in cents.
   * @param {string} currency - Currency code (e.g., 'usd').
   * @param {string} recurringInterval - 'day', 'week', 'month', or 'year' for subscriptions.
   * @returns {object} Price details.
   */
  async createPrice(productId, unitAmount, currency, recurringInterval = null) {
    try {
      const priceConfig = {
        product: productId,
        unit_amount: unitAmount,
        currency: currency,
      };
      if (recurringInterval) {
        priceConfig.recurring = { interval: recurringInterval };
      }
      const price = await this.stripe.prices.create(priceConfig);
      console.log(`💲 Stripe price created: ${price.id}`);
      return { success: true, price };
    } catch (error) {
      console.error('❌ Stripe price creation failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Create a checkout session for one-time payments or subscriptions.
   * @param {Array<object>} lineItems - Array of line items for the checkout session.
   * @param {string} mode - 'payment' or 'subscription'.
   * @param {string} successUrl - URL to redirect after successful checkout.
   * @param {string} cancelUrl - URL to redirect after canceled checkout.
   * @returns {object} Checkout session details.
   */
  async createCheckoutSession(lineItems, mode, successUrl, cancelUrl) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      console.log(`🛒 Stripe checkout session created: ${session.id}`);
      return { success: true, session };
    } catch (error) {
      console.error('❌ Stripe checkout session creation failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Retrieve all invoices for a customer.
   * @param {string} customerId - ID of the customer.
   * @returns {object} List of invoices.
   */
  async listCustomerInvoices(customerId) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
      });
      return { success: true, invoices: invoices.data };
    } catch (error) {
      console.error('❌ Stripe invoice retrieval failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle incoming Stripe webhooks.
   * @param {string} rawBody - The raw request body from Stripe.
   * @param {string} signature - The 'stripe-signature' header.
   * @param {string} webhookSecret - Your Stripe webhook secret.
   * @returns {object} The event object if successful.
   */
  async handleWebhook(rawBody, signature, webhookSecret) {
    try {
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      console.log(`🔔 Stripe webhook received: ${event.type}`);
      if (this.kernelConnector) {
        this.kernelConnector.emit('stripeWebhookEvent', { event });
      }
      return { success: true, event };
    } catch (error) {
      console.error('❌ Stripe webhook signature verification failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}

module.exports = { StripeNexus };
