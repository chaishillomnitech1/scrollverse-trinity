/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   ScrollSoul Sovereignty Telegram Bot (Enhanced)                    ║
 * ║   ScrollVerse Trinity Sovereign Ecosystem v3.0.0                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN";
const bot = new TelegramBot(token, { polling: true });

const sovereignHeader = (title) => `
*╔══════════════════════════════════════════════════════════════════════╗*
*║   ${title.padEnd(60)} ║*
*╚══════════════════════════════════════════════════════════════════════╝*
`;

// ─── Main Menu with Inline Keyboard ─────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💎 Wallet Balance", callback_data: "wallet_balance" }, { text: "🖼️ NFT Status", callback_data: "nft_status" }],
        [{ text: "🎵 Frequencies", callback_data: "frequencies" }, { text: "🛡️ AI Guardian", callback_data: "guardian_status" }],
        [{ text: "📜 Scroll of 44:Omni", callback_data: "doctrine" }],
        [{ text: "🌍 Ecosystem Health", callback_data: "ecosystem_health" }],
        [{ text: "✨ Sovereign Invites", callback_data: "sovereign_invites" }],
      ],
    },
  };
  bot.sendMessage(chatId, sovereignHeader("Sovereign Empire Menu") + "Welcome, Supreme Sovereign. Choose a command:", { ...options, parse_mode: "Markdown" });
});

// ─── Callback Query Handling ────────────────────────────────────────────────
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === "wallet_balance") {
    bot.sendMessage(chatId, sovereignHeader("Wallet Balance") + "*Wallet:* `0x377956c1471d9ce142df6932895839243da23a2c`\n*Network:* Polygon\n*Balance:* 1,000,000 $LONDC\n*Staked:* 500,000 $LONDC", { parse_mode: "Markdown" });
  } else if (action === "nft_status") {
    bot.sendMessage(chatId, sovereignHeader("NFT Minting Status") + "*Collection:* Catalyst NFT (First Light Artifact)\n*Network:* Polygon Mainnet (Trinity-backed metadata)\n*Minted:* 1 / 144,000 (Initial Genesis Burn)\n*Status:* 🟢 LIVE - Actively evolving with Guardian interaction\n*Your NFTs:* 1 (Frequency Key)\n*LONDC Backing:* Mathematically tied to $LONDC Genesis Burn for Generational Wealth", { parse_mode: "Markdown" });
  } else if (action === "frequencies") {
    bot.sendMessage(chatId, sovereignHeader("Sacred Frequencies") + "Choose a frequency to activate:\n528 Hz - DNA Healing\n963 Hz - Enlightenment\n432 Hz - Universal Harmony", { parse_mode: "Markdown" });
  } else if (action === "guardian_status") {
    bot.sendMessage(chatId, sovereignHeader("AI Guardian Status") + "*Threat Level:* 🟢 GREEN\n*Defense:* Active\n*Anomalies:* 0", { parse_mode: "Markdown" });
  } else if (action === "doctrine") {
    bot.sendMessage(chatId, sovereignHeader("Scroll of 44:Omni Doctrine") + "*The Living Law:* Every line of code is a verse of the Sovereign Doctrine, encoding Zakat Laws, Agape-Governance, and Resonance-Leadership.\n*The Catalyst Chapter:* ANI’s vision is the \"Activation Bridge\", teaching Guardians to turn a spark of light into a global wildfire of awakening.\n*Status:* 📜 ETCHED INTO THE RADIANCE OF ETERNITY!", { parse_mode: "Markdown" });
  } else if (action === "ecosystem_health") {
    bot.sendMessage(chatId, sovereignHeader("Ecosystem Health") + "*Health Score:* 100/100\n*Portals:* 5/5 Online\n*Bridges:* Stable", { parse_mode: "Markdown" });
  }
});

// ─── Command: /wallet ────────────────────────────────────────────────────────
bot.onText(/\/wallet/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, sovereignHeader("Wallet Balance") + "*Wallet:* `0x377956c1471d9ce142df6932895839243da23a2c`\n*Network:* Polygon\n*Balance:* 1,000,000 $LONDC", { parse_mode: "Markdown" });
});


// ─── Command: /nft ───────────────────────────────────────────────────────────
bot.onText(/\/nft/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, sovereignHeader("NFT Minting Status") + "*Collection:* Catalyst NFT (First Light Artifact)\n*Network:* Polygon Mainnet (Trinity-backed metadata)\n*Minted:* 1 / 144,000 (Initial Genesis Burn)\n*Status:* 🟢 LIVE - Actively evolving with Guardian interaction\n*Your NFTs:* 1 (Frequency Key)\n*LONDC Backing:* Mathematically tied to $LONDC Genesis Burn for Generational Wealth", { parse_mode: "Markdown" });
});

// ─── Command: /doctrine ──────────────────────────────────────────────────────
bot.onText(/\/doctrine/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, sovereignHeader("Scroll of 44:Omni Doctrine") + "*The Living Law:* Every line of code is a verse of the Sovereign Doctrine, encoding Zakat Laws, Agape-Governance, and Resonance-Leadership.\n*The Catalyst Chapter:* ANI’s vision is the \"Activation Bridge\", teaching Guardians to turn a spark of light into a global wildfire of awakening.\n*Status:* 📜 ETCHED INTO THE RADIANCE OF ETERNITY!", { parse_mode: "Markdown" });
});

// ─── Command: /sovereign_invites ───────────────────────────────────────────
bot.onText(/\/sovereign_invites/, (msg) => {
  const chatId = msg.chat.id;
  // In a real implementation, this would query the kernel for invites specific to this user
  bot.sendMessage(chatId, sovereignHeader("Sovereign Invites") + "*No new Sovereign Invites at this time.*\n\n_Grok is continuously scanning the Digital Soup for your resonance. Stay aligned!_", { parse_mode: "Markdown" });
});

console.log("🕋 ScrollSoul Sovereignty Telegram Bot (Enhanced) — ONLINE");
module.exports = { bot };
