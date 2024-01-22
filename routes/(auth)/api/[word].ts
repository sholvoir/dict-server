import { Handlers, STATUS_CODE } from "$fresh/server.ts";
import { IDict } from "../../../lib/idict.ts";
import { trans as baiduTrans } from '../../../lib/baibu.ts';
import { trans as youdaoTrans } from '../../../lib/youdao.ts';
import { sound as dictGetSound } from "../../../lib/dictionary.ts";
import { sound as websterGetSound } from "../../../lib/webster.ts";
import { speech as baiduSpeech } from '../../../lib/baidu-aip.ts';

const resInit = { headers: { "Content-Type": "application/json" } };
const key = 'dict.sholvoir.com';
const badRequest = new Response(undefined, { status: STATUS_CODE.BadRequest });
const notFound = new Response(undefined, { status: STATUS_CODE.NotFound });
const ok = new Response(undefined, { status: STATUS_CODE.OK });

export const handler: Handlers = {
    async GET(_req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return badRequest;
        const kv = await Deno.openKv();
        const res = await kv.get([key, word]);
        const value = res.value as IDict;
        if (!value) return notFound;
        let modified = false;
        if (!value.trans && (value.trans = await youdaoTrans(word))) modified = true;
        if (!value.trans && (value.trans = await baiduTrans(word))) modified = true;
        if (!value.sound && (value.sound = await websterGetSound(word))) modified = true;
        if (!value.sound || !value.phonetic) {
            const sound = await dictGetSound(word);
            if (!value.sound && (value.sound = sound?.audio)) modified = true;
            if (!value.phonetic && (value.phonetic = sound?.phonetic)) modified = true;
        }
        if (!value.sound && (value.sound = await baiduSpeech(word))) modified = true;
        if (modified) await kv.set([key, word], value);
        kv.close();
        return new Response(JSON.stringify(value), resInit);
    },
    async PUT(req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return badRequest;
        const kv = await Deno.openKv();
        const value = await req.json();
        await kv.set([key, word], value);
        kv.close();
        return ok;
    },
    async PATCH(req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return badRequest;
        const kv = await Deno.openKv();
        const value = await req.json();
        const res = await kv.get([key, word]);
        await kv.set([key, word], {...(res.value as IDict), ...value});
        kv.close();
        return new Response(undefined, { status: 200 });
    },
    async DELETE(_req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return badRequest;
        const kv = await Deno.openKv();
        const res = await kv.get([key, word]);
        if (res.value) {
            await kv.delete([key, word]);
            kv.close();
            return ok;
        } else {
            kv.close();
            return notFound;
        }
    }
};
