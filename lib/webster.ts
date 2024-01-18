const baseUrl = 'https://www.merriam-webster.com/dictionary';

const mp3Regex = new RegExp(`"contentURL": "(https://media.merriam-webster.com/audio/prons/en/us/.+?mp3)"`);
export const getSound = async (word: string) => {
    const resp = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (!resp.ok) return undefined;
    const text = await resp.text();
    const m = text.match(mp3Regex);
    if (m) return m[1];
}

if (import.meta.main) console.log(await getSound(Deno.args[0]));