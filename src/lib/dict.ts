import freeDictionaryApi from "../lib/dictionary-api.ts";
import mic from "../lib/mic.ts";
import oxfordWeb from "../lib/oxford-web.ts";
import websterApi from "../lib/webster-api.ts";
import websterWeb from "../lib/webster-web.ts";
import youdaoApi from "../lib/youdao-api.ts";
import type { IDictionary } from "./idict.ts";

export const fill = async (dict: IDictionary, userAgent: string) => {
   await Promise.allSettled([
      youdaoApi(dict),
      freeDictionaryApi(dict),
      websterApi(dict),
      websterWeb(dict, userAgent),
      oxfordWeb(dict, userAgent),
   ]);
   try {
      mic(dict);
   } catch (e) {
      console.error("mic parse error:", e);
   }
   return dict;
};
