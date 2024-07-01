import { envGetValue } from "../functions/env";
import { UserState } from "../types";

export const userState: Map<number, UserState> = new Map();
export const languages = [
  ["Arabic", "English"],
  ["French", "Japanese"],
  ["Farsi", "Russian"],
] as const;
export const flatLanguages = languages.flat();
export const TOKEN = envGetValue("token");
export const PORT = parseInt(envGetValue("port"));
export const ENDPOINT = envGetValue("endpoint");
