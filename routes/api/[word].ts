import { Handlers } from "$fresh/server.ts";
import { trans } from '../../lib/baibu.ts';
import { getSound } from "../../lib/dictionary.ts";
import * as Dict from '../../lib/dict.ts';

const resInit = { headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
}};
const optionsInit = { headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS"
}};

export const handler: Handlers = {
    OPTIONS(_) {
        return new Response(undefined, optionsInit);
    },
    async GET(_req, ctx) {
        const word = decodeURIComponent(ctx.params.word.trim());
        if (!word) return new Response('Not Found!', { status: 404 });
        const value = await Dict.get(word);
        let modified = false;
        if (!value) return new Response('Not Found!', { status: 404 });
        if (!value.trans) {
            value.trans = await trans(word);
            modified = true;
        }
        if (!value.sound) {
            const sound = await getSound(word);
            if (sound) {
                value.sound = sound.audio;
                value.phonetics = sound.text;
                modified = true;
            }
        }
        if (modified) Dict.patch(word, value);
        return new Response(JSON.stringify(value), resInit);
    },
    async POST(req, ctx) {
        const value = await req.json();
        value.word = ctx.params.word.trim();
        const num = await Dict.add(value);
        return new Response(num, { status: 200 });
    },
    async PATCH(req, ctx) {
        const word = ctx.params.word;
        const value = await req.json();
        const num = await Dict.patch(word, value);
        return new Response(num.toString(), {status: 200});
    }
};
