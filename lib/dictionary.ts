// deno-lint-ignore-file no-explicit-any
import { IDictP } from "./common.ts";

const baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const filenameRegExp = new RegExp(`^https://.+?/([\\w'_-]+.(mp3|ogg))$`);

async function fillDict(dict: IDictP, word: string): Promise<void> {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (!res.ok) return;
    const entries = await res.json();
    const phonetics = entries.flatMap((e: any) => e.phonetics) as any[];
    if ((!dict.phonetic || !dict.sound)) {
        let oscore = 5;
        for (const entry of entries) if (entry.phonetics) for (const ph of phonetics) {
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
                if (ph.text) dict.modified = dict.phonetic = ph.text;
                if (ph.audio) dict.modified = dict.sound = ph.audio;
                oscore = score;
            }
        }
    }
    if (!dict.def) {
        let def = '';
        for (const entry of entries) if (entry.meanings) for (const meaning of entry.meanings) {
            def += `${meaning.partOfSpeech}\n`;
            if (meaning.definitions) for (const definition of meaning.definitions)
                def += `    ${definition.definition}\n`;
        }
        dict.modified = dict.def = def;
    }
}

export default fillDict;

if (import.meta.main) console.log(await fillDict({}, Deno.args[0]));
