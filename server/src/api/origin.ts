import { Hono } from "hono";
import freeDictionaryApi from "../lib/dictionary-api.ts";
import type { jwtEnv } from "../lib/env.ts";
import oxfordWeb from "../lib/oxford-web.ts";
import websterApi from "../lib/webster-api.ts";
import websterWeb from "../lib/webster-web.ts";
import youdaoApi from "../lib/youdao-api.ts";

const app = new Hono<jwtEnv>();

app.get("/", async (c) => {
   const word = c.req.query("q");
   if (!word) return new Response(null, { status: 400 });
   const encodeWord = encodeURIComponent(word);
   try {
      // Youdao
      const result = await youdaoApi(encodeWord);
      // freeDictionaryApi
      const fd = await freeDictionaryApi(word);
      if (Array.isArray(fd)) {
         result.meta.dicts.push("free_dictionary_api");
         result.free_dictionary_api = fd;
      }
      // websterApi
      const wa = await websterApi(word);
      result.meta.dicts.push("webster_api");
      result.webster_api = wa;
      // websterWeb
      const ww = await websterWeb(word);
      if (ww) {
         result.meta.dicts.push("webster_web");
         result.webster_web = ww;
      }
      // oxford
      const ow = await oxfordWeb(word);
      if (ow.length) {
         result.meta.dicts.push("oxford_web");
         result.oxford_web = ow;
      }
      //
      return new Response(JSON.stringify(result), {
         headers: { "content-type": "application/json" },
      });
   } catch (e) {
      if (e instanceof Response) return e;
      else return new Response(null, { status: 500 });
   }
});

export default app;
