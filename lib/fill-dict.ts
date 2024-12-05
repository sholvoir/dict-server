import { IDictP, NO_IMAGE } from "./common.ts";
import dictionary from "./dictionary.ts";
import oxford from "./oxford.ts";
import pexels from "./pexels.ts";
import pixabay from "./pixabay.ts";
import websterApi from "./webster-api.ts";
import websterWeb from "./webster-web.ts";
import youdao from "./youdao.ts";

export default async (dict: IDictP, word: string) => {
    // Oxford
    if (!dict.phonetic || !dict.sound) await oxford(dict, word);
    // Youdao
    if (!dict.trans || !dict.phonetic || !dict.sound) await youdao(dict, word);
    // Google Dictionary
    if (!dict.sound || !dict.phonetic || !dict.def) await dictionary(dict, word);
    // Webster-api
    if (!dict.phonetic || !dict.sound) await websterApi(dict, word);
    // Webster-web
    if (!dict.sound) await websterWeb(dict, word);
    // Picture
    if (!dict.pic) await pexels(dict, word);
    if (!dict.pic) await pixabay(dict, word);
    if (!dict.pic) await pexels(dict, 'beautiful lady');
    if (!dict.pic) await pixabay(dict, 'beautiful lady');
    if (!dict.pic) dict.modified = dict.pic = NO_IMAGE;
}