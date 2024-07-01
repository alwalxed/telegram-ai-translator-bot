import TelegramBot from "node-telegram-bot-api";
import { logger } from "./logger";

export async function retryWithExponentialBackoff(bot: TelegramBot) {
  let delay = 1000;

  while (true) {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));

      await bot.startPolling();
      logger("info", "retryWithExponentialBackoff", "No user", { delay });
      break;
    } catch (error) {
      logger("error", "retryWithExponentialBackoff", "No user", { error });
      delay *= 2;
    }
  }
}
