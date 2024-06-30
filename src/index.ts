import { serve } from "@hono/node-server";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Hono } from "hono";
import { _get_token } from "./utils/get-token";
import { __log__ } from "./utils/log";
import { startCommandHandler } from "./helpers/start-command";
import { _save_last_update_id } from "./utils/last-updated";
import { get_message_info } from "./utils/get-msg-info";
import { LANGUAGES, port, userState } from "./consts";
import { send_message } from "./helpers/message";
import { AllowedLanguage } from "./types";
import { handleTranslation } from "./helpers/translation";

const app = new Hono();
const bot = new TelegramBot(_get_token(), { polling: true, filepath: false });

// Handle incoming messages
bot.on("message", async (msg: Message) => {
  try {
    __log__("Received message", get_message_info(msg));

    if (msg.text?.startsWith("/start")) {
      await handleStartCommand(bot, msg);
    } else if (isLanguageCommand(msg.text)) {
      handleLanguageCommand(bot, msg);
    } else if (msg.text) {
      handleTextMessage(bot, msg);
    } else {
      send_message(bot, msg.chat.id, "Bad request, please use /start");
    }
    _save_last_update_id(msg.message_id);
  } catch (error) {
    handleErrorMessage(msg, error);
  }
});

// Check if message text is a language command
function isLanguageCommand(text: string | undefined): boolean {
  if (!text) return false;
  const lowerCasedLangs = LANGUAGES.map((lang) => lang.toLowerCase());
  return lowerCasedLangs.includes(text.toLowerCase());
}

// Handle /start command
async function handleStartCommand(bot: TelegramBot, msg: Message) {
  userState.set(msg.chat.id, {});
  await startCommandHandler(bot, msg);
}

// Handle language command
function handleLanguageCommand(bot: TelegramBot, msg: Message) {
  userState.set(msg.chat.id, {
    chosenLanguage: msg.text as AllowedLanguage,
  });
  send_message(bot, msg.chat.id, "Send the text");
}

// Handle text message
async function handleTextMessage(bot: TelegramBot, msg: Message) {
  if (userState.get(msg.chat.id)?.chosenLanguage) {
    if (msg.text!.length === 1) {
      send_message(bot, msg.chat.id, "Send a valid text");
    } else {
      await handleTranslation(bot, msg);
    }
  } else {
    send_message(bot, msg.chat.id, "Choose language or /start");
  }
}

// Handle errors
function handleErrorMessage(
  msg: Message | { chat: { id: number } },
  error: unknown
) {
  console.error("Error handling message:", error);
  __log__("Error handling message", { chat_id: msg.chat.id, error });
}

// Handle polling errors
bot.on("polling_error", (error) => {
  handleErrorMessage({ chat: { id: 0 } }, error); // Replace with actual chat ID
});

// Handle webhook errors
bot.on("webhook_error", (error) => {
  handleErrorMessage({ chat: { id: 0 } }, error); // Replace with actual chat ID
});

// Start serving the bot
serve({ fetch: app.fetch, port: port });
console.log(`Server is running on port ${port}`);
__log__("Server started", { port });
