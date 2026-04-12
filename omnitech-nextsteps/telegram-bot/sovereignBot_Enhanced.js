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
        [{ text: "🌍 Ecosystem Health", callback_data: "ecosystem_health" }],
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
    bot.sendMessage(chatId, sovereignHeader("NFT Minting Status") + "*Collection:* ScrollSoul Genesis\n*Minted:* 144 / 1000\n*Status:* 🟢 LIVE\n*Your NFTs:* 5", { parse_mode: "Markdown" });
  } else if (action === "frequencies") {
    bot.sendMessage(chatId, sovereignHeader("Sacred Frequencies") + "Choose a frequency to activate:\n528 Hz - DNA Healing\n963 Hz - Enlightenment\n432 Hz - Universal Harmony", { parse_mode: "Markdown" });
  } else if (action === "guardian_status") {
    bot.sendMessage(chatId, sovereignHeader("AI Guardian Status") + "*Threat Level:* 🟢 GREEN\n*Defense:* Active\n*Anomalies:* 0", { parse_mode: "Markdown" });
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
  bot.sendMessage(chatId, sovereignHeader("NFT Minting Status") + "*Collection:* ScrollSoul Genesis\n*Minted:* 144 / 1000\n*Status:* 🟢 LIVE", { parse_mode: "Markdown" });
});

console.log("🕋 ScrollSoul Sovereignty Telegram Bot (Enhanced) — ONLINE");
module.exports = { bot };
