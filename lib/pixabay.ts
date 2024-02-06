import { type IDict } from './idict.ts';

const baseUrl = 'https://pixabay.com/api/';
const key = Deno.env.get('PIXABAY_KEY');
export const getPic = async (word: string): Promise<IDict> => {
    const resp = await fetch(`${baseUrl}?key=${key}&q=${encodeURIComponent(word)}&orientation=horizontal`);
    if (resp.ok) {
        const content = await resp.json();
        if (content.hits?.length) return { pic:  content.hits[0].previewURL.replace('_150.', '_1280.') };
    }
    return {};
}

if (import.meta.main) console.log(await getPic(Deno.args[0]));