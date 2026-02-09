import type { IDictionary } from "./idict.ts";

const baseUrl =
   "https://www.dictionaryapi.com/api/v3/references/collegiate/json";
const soundBase = "https://media.merriam-webster.com/audio/prons/en/us/mp3";
const apiKey = Deno.env.get("DICTIONARY_API_COM_DICTIONARY");
const websterRegex = /^[A-Za-z]/;

const getSubdirectory = (word: string) => {
   if (word.startsWith("bix")) return "bix";
   if (word.startsWith("gg")) return "gg";
   if (websterRegex.test(word)) return word.at(0);
   return "number";
};

const fill = async (dict: IDictionary) => {
   if (!dict.input) return dict;
   if (dict.webster_api) return dict;
   const res = await fetch(
      `${baseUrl}/${encodeURIComponent(dict.input)}?key=${apiKey}`,
   );
   if (!res.ok) return dict;
   const entries = (await res.json()) as Array<any>;
   if (typeof entries[0] === "string") return dict;
   for (const entry of entries) {
      if (entry.hwi?.prs)
         for (const pr of entry.hwi.prs)
            if (pr.sound?.audio)
               pr.sound.audio = `${soundBase}/${getSubdirectory(pr.sound.audio)}/${pr.sound.audio}.mp3`;
      if (entry.uros)
         for (const uro of entry.uros)
            if (uro.prs)
               for (const pr of uro.prs)
                  if (pr.sound?.audio)
                     pr.sound.audio = `${soundBase}/${getSubdirectory(pr.sound.audio)}/${pr.sound.audio}.mp3`;
   }
   dict.webster_api = entries;
   dict.modified = true;
   return dict;
};

export default fill;

if (import.meta.main)
   for (const word of Deno.args) console.log(await fill({ input: word }));
