const baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
interface Phonetic {
    text: string;
    audio: string;
}

export async function getSound(word: string) {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(word)}`);
    if (res.status >= 200 && res.status <= 299) {
        const entries = await res.json();
        if (Array.isArray(entries)) {
            let text = '';
            l1: for (const entry of entries)
                if (entry.phonetics && Array.isArray(entry.phonetics))
                    for (const phonetic of entry.phonetics)
                        if (phonetic.text) { text = phonetic.text; break l1; }
            let audio = '';
            l2: for (const entry of entries)
                if (entry.phonetics && Array.isArray(entry.phonetics))
                    for (const phonetic of entry.phonetics)
                        if (phonetic.audio) { audio = phonetic.audio; break l2; }
            return { text, audio } as Phonetic;
        }
    }
}
