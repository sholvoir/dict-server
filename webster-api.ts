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

const websterApi = async (word: string): Promise<Array<any>> => {
   const res = await fetch(`${baseUrl}/${word}?key=${apiKey}`);
   if (!res.ok) throw res;
   const entries = (await res.json()) as Array<any>;
   if (typeof entries[0] === 'string') return entries;
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
   return entries;
};

export default websterApi;

if (import.meta.main)
   for (const word of Deno.args) console.log(await websterApi(word));