import TelegramBot from "node-telegram-bot-api";

export const get_message_info = (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const username = msg.from?.username;
  const full_name = `${msg.from?.first_name} ${msg.from?.last_name ?? ""}`;
  const user_id = msg.from?.id;
  return { chatId, username, full_name, user_id };
};
