import { UserState } from "../types";

export const LANGUAGES = ["Arabic ➜ English", "English ➜ Arabic"] as const;

export const port = 3005;

export const userState: Map<number, UserState> = new Map();

export const lastUpdateIdFile = "last_update_id.txt";
