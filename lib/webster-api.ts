// deno-lint-ignore-file no-explicit-any
import { IDict } from "./idict.ts";

const baseUrl = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json';
const soundBase = 'https://media.merriam-webster.com/audio/prons/en/us/mp3'
const key = Deno.env.get('DICTIONARY_API_COM_DICTIONARY');
const regex = /^[A-Za-z]/
const getSubdirectory = (word: string) => {
    if (word.startsWith('bix')) return 'bix';
    if (word.startsWith('gg')) return 'gg';
    if (regex.test(word)) return word.at(0);
    return 'number';
}

async function getDict(word: string): Promise<IDict|null> {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}?key=${key}`);
    if (!res.ok) return null;
    const entries = await res.json() as Array<any>;
    const entry = entries[0];
    if (typeof entry === 'string') return null;
    const pr = entry.hwi?.prs?.at(0);
    const result: IDict = {};
    if (pr.mw) result.phonetic = `[${pr.mw}]`;
    if (pr.sound?.audio) result.sound = `${soundBase}/${getSubdirectory(pr.sound.audio)}/${pr.sound.audio}.mp3`;
    return result;
}

export default getDict;

if (import.meta.main) console.log(await getDict(Deno.args[0]));