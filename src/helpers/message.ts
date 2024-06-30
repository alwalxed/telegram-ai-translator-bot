import TelegramBot from "node-telegram-bot-api";
import { __log__ } from "../utils/log";

export const send_message = async (
  bot: TelegramBot,
  chatId: number,
  text: string,
  options = {}
) => {
  try {
    __log__("Sending message", { chat_id: chatId, text });
    await bot.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("Error sending message: ", error);
    __log__("Error sending message", { chat_id: chatId, error });
  }
};
