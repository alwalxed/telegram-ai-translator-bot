import { flatLanguages } from "../constants";

export type UserState = {
  step:
    | "startCommand"
    | "sourceLanguageKeyboard"
    | "targetLanguageKeyboard"
    | "textValidation"
    | "fetchTranslation"
    | "error";
  sourceLanguage?: string;
  targetLanguage?: string;
  text?: string;
};

export type AllowedLanguage = (typeof flatLanguages)[number];
