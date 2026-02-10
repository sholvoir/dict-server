import type { IDictionary } from "./idict.ts";

// export const googleTtsBaseUrl =
//    "https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=en&client=tw-ob"; //&q=ir

const baseUrl = "https://dict.youdao.com/jsonapi";
const audioBase = "https://dict.youdao.com/dictvoice?audio="; //complete&type=2

const fill = async (dict: IDictionary) => {
   if (!dict.input) return dict;
   if (dict.version) return dict;
   const resp = await fetch(`${baseUrl}?q=${encodeURIComponent(dict.input)}`);
   if (!resp.ok) return;
   const root = await resp.json();
   const needDelete = [
      "web_trans",
      "oxfordAdvanceHtml",
      "oxfordAdvanceTen",
      "oxfordAdvance",
      "oxford",
      "webster",
      "senior",
      "lang",
      "le",
      "meta",
      "typos",
      "input",
   ];
   for (const dictName of needDelete) if (root[dictName]) delete root[dictName];
   if (root.simple?.word?.length)
      for (const word of root.simple.word) {
         if (word.ukspeech) word.ukspeech = `${audioBase}${word.ukspeech}`;
         if (word.usspeech) word.usspeech = `${audioBase}${word.usspeech}`;
      }
   if (root.ec?.word?.length)
      for (const word of root.ec.word) {
         if (word.ukspeech) word.ukspeech = `${audioBase}${word.ukspeech}`;
         if (word.usspeech) word.usspeech = `${audioBase}${word.usspeech}`;
      }
   if (root.word_video?.word_videos?.length)
      for (const wordVideo of root.word_video.word_videos) {
         delete wordVideo.ad;
      }
   for (const [key, value] of Object.entries(root)) dict[key] = value;
   dict.version = Date.now();
   dict.modified = true;
   return dict;
};

export default fill;

if (import.meta.main)
   for (const word of Deno.args) console.log(await fill({ input: word }));
