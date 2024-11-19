// deno-lint-ignore-file no-explicit-any
import { IDict } from "./idict.ts";

const baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const filenameRegExp = new RegExp(`^https://.+?/([\\w'_-]+.(mp3|ogg))$`);

async function getDict(word: string): Promise<IDict|null> {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const entries = await res.json();
    const phonetics = entries.flatMap((e: any) => e.phonetics) as any[];
    const result: IDict = { phonetic: entries?.[0]?.phonetic };
    if (!phonetics.length) return result;
    let oscore = 5;
    for (const ph of phonetics) {
        let score = 10;
        if (ph.audio) {
            const m = ph.audio.match(filenameRegExp);
            if (m) {
                const fileName = m[1] as string;
                if (fileName) {
                    if (fileName.includes('-us')) score++;
                    if (fileName.includes('-uk')) score--;
                    if (fileName.includes('-au')) score--;
                    if (fileName.includes('-stressed')) score++;
                    if (fileName.includes('-unstressed')) score--;
                } else score = 6;
            } else score = 6;
        } else score = 6;
        if (score > oscore) {
            if (ph.text) result.phonetic = ph.text;
            if (ph.audio) result.sound = ph.audio;
            oscore = score;
        }
    }
    let def = '';
    for (const entry of entries) if (entry.meanings) for (const meaning of entry.meanings) {
        def += `${meaning.partOfSpeech}\n`;
        if (meaning.definitions) for (const definition of meaning.definitions)
            def += `    ${definition.definition}\n`;
    }
    result.def = def;
    return result;
}

export default getDict;

if (import.meta.main) console.log(await getDict(Deno.args[0]));
