import { Handlers, STATUS_CODE } from "$fresh/server.ts";
import { IDict } from "../../../lib/idict.ts";
import { getPhoneticTrans as youdaoPhoneticTrans } from '../../../lib/youdao.ts';
import { getPhoneticSound as dictPhoneticSound } from "../../../lib/dictionary.ts";
import { getSound as websterSound } from "../../../lib/webster.ts";

const resInit = { headers: { "Content-Type": "application/json" } };
const key = 'dict.sholvoir.com';
const badRequest = new Response(undefined, { status: STATUS_CODE.BadRequest });
const notFound = new Response(undefined, { status: STATUS_CODE.NotFound });
const ok = new Response(undefined, { status: STATUS_CODE.OK });
const internalServerError = new Response(undefined, { status: STATUS_CODE.InternalServerError });

export const handler: Handlers = {
    async GET(_req, ctx) {
        try {
            const word = decodeURIComponent(ctx.params.word.trim());
            if (!word) return badRequest;
            const kv = await Deno.openKv();
            const res = await kv.get([key, word]);
            const value = res.value as IDict;
            if (!value) return notFound;
            let modified = false;
            if (!value.trans || !value.phonetic) {
                const dict = await youdaoPhoneticTrans(word);
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
                if (!value.trans && (value.trans = dict.trans)) modified = true;
            }
            if (!value.sound && (value.sound = (await websterSound(word)).sound)) modified = true;
            if (!value.sound || !value.phonetic) {
                const dict = await dictPhoneticSound(word);
                if (!value.sound && (value.sound = dict.sound)) modified = true;
                if (!value.phonetic && (value.phonetic = dict.phonetic)) modified = true;
            }
            if (modified) await kv.set([key, word], value);
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
            await kv.set([key, word], value);
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
            const res = await kv.get([key, word]);
            await kv.set([key, word], {...(res.value as IDict), ...value});
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
            const res = await kv.get([key, word]);
            if (res.value) {
                await kv.delete([key, word]);
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
