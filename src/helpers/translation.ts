import TelegramBot, { Message } from "node-telegram-bot-api";
import { userState } from "../consts";
import { __log__ } from "../utils/log";
import { send_message } from "./message";
import { _get_endpoint } from "../utils/get-endpoint";

type TranslationResponse = {
  inputs: {
    text: string;
    source_lang: string;
    target_lang: string;
  };
  response: {
    translated_text: string;
  };
};

export const handleTranslation = async (
  bot: TelegramBot,
  msg: Message
): Promise<void> => {
  let translatingMessageId: number | undefined;
  const chatId = msg.chat.id;
  const endpoint = _get_endpoint();
  const text = msg.text;
  const chosenLanguage = userState.get(chatId)?.chosenLanguage;

  if (!chosenLanguage) {
    throw new Error("Chosen language not found.");
  }

  const choice = chosenLanguage.split(" ➜ ");
  const payload = {
    text,
    source_lang: choice[0].substring(0, 2).toLowerCase(),
    target_lang: choice[1].substring(0, 2).toLowerCase(),
  };
  __log__("Handling translation", { chat_id: chatId, text });
  const messageSent = await bot.sendMessage(chatId, "Translating...");
  if (messageSent) {
    translatingMessageId = messageSent.message_id;
  } else {
    throw new Error("Failed to send 'Translating...' message.");
  }
  try {
    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!aiResponse.ok) {
      __log__("Translation error", {
        chat_id: chatId,
        status: aiResponse.statusText,
      });
      throw new Error(
        `Translation service returned status ${aiResponse.status}`
      );
    }

    const responseData: TranslationResponse = await aiResponse.json();

    if (
      !responseData ||
      !responseData.response ||
      !responseData.response.translated_text
    ) {
      __log__("Translation error", { chat_id: chatId, responseData });
      throw new Error("Invalid response from translation service");
    }

    // Update the "Translating..." message with the translated text
    await bot.editMessageText(responseData.response.translated_text, {
      chat_id: chatId,
      message_id: translatingMessageId,
    });
    await bot.sendMessage(chatId, "New translation? /start");
  } catch (error) {
    console.error("Error handling translation:", error);
    __log__("Translation error", {
      chat_id: msg.chat.id,
      error: error,
    });
    await send_message(
      bot,
      msg.chat.id,
      "Translation failed. Please try again later."
    );

    // If an error occurs, delete the "Translating..." message
    if (translatingMessageId) {
      await bot.deleteMessage(chatId, translatingMessageId);
    }
  }
};
