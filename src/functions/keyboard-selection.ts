import TelegramBot, { Message } from "node-telegram-bot-api";
import { languages } from "../constants";
import { logger } from "./logger";

export const sendLanguageSelection = async (
  bot: TelegramBot,
  chatId: number,
  prompt: string
): Promise<Message> => {
  try {
    const message = await bot.sendMessage(chatId, prompt, {
      reply_markup: {
        keyboard: languages.map((array) =>
          array.map((lang) => ({ text: lang }))
        ),
        force_reply: true,
        selective: true,
        one_time_keyboard: true,
      },
    });
    return message;
  } catch (error) {
    logger("error", "sendLanguageSelection", undefined, { error });
    throw error;
  }
};
