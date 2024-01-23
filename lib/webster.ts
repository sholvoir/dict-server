const baseUrl = 'https://www.merriam-webster.com/dictionary';

const mp3Regex = new RegExp(`"contentURL": "(https://media.merriam-webster.com/audio/prons/en/us/.+?mp3)"`);
export const getSound = async (word: string) => {
    const resp = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    return resp.ok ? { sound: (await resp.text())?.match(mp3Regex)?.[1] } : {};
}

if (import.meta.main) console.log(await getSound(Deno.args[0]));