import { IDictP } from "./common.ts";

const baseUrl = 'https://www.merriam-webster.com/dictionary';
const mp3Regex = new RegExp(`"contentURL": "(https://media.merriam-webster.com/audio/prons/en/us/.+?mp3)"`);

const fillDict = async (dict: IDictP, word: string): Promise<void> => {
    const resp = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (resp.ok) dict.modified = dict.sound = (await resp.text())?.match(mp3Regex)?.[1];
}

export default fillDict;

if (import.meta.main) {
    const dict = {};
    await fillDict(dict, Deno.args[0])
    console.log(dict);
}