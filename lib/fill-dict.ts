import { IDictP } from "./common.ts";
import dictionary from "./dictionary.ts";
import oxford from "./oxford.ts";
import websterApi from "./webster-api.ts";
import websterWeb from "./webster-web.ts";
import youdao from "./youdao.ts";

export default async (dict: IDictP, word: string) => {
    // Webster-api
    if (!dict.sound) await websterApi(dict, word);
    // Webster-web
    if (!dict.sound) await websterWeb(dict, word);
    // Oxford
    if (!dict.phonetic || !dict.sound) await oxford(dict, word);
    // Youdao
    if (!dict.trans || !dict.phonetic || !dict.sound) await youdao(dict, word);
    // Google Dictionary
    if (!dict.sound || !dict.phonetic || !dict.def) await dictionary(dict, word);
}