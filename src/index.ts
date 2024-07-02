import { serve } from "@hono/node-server";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Hono } from "hono";
import { logger } from "./functions/logger";
import { AllowedLanguage } from "./types";
import { flatLanguages, PORT, TOKEN, userState } from "./constants";
import { fetchTranslation } from "./functions/fetch-translation";
import { sendLanguageSelection } from "./functions/keyboard-selection";
import { extractSenderInfo } from "./functions/extract-sender-info";

const app = new Hono();
const bot = new TelegramBot(TOKEN, {
  polling: true,
  filepath: false,
});

bot.on("message", async (msg: Message) => {
  try {
    const { chatId, username, fullName, userId } = extractSenderInfo(msg);
    const currentState = userState.get(chatId) || { step: "startCommand" };
    logger("info", "new message", currentState, {
      chatId,
      username,
      fullName,
      userId,
    });

    if (msg.text?.startsWith("/start")) {
      userState.set(chatId, { step: "startCommand" });
      await sendLanguageSelection(bot, chatId, "From?");
      userState.set(chatId, {
        ...currentState,
        step: "sourceLanguageKeyboard",
      });
    } else if (
      currentState.step === "sourceLanguageKeyboard" &&
      flatLanguages.includes(msg.text as AllowedLanguage)
    ) {
      await sendLanguageSelection(bot, chatId, "To?");
      userState.set(chatId, {
        ...currentState,
        step: "targetLanguageKeyboard",
        sourceLanguage: msg.text,
      });
    } else if (
      currentState.step === "targetLanguageKeyboard" &&
      flatLanguages.includes(msg.text as AllowedLanguage)
    ) {
      await bot.sendMessage(chatId, "Send the text");
      userState.set(chatId, {
        ...currentState,
        step: "textValidation",
        targetLanguage: msg.text,
      });
    } else if (msg.text && currentState.step === "textValidation") {
      const isValidLength = msg.text?.length >= 2 && msg.text?.length <= 800;

      if (isValidLength) {
        userState.set(chatId, {
          ...currentState,
          step: "fetchTranslation",
          text: msg.text,
        });
        await fetchTranslation(bot, msg);
      } else {
        await bot.sendMessage(
          chatId,
          "Text must be between 2 and 800 characters, /start to retry"
        );
      }
    } else {
      userState.set(chatId, { step: "error" });
      await bot.sendMessage(chatId, "Bad request, please use /start");
    }
  } catch (error) {
    logger("error", "message", undefined, { error });
  }
});

bot.on("polling_error", (error) => {
  logger("error", "polling_error", undefined, { error });
});

bot.on("webhook_error", (error) => {
  logger("error", "webhook_error", undefined, { error });
});

serve({ fetch: app.fetch, port: PORT });

console.log(`Server is running on port ${PORT}`);
logger("info", `Server is running on port ${PORT}`, undefined, {});
