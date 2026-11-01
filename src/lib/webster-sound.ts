const websterRegex = /^[A-Za-z]/;
const soundBase = "https://media.merriam-webster.com/audio/prons/en/us/mp3";

export const getWebsterSound = (word: string, dir?: string | null) => {
   if (dir) return `${soundBase}/${dir}/${word}.mp3`;
   if (word.startsWith("bix")) dir = "bix";
   else if (word.startsWith("gg")) dir = "gg";
   else if (websterRegex.test(word)) dir = word.at(0)!;
   else dir = "number";
   return `${soundBase}/${dir}/${word}.mp3`;
};
