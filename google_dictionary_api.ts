interface Phonetic {
    text: string;
    audio: string;
}

export async function getSound(word: string, lang: 'US'|'GB') : Promise<Phonetic|undefined> {
    const entries = await (await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_${lang}/${encodeURIComponent(word)}`)).json();
    if (Array.isArray(entries) && entries[0].phonetics.length) return entries[0].phonetics[0];
}