import TelegramBot from "node-telegram-bot-api";

export const extractSenderInfo = (
  message: TelegramBot.Message
): {
  chatId: number;
  username?: string;
  fullName: string;
  userId: number;
} => {
  const chatId = message.chat.id;
  const username = message.from?.username;
  const fullName = `${message.from?.first_name ?? ""} ${
    message.from?.last_name ?? ""
  }`.trim();
  const userId = message.from?.id;

  if (!chatId || !userId) {
    throw new Error("Chat ID or User ID is missing.");
  }

  return { chatId, username, fullName, userId };
};
