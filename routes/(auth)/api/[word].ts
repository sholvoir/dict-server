import { Handlers, STATUS_CODE } from "$fresh/server.ts";
import { IDict } from "../../../lib/idict.ts";
import { getAll as youdaoAll } from '../../../lib/youdao.ts';
import { getPhoneticSound as dictPhoneticSound } from "../../../lib/dictionary.ts";
import { getSound as websterSound } from "../../../lib/webster.ts";
import { blobToBase64 } from '../../../lib/blob.ts'

const resInit = { headers: { "Content-Type": "application/json" } };
const category = 'dict';
const badRequest = new Response(undefined, { status: STATUS_CODE.BadRequest });
const notFound = new Response(undefined, { status: STATUS_CODE.NotFound });
const ok = new Response(undefined, { status: STATUS_CODE.OK });
const internalServerError = new Response(undefined, { status: STATUS_CODE.InternalServerError });
const old = /^[^\w]/;

export const handler: Handlers = {
    async GET(_req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv();
            const res = await kv.get([category, word]);
            const value = res.value as IDict;
            if (!value) return notFound;
            if (value.trans?.match(old)) value.trans = '';
            if (value.sound?.startsWith('https://www.oxfordlearnersdictionaries.com')) value.sound = '';
            let modified = false;
            if (!value.sound && (value.sound = (await websterSound(word)).sound)) modified = true;
            if (!value.trans || !value.phonetic || !value.sound) {
                const dict = await youdaoAll(word);
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
                if (!value.trans && (value.trans = dict.trans)) modified = true;
                if (!value.sound && (value.sound = dict.sound)) modified = true;
            }
            if (!value.sound || !value.phonetic) {
                const dict = await dictPhoneticSound(word);
                if (!value.sound && (value.sound = dict.sound)) modified = true;
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
            }
            if (value.sound?.startsWith('http')) {
                const resp = await fetch(value.sound);
                if (resp.ok) value.sound = await blobToBase64(await resp.blob());
                modified = true;
            }
            if (modified) await kv.set([category, word], value);
            kv.close();
            return new Response(JSON.stringify(value), resInit);
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
        
    },
    async PUT(req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv();
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
            const kv = await Deno.openKv();
            const value = await req.json();
            const res = await kv.get([category, word]);
            await kv.set([category, word], {...(res.value as IDict), ...value});
            kv.close();
            return new Response(undefined, { status: 200 });
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async DELETE(_req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv();
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
