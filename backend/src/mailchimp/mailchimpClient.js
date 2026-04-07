/**
 * ============================================================
 * SCROLLVERSE TRINITY SOVEREIGN ECOSYSTEM
 * PILLAR 4: Mailchimp Automation Integration
 * Email Sequences: Welcome, Payment, Zakat, Referral
 * Supreme Sovereign: Chais Kenyatta Hill (Sabir Allah the Great)
 * ============================================================
 */

'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

// ─── Mailchimp API Client ─────────────────────────────────────
class MailchimpClient {
  constructor() {
    this.apiKey = process.env.MAILCHIMP_API_KEY;
    this.serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || 'us1';
    this.listId = process.env.MAILCHIMP_LIST_ID;
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${this.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    logger.info('[Mailchimp] ✅ Client initialized');
  }

  // ─── Add/Update Subscriber ─────────────────────────────────
  async addSubscriberToList(email, mergeFields = {}, tags = []) {
    try {
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const response = await this.client.put(
        `/lists/${this.listId}/members/${subscriberHash}`,
        {
          email_address: email,
          status_if_new: 'subscribed',
          status: 'subscribed',
          merge_fields: {
            FNAME: mergeFields.firstName || '',
            LNAME: mergeFields.lastName || '',
            PLAN: mergeFields.plan || 'monthly',
            AMOUNT: mergeFields.amount || '9.99',
            JOINDATE: new Date().toISOString().split('T')[0],
            ECOSYSTEM: 'ScrollVerse Trinity Sovereign',
            ...mergeFields,
          },
          tags: ['scrollverse-member', ...tags],
        }
      );

      logger.info(`[Mailchimp] ✅ Subscriber added/updated: ${email}`);
      return response.data;
    } catch (error) {
      logger.error(
        `[Mailchimp] ❌ addSubscriberToList failed for ${email}: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  // ─── Add Tag to Subscriber ─────────────────────────────────
  async addTagsToSubscriber(email, tags) {
    try {
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const tagPayload = tags.map((tag) => ({ name: tag, status: 'active' }));

      await this.client.post(
        `/lists/${this.listId}/members/${subscriberHash}/tags`,
        { tags: tagPayload }
      );

      logger.info(`[Mailchimp] ✅ Tags added to ${email}: ${tags.join(', ')}`);
    } catch (error) {
      logger.error(
        `[Mailchimp] ❌ addTagsToSubscriber failed: ${error.message}`
      );
    }
  }

  // ─── Send Transactional Email via Automation ───────────────
  async triggerAutomation(workflowId, email) {
    try {
      await this.client.post(
        `/automations/${workflowId}/emails/1/queue`,
        { email_address: email }
      );
      logger.info(
        `[Mailchimp] ✅ Automation triggered: ${workflowId} for ${email}`
      );
    } catch (error) {
      logger.error(
        `[Mailchimp] ❌ Automation trigger failed: ${error.message}`
      );
    }
  }

  // ─── Send Campaign to Segment ──────────────────────────────
  async createAndSendCampaign({ subject, fromName, fromEmail, html, segmentId }) {
    try {
      // Create campaign
      const campaign = await this.client.post('/campaigns', {
        type: 'regular',
        recipients: {
          list_id: this.listId,
          ...(segmentId && { segment_opts: { saved_segment_id: segmentId } }),
        },
        settings: {
          subject_line: subject,
          from_name: fromName || 'ScrollVerse Trinity Sovereign',
          reply_to: fromEmail || 'sovereign@scrollverse.app',
        },
      });

      // Set content
      await this.client.put(`/campaigns/${campaign.data.id}/content`, {
        html,
      });

      // Send
      await this.client.post(`/campaigns/${campaign.data.id}/actions/send`);

      logger.info(`[Mailchimp] ✅ Campaign sent: ${campaign.data.id}`);
      return campaign.data;
    } catch (error) {
      logger.error(`[Mailchimp] ❌ Campaign failed: ${error.message}`);
      throw error;
    }
  }

  // ─── Get Audience Stats ────────────────────────────────────
  async getAudienceStats() {
    try {
      const response = await this.client.get(`/lists/${this.listId}`);
      const list = response.data;

      return {
        totalMembers: list.stats.member_count,
        unsubscribeCount: list.stats.unsubscribe_count,
        cleanedCount: list.stats.cleaned_count,
        openRate: list.stats.open_rate,
        clickRate: list.stats.click_rate,
        campaignCount: list.stats.campaign_count,
      };
    } catch (error) {
      logger.error(`[Mailchimp] ❌ getAudienceStats failed: ${error.message}`);
      throw error;
    }
  }
}

// ─── Email Sequence Templates ─────────────────────────────────
const EMAIL_SEQUENCES = {
  new_subscriber_welcome: (data) => ({
    subject: `Welcome to ScrollVerse Trinity Sovereign, ${data.name}!`,
    html: generateWelcomeEmail(data),
    tags: ['new-subscriber', `plan-${data.plan}`],
  }),

  payment_confirmation: (data) => ({
    subject: `Payment Confirmed - $${data.amount} | ScrollVerse`,
    html: generatePaymentConfirmEmail(data),
    tags: ['payment-confirmed'],
  }),

  payment_failed: (data) => ({
    subject: `Action Required: Payment Failed - ScrollVerse`,
    html: generatePaymentFailedEmail(data),
    tags: ['payment-failed'],
  }),

  zakat_distribution: (data) => ({
    subject: `Your Zakat Distribution: $${data.zakatAmount} | ScrollVerse`,
    html: generateZakatEmail(data),
    tags: ['zakat-distributed'],
  }),

  referral_reward: (data) => ({
    subject: `You Earned a Referral Reward: $${data.rewardAmount} | ScrollVerse`,
    html: generateReferralEmail(data),
    tags: ['referral-reward'],
  }),

  subscription_cancellation_scheduled: (data) => ({
    subject: `Your Subscription Ends ${data.expiryDate} - We'd Love to Keep You`,
    html: generateCancellationEmail(data),
    tags: ['cancellation-scheduled'],
  }),

  subscription_reactivated: (data) => ({
    subject: `Welcome Back to ScrollVerse! Your Subscription is Active`,
    html: generateReactivationEmail(data),
    tags: ['reactivated'],
  }),

  subscription_past_due: (data) => ({
    subject: `Action Required: Update Your Payment Method`,
    html: generatePastDueEmail(data),
    tags: ['past-due'],
  }),

  refund_confirmation: (data) => ({
    subject: `Refund Processed: $${data.refundAmount} | ScrollVerse`,
    html: generateRefundEmail(data),
    tags: ['refund-processed'],
  }),
};

// ─── Main Trigger Function ────────────────────────────────────
const mailchimpInstance = new MailchimpClient();

const triggerEmailSequence = async (sequenceType, data) => {
  try {
    const sequence = EMAIL_SEQUENCES[sequenceType];
    if (!sequence) {
      logger.warn(`[Mailchimp] Unknown sequence type: ${sequenceType}`);
      return;
    }

    if (!data.email) {
      logger.warn(`[Mailchimp] No email provided for sequence: ${sequenceType}`);
      return;
    }

    const emailContent = sequence(data);

    // Add/update subscriber with relevant tags
    await mailchimpInstance.addSubscriberToList(
      data.email,
      {
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        plan: data.plan || 'monthly',
        amount: data.amount || '9.99',
      },
      emailContent.tags || []
    );

    logger.info(
      `[Mailchimp] ✅ Email sequence triggered: ${sequenceType} → ${data.email}`
    );

    return { success: true, sequenceType, email: data.email };
  } catch (error) {
    logger.error(
      `[Mailchimp] ❌ triggerEmailSequence failed: ${error.message}`
    );
    // Non-blocking - email failure should not break payment flow
    return { success: false, error: error.message };
  }
};

// ─── Email HTML Generators ────────────────────────────────────

const emailBase = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 1px solid #333; }
    .logo { font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #FFD700, #FF6B35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .tagline { color: #888; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-top: 5px; }
    .content { padding: 40px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #FFD700, #FF6B35); color: #000; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .metric-box { background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 15px 0; }
    .metric-label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
    .metric-value { color: #FFD700; font-size: 24px; font-weight: 700; margin-top: 5px; }
    .footer { border-top: 1px solid #333; padding-top: 30px; text-align: center; color: #555; font-size: 12px; }
    h1 { font-size: 32px; font-weight: 900; margin: 0 0 10px; }
    p { line-height: 1.7; color: #ccc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ScrollVerse</div>
      <div class="tagline">Trinity Sovereign Ecosystem</div>
    </div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>© 2025 ScrollVerse Trinity Sovereign | Supreme Sovereign: Chais Kenyatta Hill</p>
      <p>Building the future with 50M+ sovereign members worldwide</p>
    </div>
  </div>
</body>
</html>`;

const generateWelcomeEmail = (data) =>
  emailBase(`
    <h1>Welcome, ${data.name}!</h1>
    <p>You have joined the ScrollVerse Trinity Sovereign Ecosystem — a platform built on love, purpose, and infinite potential.</p>
    <div class="metric-box">
      <div class="metric-label">Your Plan</div>
      <div class="metric-value">${data.plan === 'month' ? 'Monthly' : 'Annual'} Sovereign</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Monthly Investment</div>
      <div class="metric-value">$${data.amount}</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Next Billing Date</div>
      <div class="metric-value">${data.nextBillingDate}</div>
    </div>
    <p>Your membership activates:</p>
    <ul style="color: #ccc; line-height: 2;">
      <li>✅ Full platform access</li>
      <li>✅ Zakat-powered giving (7.77%–15% of revenue distributed)</li>
      <li>✅ Referral rewards program ($5 per referral)</li>
      <li>✅ AscendancyID blockchain identity</li>
      <li>✅ Portfolio management tools</li>
    </ul>
    <center><a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">Enter Your Dashboard</a></center>
  `);

const generatePaymentConfirmEmail = (data) =>
  emailBase(`
    <h1>Payment Confirmed</h1>
    <p>Thank you, ${data.name}. Your payment has been processed successfully.</p>
    <div class="metric-box">
      <div class="metric-label">Amount Paid</div>
      <div class="metric-value">$${data.amount} ${data.currency}</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Zakat Distributed</div>
      <div class="metric-value">$${data.zakatAmount} (7.77%)</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Transaction ID</div>
      <div class="metric-value" style="font-size: 14px;">${data.paymentId}</div>
    </div>
    <p>Your Zakat contribution of <strong>$${data.zakatAmount}</strong> has been automatically distributed to those in need — fulfilling the sacred obligation embedded in every ScrollVerse transaction.</p>
    <center><a href="${process.env.FRONTEND_URL}/billing" class="cta-button">View Billing History</a></center>
  `);

const generatePaymentFailedEmail = (data) =>
  emailBase(`
    <h1>Payment Action Required</h1>
    <p>Hi ${data.name}, we were unable to process your payment of <strong>$${data.amount}</strong>.</p>
    <div class="metric-box">
      <div class="metric-label">Reason</div>
      <div class="metric-value" style="font-size: 16px; color: #FF6B35;">${data.failureReason}</div>
    </div>
    <p>Please update your payment method to continue your ScrollVerse journey without interruption.</p>
    <center><a href="${data.retryUrl}" class="cta-button">Update Payment Method</a></center>
    <p style="font-size: 12px; color: #555; text-align: center;">Your access remains active for 7 days while you resolve this.</p>
  `);

const generateZakatEmail = (data) =>
  emailBase(`
    <h1>Zakat Distribution Complete</h1>
    <p>As-salamu alaykum, ${data.name}. Your Zakat has been distributed.</p>
    <div class="metric-box">
      <div class="metric-label">Zakat Amount Distributed</div>
      <div class="metric-value">$${data.zakatAmount}</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Distribution Rate</div>
      <div class="metric-value">7.77% – 15%</div>
    </div>
    <p>This sacred obligation has been fulfilled automatically through the ScrollVerse Zakat Protocol — ensuring that every transaction contributes to the upliftment of those in need.</p>
    <p><em>"And establish prayer and give zakah, and whatever good you put forward for yourselves — you will find it with Allah." (Qur'an 2:110)</em></p>
  `);

const generateReferralEmail = (data) =>
  emailBase(`
    <h1>Referral Reward Earned!</h1>
    <p>Congratulations, ${data.name}! Your referral has activated a new Sovereign Member.</p>
    <div class="metric-box">
      <div class="metric-label">Reward Earned</div>
      <div class="metric-value">$${data.rewardAmount}</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Total Referrals</div>
      <div class="metric-value">${data.totalReferrals || 1}</div>
    </div>
    <p>Keep sharing your unique referral link to unlock more rewards. With a viral coefficient of 1.18, every referral multiplies the empire.</p>
    <center><a href="${process.env.FRONTEND_URL}/referrals" class="cta-button">View Referral Dashboard</a></center>
  `);

const generateCancellationEmail = (data) =>
  emailBase(`
    <h1>We're Sad to See You Go</h1>
    <p>Hi ${data.name}, your subscription is scheduled to end on <strong>${data.expiryDate}</strong>.</p>
    <p>You'll retain full access until that date. If you change your mind, you can reactivate anytime.</p>
    <center><a href="${data.reactivateUrl}" class="cta-button">Keep My Membership</a></center>
  `);

const generateReactivationEmail = (data) =>
  emailBase(`
    <h1>Welcome Back, ${data.name}!</h1>
    <p>Your ScrollVerse subscription is active again. The empire continues to grow with you in it.</p>
    <center><a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">Return to Dashboard</a></center>
  `);

const generatePastDueEmail = (data) =>
  emailBase(`
    <h1>Payment Update Required</h1>
    <p>Hi ${data.name}, your subscription payment is past due. Please update your payment method to avoid service interruption.</p>
    <center><a href="${data.updatePaymentUrl}" class="cta-button">Update Payment Method</a></center>
  `);

const generateRefundEmail = (data) =>
  emailBase(`
    <h1>Refund Processed</h1>
    <p>Hi ${data.name}, your refund of <strong>$${data.refundAmount} ${data.currency}</strong> has been processed.</p>
    <div class="metric-box">
      <div class="metric-label">Refund Amount</div>
      <div class="metric-value">$${data.refundAmount}</div>
    </div>
    <p>Please allow ${data.processingDays} business days for the funds to appear in your account.</p>
  `);

module.exports = {
  MailchimpClient,
  triggerEmailSequence,
  addSubscriberToList: (email, mergeFields, tags) =>
    mailchimpInstance.addSubscriberToList(email, mergeFields, tags),
  getAudienceStats: () => mailchimpInstance.getAudienceStats(),
  EMAIL_SEQUENCES,
};
