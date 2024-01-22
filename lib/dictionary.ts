// deno-lint-ignore-file no-explicit-any
const baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const filenameRegExp = new RegExp(`^https://.+?/([\\w'_-]+.(mp3|ogg))$`);

export async function sound(word: string) {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (!res.ok) return undefined;
    const entries = await res.json();
    const phonetics = entries.flatMap((e: any) => e.phonetics) as any[];
    if (!phonetics.length) return undefined;
    let pho = { score: 5, text: entries[0].phonetic } as any;
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
        ph.score = score;
        if (score > pho.score) pho = ph;
    }
    return { phonetic: pho.text, audio: pho.audio };
}

if (import.meta.main) console.log(await sound(Deno.args[0]));
