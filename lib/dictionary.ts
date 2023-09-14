const baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export async function getSound(word: string) {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    let phonetic = '';
    let audio = '';
    if (res.status >= 200 && res.status <= 299) {
        const entries = await res.json();
        if (Array.isArray(entries)) for (const entry of entries) {
            phonetic ||= entry.phonetic;
            if (entry.phonetics && Array.isArray(entry.phonetics)) for (const ph of entry.phonetics.reverse()) {
                phonetic ||= ph.text;
                audio ||= ph.audio;
            }
        }
    }
    return { phonetic, audio };
}
