import { IDictP } from "./common.ts";

const baseUrl = 'https://api.pexels.com/v1/search';
const requestInit: RequestInit = { headers: new Headers({"Authorization": Deno.env.get('PEXELS_KEY')!}) };

const fillPic = async (dict: IDictP, word: string): Promise<void> => {
    const resp = await fetch(`${baseUrl}?query=${encodeURIComponent(word)}&orientation=portrait&per_page=80`, requestInit);
    if (!resp.ok) return;
    const content = await resp.json();
    if (!content.photos?.length) return;
    const random = Math.floor(Math.random() * content.photos.length)
    dict.modified = content.photos[random].src.portrait;
}

export default fillPic;

if (import.meta.main) {
    const dict = {};
    await fillPic(dict, Deno.args[0]);
    console.log(dict);
}