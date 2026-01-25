// export const googleTtsBaseUrl =
//    "https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=en&client=tw-ob"; //&q=ir

const baseUrl = "https://dict.youdao.com/jsonapi";
const audioBase = "https://dict.youdao.com/dictvoice?audio="; //complete&type=2

const youdao = async (word: string): Promise<any> => {
   const resp = await fetch(`${baseUrl}?q=${word}`);
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
         if (word.ukspeech) word.ukspeech = `${audioBase}${word.ukspeech}`;
         if (word.usspeech) word.usspeech = `${audioBase}${word.usspeech}`;
      }
   if (root.ec?.word?.length)
      for (const word of root.ec.word) {
         if (word.ukspeech) word.ukspeech = `${audioBase}${word.ukspeech}`;
         if (word.usspeech) word.usspeech = `${audioBase}${word.usspeech}`;
      }
   return root;
};

export default youdao;

if (import.meta.main)
   for (const word of Deno.args) console.log(await youdao(word));