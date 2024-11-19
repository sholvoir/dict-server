// deno-lint-ignore-file no-cond-assign
import { Handlers } from "$fresh/server.ts";
import { badRequest, notFound, ok, internalServerError, jsonResponse } from '@sholvoir/generic/http';
import { blobToBase64 } from "@sholvoir/generic/blob";
import { IDict } from "../../../lib/idict.ts";
import youdao from '../../../lib/youdao.ts';
import dictionary from "../../../lib/dictionary.ts";
import websterWeb from "../../../lib/webster-web.ts";
import websterApi from "../../../lib/webster-api.ts";
import pexels from "../../../lib/pexels.ts";
import pixabay from '../../../lib/pixabay.ts';

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');
const spliteNum = /^([A-Za-zèé /&''.-]+)(\d*)/;

export const handler: Handlers = {
    async GET(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const m = spliteNum.exec(word);
            if (!m) return notFound;
            const rword = m[1];
            // Read
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get([category, word]);
            const item = (res.value ?? {}) as IDict
            let modified = false;
            // Webster API
            if (!item.phonetic || !item.sound) {
                const dict = await websterApi(rword);
                if (!item.phonetic && (item.phonetic = dict?.phonetic)) modified = true;
                if (!item.sound &&(item.sound = dict?.sound)) modified = true;
            }
            // Webster Web
            if (!item.sound) {
                const dict = await websterWeb(rword);
                if (item.sound = dict?.sound) modified = true;
            }
            // Google Dictionary
            if (!item.sound || !item.phonetic || !item.def) {
                const dict = await dictionary(rword);
                if (!item.sound && (item.sound = dict?.sound)) modified = true;
                if (!item.phonetic && (item.phonetic = dict?.phonetic)) modified = true;
                if (!item.def && (item.def = dict?.def)) modified = true;
            }
            // Youdao
            if (!item.trans || !item.phonetic || !item.sound) {
                const dict = await youdao(rword);
                if (!item.phonetic && (item.phonetic = dict?.phonetic)) modified = true;
                if (!item.trans && (item.trans = dict?.trans)) modified = true;
                if (!item.sound && (item.sound = dict?.sound)) modified = true;
            }
            // Picture
            if (!item.pic && (item.pic = (await pexels(rword))?.pic)) modified = true;
            if (!item.pic && (item.pic = (await pixabay(rword))?.pic)) modified = true;
            if (!item.pic && (item.pic = (await pexels('beautiful lady'))?.pic)) modified = true;
            if (!item.pic && (item.pic = (await pixabay('beautiful lady'))?.pic)) modified = true;
            if (!item.pic && (item.pic = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')) modified = true;
            // Write
            if (modified && res.value) await kv.set([category, word], item);
            kv.close();
            // Get Sound Data
            if (item.sound?.startsWith('http')) {
                const reqInit = { headers: { 'User-Agent': req.headers.get('User-Agent') || 'Thunder Client (https://www.thunderclient.com)'} }
                const resp = await fetch(item.sound, reqInit);
                if (resp.ok) item.sound = await blobToBase64(await resp.blob());
                else console.log(resp.status, await resp.text());
            }
            return jsonResponse(item);
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
            await kv.set([category, word], {...(res.value as IDict), ...value});
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
