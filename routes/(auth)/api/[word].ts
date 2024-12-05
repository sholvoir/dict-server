import { Handlers } from "$fresh/server.ts";
import { badRequest, notFound, ok, internalServerError, jsonResponse } from '@sholvoir/generic/http';
import { blobToBase64 } from "@sholvoir/generic/blob";
import { IDictP } from "../../../lib/common.ts";
import fill from '../../../lib/fill-dict.ts';

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');
const spliteNum = /^([A-Za-zèé /&''.-]+)(\d*)/;

export const handler: Handlers = {
    async GET(req, ctx) {
        try {
            const wordN = decodeURIComponent(ctx.params.word.trim());
            if (!wordN) return badRequest;
            const m = spliteNum.exec(wordN);
            if (!m) return notFound;
            const word = m[1];
            // Read
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([category, wordN]);
            const dict = (res.value ?? {}) as IDictP
            if (!dict.def || !dict.phonetic || !dict.pic || !dict.sound || !dict.trans) await fill(dict, word);
            // Write
            if (dict.modified && res.value) {
                delete dict.modified;
                await kv.set([category, wordN], dict);
            }
            kv.close();
            // Get Sound Data
            if (dict.sound?.startsWith('http')) {
                const reqInit = { headers: { 'User-Agent': req.headers.get('User-Agent') || 'Thunder Client (https://www.thunderclient.com)'} }
                const resp = await fetch(dict.sound, reqInit);
                if (resp.ok) dict.sound = await blobToBase64(await resp.blob());
                else console.log(resp.status, await resp.text());
            }
            return jsonResponse(dict);
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async PUT(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            await kv.set([category, word], value);
            kv.close();
            return ok;
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async PATCH(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            const res = await kv.get([category, word]);
            await kv.set([category, word], {...(res.value as IDictP), ...value});
            kv.close();
            return ok;
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async DELETE(_req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([category, word]);
            if (res.value) {
                await kv.delete([category, word]);
                kv.close();
                return ok;
            } else {
                kv.close();
                return notFound;
            }
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    }
};
