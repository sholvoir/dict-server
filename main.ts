import freeDictionaryApi from "./dictionary-api.ts";
import oxfordWeb from "./oxford-web.ts";
import websterApi from "./webster-api.ts";
import websterWeb from "./webster-web.ts";
import youdaoApi from "./youdao-api.ts";

Deno.serve({port: 8080}, async (req) => {
   const url = new URL(req.url);
   const word = url.searchParams.get("q");
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
