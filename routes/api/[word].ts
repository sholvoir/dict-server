// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { trans } from '/lib/baibu.ts';
import { getSound } from "/lib/dictionary.ts";
import { IDict } from "/lib/idict.ts";

const resInit = { headers: { "Content-Type": "application/json" } };
const key = 'dict.sholvoir.com';

export const handler: Handlers = {
    async GET(_req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return ctx.renderNotFound();
        const kv = await Deno.openKv();
        const res = await kv.get([key, word]);
        const value = res.value as IDict;
        let modified = false;
        if (!value) return ctx.renderNotFound();
        if (!value.trans) {
            value.trans = await trans(word);
            modified = true;
        }
        if (!value.sound) {
            const sound = await getSound(word);
            value.sound = sound.audio;
            value.phonetic = sound.phonetic;
            modified = true;
        }
        if (modified) kv.set([key, word], value);
        return new Response(JSON.stringify(value), resInit);
    },
    async PUT(req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return ctx.renderNotFound();
        const kv = await Deno.openKv();
        const value = await req.json();
        await kv.set([key, word], value);
        return new Response(undefined, { status: 200 });
    },
    async PATCH(req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return ctx.renderNotFound();
        const kv = await Deno.openKv();
        const value = await req.json();
        const res = await kv.get([key, word]);
        await kv.set([key, word], {...(res.value as any), ...value});
        return new Response(undefined, { status: 200 });
    }
};
