import { Md5 } from "https://deno.land/std@0.95.0/hash/md5.ts";

const md5 = new Md5();
const server = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
const appid = Deno.env.get('BAIDU_APPID');
const secret = Deno.env.get('BAIDU_SECRET');

export async function trans(en: string): Promise<string|undefined> {
    const salt = Math.floor(Math.random() * 1000);
    const sign = md5.update(`${appid}${en}${salt}${secret}`).toString();
    console.log(sign);
    const response = await fetch(`${server}?q=${encodeURIComponent(en)}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${sign}`);
    if (response.ok) {
        const result = await response.json();
        console.log(result);
        return result.trans_result && result.trans_result[0].dst;
    }
}