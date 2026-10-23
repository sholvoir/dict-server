const websterRegex = /^[A-Za-z]/;
const soundBase = "https://media.merriam-webster.com/audio/prons/en/us/mp3";

export const getWebsterSound = (word: string) => {
   let subdirectory = "number";
   if (word.startsWith("bix")) subdirectory = "bix";
   if (word.startsWith("gg")) subdirectory = "gg";
   if (websterRegex.test(word)) subdirectory = word.at(0)!;
   return `${soundBase}/${subdirectory}/${word}.mp3`;
};
