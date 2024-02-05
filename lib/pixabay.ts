import { type IDict } from './idict.ts';
import { urlToDataUrl } from './blob.ts'

const baseUrl = 'https://pixabay.com/api/';
const key = Deno.env.get('PIXABAY_KEY');
export const getPic = async (word: string): Promise<IDict> => {
    const resp1 = await fetch(`${baseUrl}?key=${key}&q=${encodeURIComponent(word)}`);
    if (resp1.ok) {
        const content = await resp1.json();
        if (content.hits?.length) {
            const url = content.hits[0].webformatURL;
            if (url) {
                const pic = await urlToDataUrl(url);
                if (pic) return { pic }
            }
        }
    }
    return {};
}

if (import.meta.main) console.log(await getPic(Deno.args[0]));