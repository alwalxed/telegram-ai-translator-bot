import { appendFileSync } from "fs";
import { resolve } from "path";
import { UserState } from "../types";
import { flattenObject } from "./flatten-object";

/**
 * Logs messages to console and writes them to a log file.
 * @param {("error" | "info")} logType - Type of log message ('error' or 'info').
 * @param {string} source - Source identifier for the log message.
 * @param {UserState | undefined} userState - Current state of the user.
 * @param {any} message - Message to log. Must be an object or undefined.
 */
export function logger(
  logType: "error" | "info",
  source: string,
  userState: UserState | undefined,
  message?: any
): void {
  let formattedMessage = `
    Handling an ${logType.toUpperCase()} message from ${source.toUpperCase()}:\n`;

  if (message !== undefined) {
    if (typeof message === "object") {
      formattedMessage += `${JSON.stringify(flattenObject(message), null, 2)}`;
    } else {
      formattedMessage += `${message}`;
    }
  } else {
    formattedMessage += "No details provided";
  }

  formattedMessage += `\nUser State: ${
    userState !== undefined
      ? JSON.stringify(userState, null, 2)
      : "No user state provided"
  }`;

  console[logType === "error" ? "error" : "log"](formattedMessage.trim());
  writeLog(formattedMessage.trim());
}

const writeLog = (logMessage: string): void => {
  try {
    const logFilePath = resolve(__dirname, "server.log");
    appendFileSync(
      logFilePath,
      `${new Date().toISOString()} - ${logMessage}\n`
    );
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
};
