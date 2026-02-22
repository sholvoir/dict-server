import freeDictionaryApi from "../lib/dictionary-api.ts";
import mic from "../lib/mic.ts";
import oxfordWeb from "../lib/oxford-web.ts";
import websterApi from "../lib/webster-api.ts";
import websterWeb from "../lib/webster-web.ts";
import youdaoApi from "../lib/youdao-api.ts";
import type { IDictionary } from "./idict.ts";

export const fill = async (dict: IDictionary, userAgent: string) => {
   try {
      // Youdao
      await youdaoApi(dict);
   } catch (e) {
      console.error(e);
   }
   try {
      // freeDictionaryApi
      await freeDictionaryApi(dict);
   } catch (e) {
      console.error(e);
   }
   try {
      // websterApi
      await websterApi(dict);
   } catch (e) {
      console.error(e);
   }
   try {
      // websterWeb
      await websterWeb(dict, userAgent);
   } catch (e) {
      console.error(e);
   }
   try {
      // oxford
      await oxfordWeb(dict, userAgent);
   } catch (e) {
      console.error(e);
   }
   try {
      // mic
      mic(dict);
   } catch (e) {
      console.error(e);
   }
   return dict;
};
