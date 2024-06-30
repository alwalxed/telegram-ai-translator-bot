import { LANGUAGES } from "../consts";

export type AllowedLanguage = Lowercase<(typeof LANGUAGES)[number]>;
export type UserState = {
  chosenLanguage?: AllowedLanguage;
};
