import type { IDictionary } from "./idict.ts";

const baseUrl = "https://www.merriam-webster.com/dictionary";
const version = 1;
const mp3Regex =
   /"contentURL": "(https:\/\/media.merriam-webster.com\/audio\/prons\/en\/us\/.+?mp3)"/;

const fill = async (dict: IDictionary) => {
   if (!dict.input) return dict;
   if (dict.webster_web && dict.webster_web.version >= version) return dict;
   const resp = await fetch(`${baseUrl}/${dict.input}`);
   if (!resp.ok) return dict;
   const sound = (await resp.text())?.match(mp3Regex)?.[1];
   if (sound) {
      dict.webster_web = { version, sound };
      dict.modified = true;
   }
   return dict;
};

export default fill;

if (import.meta.main)
   for (const word of Deno.args) console.log(await fill({ input: word }));
