import TelegramBot, { Message } from "node-telegram-bot-api";
import { ENDPOINT, userState } from "../constants";
import { logger } from "./logger";
import { extractSenderInfo } from "./extract-sender-info";

export const fetchTranslation = async (
  bot: TelegramBot,
  msg: Message
): Promise<void> => {
  const { chatId, username, fullName, userId } = extractSenderInfo(msg);
  const { text } = userState.get(chatId) || {};

  if (!text) {
    await bot.sendMessage(
      chatId,
      "No text to translate. Please send text again."
    );
    return;
  }

  const { sourceLanguage, targetLanguage } = userState.get(chatId) || {};

  if (!sourceLanguage || !targetLanguage) {
    await bot.sendMessage(
      chatId,
      "Source or target language not selected. Please start again with /start."
    );
    return;
  }

  const payload = {
    text,
    source_lang: sourceLanguage.substring(0, 2).toLowerCase(),
    target_lang: targetLanguage.substring(0, 2).toLowerCase(),
  };

  logger("info", "payload", undefined, {
    payload,
    username,
    fullName,
    userId,
    chatId,
  });

  const translatingMessage = await bot.sendMessage(chatId, "Translating...");
  const translatingMessageId = translatingMessage.message_id;
  bot.sendChatAction(chatId, "typing");

  try {
    const aiResponse = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      logger("error", "fetchTranslation", undefined, {
        aiResponse,
      });
      throw new Error(
        `Translation service returned status ${aiResponse.status}`
      );
    }

    const responseData = await aiResponse.json();

    if (
      !responseData ||
      !responseData.response ||
      !responseData.response.translated_text
    ) {
      logger("error", "fetchTranslation", undefined, {});
      throw new Error("Invalid response from translation service");
    }

    await bot.editMessageText(responseData.response.translated_text, {
      chat_id: chatId,
      message_id: translatingMessageId,
    });
    await bot.sendMessage(chatId, "New translation? /start");
  } catch (error) {
    logger("error", "fetchTranslation", undefined, { error });
    await bot.editMessageText("Translation failed, /start to try again", {
      chat_id: chatId,
      message_id: translatingMessageId,
    });
  }
};
