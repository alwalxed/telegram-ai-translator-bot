import * as dotenv from "dotenv";

export function _get_endpoint(): string {
  dotenv.config();
  const endpoint: string = process.env.AI_ENDPOINT as string;

  if (!endpoint) {
    throw new Error("AI endpoint is missing.");
  }
  return endpoint;
}
