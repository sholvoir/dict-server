// deno-lint-ignore-file no-explicit-any
import { Handlers, STATUS_CODE } from "$fresh/server.ts";
import { trans } from '../../../lib/baibu.ts';
import { getSound } from "../../../lib/dictionary.ts";
import { IDict } from "../../../lib/idict.ts";

const resInit = { headers: {
    "Content-Type": "application/json",
    "Cache-Control": `max-age=${24*60*60}`
} };
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
        let modified = false;
        if (!value) return notFound;
        if (!value.trans) {
            value.trans = await trans(word);
            modified = true;
        }
        if (!value.sound || !value.phonetic) {
            const sound = await getSound(word);
            if (!value.sound) value.sound = sound.audio;
            if (!value.phonetic) value.phonetic = sound.phonetic;
            modified = true;
        }
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
        await kv.set([key, word], {...(res.value as any), ...value});
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
