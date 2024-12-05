// deno-lint-ignore-file no-explicit-any
import { IDictP } from "./common.ts";

const baseUrl = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json';
const soundBase = 'https://media.merriam-webster.com/audio/prons/en/us/mp3';
const key = Deno.env.get('DICTIONARY_API_COM_DICTIONARY');
const regex = /^[A-Za-z]/
const getSubdirectory = (word: string) => {
    if (word.startsWith('bix')) return 'bix';
    if (word.startsWith('gg')) return 'gg';
    if (regex.test(word)) return word.at(0);
    return 'number';
}

async function fillDict(dict: IDictP, word: string): Promise<void> {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}?key=${key}`);
    if (!res.ok) return;
    const entries = await res.json() as Array<any>;
    const entry = entries[0];
    if (typeof entry === 'string') return;
    const pr = entry.hwi?.prs?.at(0);
    if (pr?.mw) dict.modified = dict.phonetic = `[${pr.mw}]`;
    if (pr?.sound?.audio) dict.modified = dict.sound = `${soundBase}/${getSubdirectory(pr.sound.audio)}/${pr.sound.audio}.mp3`;
}

export default fillDict;

if (import.meta.main) {
    const dict = {};
    await fillDict(dict, Deno.args[0]);
    console.log(dict);
}