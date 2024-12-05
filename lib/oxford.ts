import { DOMParser } from '@b-fuze/deno-dom';
import { IDictP } from "./common.ts";

const baseUrl = 'https://www.oxfordlearnersdictionaries.com/us/definition/american_english/';

async function fillDict(dict: IDictP, word: string): Promise<void> {
    const reqInit = { headers: { 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'} }
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}_1?q=${word}`, reqInit);
    if (!res.ok) return;
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const div = doc.querySelector('div.audio_play_button.pron-usonly');
    const span = div?.previousSibling;
    if (span?.childNodes) for (const node of span?.childNodes) {
        if (node.nodeType == node.TEXT_NODE) {
            dict.modified = dict.phonetic = `/${node.textContent}/`;
            break;
        }
    }
    dict.modified = dict.sound = div?.getAttribute('data-src-mp3')!;
}

export default fillDict;

if (import.meta.main) {
    const dict = {};
    for (const en of Deno.args)
        console.log(await fillDict(dict, en));
}