import TelegramBot from "node-telegram-bot-api";
import { LANGUAGES } from "../consts";
import { __log__ } from "../utils/log";
import { send_message } from "./message";

export const send_language_selection = async (
  bot: TelegramBot,
  chatId: number
): Promise<void> => {
  __log__("Sending language selection message", { chat_id: chatId });
  await send_message(bot, chatId, "From what to what?", {
    reply_markup: {
      keyboard: LANGUAGES.map((lang) => [{ text: lang }]),
      force_reply: true,
      resize_keyboard: true,
    },
  });
};
