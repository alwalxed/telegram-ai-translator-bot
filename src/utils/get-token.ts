import * as dotenv from "dotenv";

export function _get_token(): string {
  dotenv.config();
  const token: string = process.env.TOKEN as string;

  if (!token) {
    throw new Error("Telegram bot token is missing.");
  }
  return token;
}
