import freeDictionaryApi from "../lib/dictionary-api.ts";
import mic from "../lib/mic.ts";
import oxfordWeb from "../lib/oxford-web.ts";
import websterApi from "../lib/webster-api.ts";
import websterWeb from "../lib/webster-web.ts";
import youdaoApi from "../lib/youdao-api.ts";
import type { IDictionary } from "./idict.ts";

export const fill = async (dict: IDictionary) => {
   // Youdao
   await youdaoApi(dict);
   // freeDictionaryApi
   await freeDictionaryApi(dict);
   // websterApi
   await websterApi(dict);
   // websterWeb
   await websterWeb(dict);
   // oxford
   await oxfordWeb(dict);
   // mic
   mic(dict);
   return dict;
};
