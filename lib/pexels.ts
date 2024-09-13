import { type IDict } from './idict.ts';

const baseUrl = 'https://api.pexels.com/v1/search';
const requestInit: RequestInit = { headers: new Headers({"Authorization": Deno.env.get('PEXELS_KEY')!}) };

const getPic = async (word: string): Promise<IDict> => {
    const resp = await fetch(`${baseUrl}?query=${encodeURIComponent(word)}&orientation=portrait&per_page=80`, requestInit);
    if (!resp.ok) return {};
    const content = await resp.json();
    if (!content.photos) return {};
    const random = Math.floor(Math.random() * content.photos.length)
    return { pic:  content.photos[random].src.portrait };
}

export default getPic;

if (import.meta.main) console.log(await getPic(Deno.args[0]));