import AIP from 'baidu-aip';
import { IDict } from "./idict.ts";

const appid = Deno.env.get('BAIDU_AIP_APPID');
const apikey = Deno.env.get('BAIDU_AIP_API_KEY');
const secret = Deno.env.get('BAIDU_AIP_SECRET');

const client = new AIP.speech(appid, apikey, secret);

export async function getSound(text: string): Promise<IDict> {
    const result = await client.text2audio(text);
    return result.data ? { sound: `data:audio/mpeg;base64,${result.data.toString('base64')}` } : {};
}

if (import.meta.main) for (const text of Deno.args) console.log(await getSound(text));