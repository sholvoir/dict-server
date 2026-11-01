import { DOMParser } from "@b-fuze/deno-dom";
import type { IEntry, IPronounce } from "./i-webster-web.ts";
import type { IDictionary } from "./idictionary.ts";
import { getWebsterSound } from "./webster-sound.ts";

const baseUrl = "https://www.merriam-webster.com/dictionary";
const version = 2;

const fill = async (dict: IDictionary, userAgent: string) => {
   if (!dict.input) return dict;
   if ((dict.webster_web?.version ?? 0) >= version) return dict;
   const res = await fetch(`${baseUrl}/${dict.input}`, {
      headers: { "User-Agent": userAgent },
   });
   dict.webster_web = { word: dict.input, version };
   if (res.ok) {
      const entries: Array<IEntry> = [];
      const doc = new DOMParser().parseFromString(
         await res.text(),
         "text/html",
      );
      let index = 0;
      while (++index) {
         const entryDiv = doc.getElementById(`dictionary-entry-${index}`);
         if (!entryDiv) break;
         const headerDiv = entryDiv.querySelector(
            ".entry-header.simple-definitions-header",
         );
         const headerContentDiv = headerDiv?.querySelector(
            ".entry-header-content",
         );
         if (!headerContentDiv) continue;
         const hword = headerContentDiv.querySelector(".hword")?.textContent;
         const partsOfSpeech =
            headerContentDiv.querySelector("h2.parts-of-speech")?.textContent;
         const entry: IEntry = { hword, partsOfSpeech };
         const syllablesPronsDiv = headerDiv?.querySelector(
            ".word-syllables-prons-header-content",
         );
         if (syllablesPronsDiv) {
            const prons: Array<IPronounce> = [];
            for (const a of syllablesPronsDiv.querySelectorAll(
               "a.prons-entry-list-item",
            )) {
               const phonetic = a.firstChild?.textContent.trim();
               const file = a.getAttribute("data-file");
               const dir = a.getAttribute("data-dir");
               const sound = file ? getWebsterSound(file, dir) : undefined;
               if (phonetic || sound) {
                  const pron: IPronounce = {};
                  if (phonetic) pron.phonetic = `[${phonetic}]`;
                  if (sound) pron.sound = sound;
                  prons.push(pron);
               }
            }
            if (prons.length) entry.prons = prons;
         }
         entries.push(entry);
      }
      if (entries.length) dict.webster_web.entries = entries;
   }
   dict.modified = true;
   return dict;
};

export default fill;

if (import.meta.main) {
   const userAgent =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
   for (const word of Deno.args)
      console.log(
         JSON.stringify(await fill({ input: word }, userAgent), undefined, 2),
      );
}
