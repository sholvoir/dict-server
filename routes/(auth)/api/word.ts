import { Handlers } from "$fresh/server.ts";
import { badRequest, notFound, ok, internalServerError } from '@sholvoir/generic/http';
import { IDictP } from "../../../lib/common.ts";

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');

const getWordN = (url: string) => new URL(url).searchParams.get('q');

export const handler: Handlers = {
    async PUT(req) {
        try {
            const wordN = getWordN(req.url);
            if (!wordN) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            await kv.set([category, wordN], value);
            kv.close();
            return ok;
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async PATCH(req) {
        try {
            const wordN = getWordN(req.url);
            if (!wordN) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const value = await req.json();
            const key = [category, wordN];
            const res = await kv.get(key);
            await kv.set(key, {...(res.value as IDictP), ...value});
            kv.close();
            return ok;
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    },
    async DELETE(req) {
        try {
            const wordN = getWordN(req.url);
            if (!wordN) return badRequest;
            const kv = await Deno.openKv(kvPath);
            const key = [category, wordN];
            const res = await kv.get(key);
            if (res.value) {
                await kv.delete(key);
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
