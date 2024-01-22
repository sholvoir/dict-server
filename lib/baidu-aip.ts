import AIP from 'baidu-aip';

const appid = Deno.env.get('BAIDU_AIP_APPID');
const apikey = Deno.env.get('BAIDU_AIP_API_KEY');
const secret = Deno.env.get('BAIDU_AIP_SECRET');

const client = new AIP.speech(appid, apikey, secret);

export async function speech(text: string){
    const result = await client.text2audio(text);
    if (result.data) {
        console.log(result.data.toString('base64'));
        return `data:audio/mpeg;base64,${result.data.toString('base64')}`;
    }
}

if (import.meta.main) for (const text of Deno.args) console.log(await speech(text));