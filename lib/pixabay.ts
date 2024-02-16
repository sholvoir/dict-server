import { type IDict } from './idict.ts';

const baseUrl = 'https://pixabay.com/api/';
const key = Deno.env.get('PIXABAY_KEY');
export const getPic = async (word: string): Promise<IDict> => {
    const resp = await fetch(`${baseUrl}?key=${key}&q=${encodeURIComponent(word)}&orientation=vertical&safesearch=1`);
    if (resp.ok) {
        const content = await resp.json();
        if (content.hits?.length) {
            const random = Math.floor(Math.random() * content.hits.length)
            return { pic:  content.hits[random].previewURL.replace('_150.', '_1280.') };
        }
    }
    return { pic: 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg' };
}

if (import.meta.main) console.log(await getPic(Deno.args[0]));