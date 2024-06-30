import fs from "fs";
import { lastUpdateIdFile } from "../consts";
import { __log__ } from "./log";

export const _save_last_update_id = (updateId: number) => {
  fs.writeFileSync(lastUpdateIdFile, updateId.toString());
  __log__("Saved last update ID", { update_id: updateId });
};
