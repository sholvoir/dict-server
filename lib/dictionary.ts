// deno-lint-ignore-file no-explicit-any
const baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const filenameRegExp = new RegExp(`^https://.+?/([\\w'_-]+.mp3)$`)

export async function getSound(word: string) {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (!res.ok) return undefined;
    const entries = await res.json();
    const phonetics = entries.flatMap((e: any) => e.phonetics) as any[];
    if (!phonetics.length) return undefined;
    let pho = { score: 0 } as any;
    for (const ph of phonetics) {
        if (!ph.audio) continue;
        let score = 10;
        const fileName = ph.audio.match(filenameRegExp)[1] as string;
        if (fileName.includes('-us')) score++;
        if (fileName.includes('-uk')) score--;
        if (fileName.includes('-au')) score--;
        if (fileName.includes('-stressed')) score++;
        if (fileName.includes('-unstressed')) score--;
        ph.score = score;
        if (score > pho.score) pho = ph;
    }
    return { phonetic: pho.text, audio: pho.audio };
}

if (import.meta.main) console.log(await getSound(Deno.args[0]));
