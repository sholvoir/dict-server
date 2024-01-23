import { IDict } from "./idict.ts";
import { MD5 } from "./md5.js";

const server = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
const appid = Deno.env.get('BAIDU_APPID');
const secret = Deno.env.get('BAIDU_SECRET');
let lastCall = 0;

export async function getTrans(en: string): Promise<IDict> {
    while (Date.now() - lastCall < 1080) await new Promise(r => setTimeout(r, Date.now() - lastCall));
    lastCall = Date.now();
    const sign = MD5(`${appid}${en}${lastCall}${secret}`);
    const response = await fetch(`${server}?q=${encodeURIComponent(en)}&from=en&to=zh&appid=${appid}&salt=${lastCall}&sign=${sign}`);
    lastCall = Date.now();
    return response.ok ? { trans: (await response.json()).trans_result?.[0]?.dst } : {};
}

if (import.meta.main) for (const en of Deno.args) console.log(await getTrans(en));