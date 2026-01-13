// export const googleTtsBaseUrl =
//    "https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=en&client=tw-ob"; //&q=ir

const youdaoBaseUrl = "https://dict.youdao.com/jsonapi";
const youdaoAudio = "https://dict.youdao.com/dictvoice?audio="; //complete&type=2
const youdao = async (word: string): Promise<any> => {
   const resp = await fetch(`${youdaoBaseUrl}?q=${word}`);
   if (!resp.ok) throw resp;
   const root = await resp.json();
   const needDelete = new Set([
      "oxfordAdvanceHtml",
      "oxfordAdvanceTen",
      "oxfordAdvance",
      "oxford",
      "webster",
      "senior",
   ]);
   root.meta.dicts = root.meta.dicts.filter(
      (x: string) => !needDelete.has(x) && x !== "meta",
   );
   for (const dictName of needDelete) if (root[dictName]) delete root[dictName];
   if (root.simple?.word?.length)
      for (const word of root.simple.word) {
         if (word.ukspeech) word.ukspeech = `${youdaoAudio}${word.ukspeech}`;
         if (word.usspeech) word.usspeech = `${youdaoAudio}${word.usspeech}`;
      }
   if (root.ec?.word?.length)
      for (const word of root.ec.word) {
         if (word.ukspeech) word.ukspeech = `${youdaoAudio}${word.ukspeech}`;
         if (word.usspeech) word.usspeech = `${youdaoAudio}${word.usspeech}`;
      }
   return root;
};

const freeDictionaryApiBaseUrl =
   "https://api.dictionaryapi.dev/api/v2/entries/en";
const freeDictionaryApi = async (word: string): Promise<any> => {
   const res = await fetch(`${freeDictionaryApiBaseUrl}/${word}`);
   if (!res.ok) throw res;
   return await res.json();
};

const websterApiBaseUrl =
   "https://www.dictionaryapi.com/api/v3/references/collegiate/json";
const websterSoundBase =
   "https://media.merriam-webster.com/audio/prons/en/us/mp3";
const websterApiKey = Deno.env.get("DICTIONARY_API_COM_DICTIONARY");
const websterRegex = /^[A-Za-z]/;
const getSubdirectory = (word: string) => {
   if (word.startsWith("bix")) return "bix";
   if (word.startsWith("gg")) return "gg";
   if (websterRegex.test(word)) return word.at(0);
   return "number";
};
const websterApi = async (word: string): Promise<Array<any>> => {
   const res = await fetch(
      `${websterApiBaseUrl}/${word}?key=${websterApiKey}`,
   );
   if (!res.ok) throw res;
   const entries = (await res.json()) as Array<any>;
   for (const entry of entries) {
      if (entry.hwi?.prs)
         for (const pr of entry.hwi.prs)
            if (pr.sound?.audio)
               pr.sound.audio = `${websterSoundBase}/${getSubdirectory(pr.sound.audio)}/${pr.sound.audio}.mp3`;
      if (entry.uros)
         for (const uro of entry.uros)
            if (uro.prs)
               for (const pr of uro.prs)
                  if (pr.sound?.audio)
                     pr.sound.audio = `${websterSoundBase}/${getSubdirectory(pr.sound.audio)}/${pr.sound.audio}.mp3`;
   }
   return entries;
};

const websterWebBaseUrl = 'https://www.merriam-webster.com/dictionary';
const websterMp3Regex = /"contentURL": "(https:\/\/media.merriam-webster.com\/audio\/prons\/en\/us\/.+?mp3)"/;
const websterWeb = async (word: string): Promise<string | undefined> => {
    const resp = await fetch(`${websterWebBaseUrl}/${word}`);
    if (!resp.ok) throw resp;
    return (await resp.text())?.match(websterMp3Regex)?.[1];
}

Deno.serve(async (req) => {
   const url = new URL(req.url);
   const word = url.searchParams.get("q");
   if (!word) return new Response(null, { status: 400 });
   const encodeWord = encodeURIComponent(word);
   try {
      // Youdao
      const result = await youdao(encodeWord);
      // freeDictionaryApi
      const fd = await freeDictionaryApi(word);
      if (Array.isArray(fd)) {
         result.meta.dicts.push("free_dictionary_api");
         result.free_dictionary_api = fd;
      }
      // websterApi
      const wa = await websterApi(word);
      if (wa.length) {
         result.meta.dicts.push("webster_api");
         result.webster_api = wa;
      }
      // websterWeb
      const ww = await websterWeb(word);
      if (ww) {
         result.meta.dicts.push("webster_web");
         result.webster_web = {
            sound: ww,
         };
      }
      return new Response(JSON.stringify(result), {
         headers: { "content-type": "application/json" },
      });
   } catch (e) {
      if (e instanceof Response) return e;
      else return new Response(null, { status: 500 });
   }
});
