const baseUrl = "https://www.merriam-webster.com/dictionary";
const mp3Regex =
   /"contentURL": "(https:\/\/media.merriam-webster.com\/audio\/prons\/en\/us\/.+?mp3)"/;

const websterWeb = async (word: string): Promise<any> => {
   const resp = await fetch(`${baseUrl}/${word}`);
   if (!resp.ok) throw resp;
   const sound = (await resp.text())?.match(mp3Regex)?.[1];
   if (sound) return { sound };
};

export default websterWeb;

if (import.meta.main)
   for (const word of Deno.args) console.log(await websterWeb(word));