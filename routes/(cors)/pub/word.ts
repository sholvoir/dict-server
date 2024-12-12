import { Handlers } from "$fresh/server.ts";
import { badRequest, internalServerError, jsonResponse } from '@sholvoir/generic/http';
import { IDictP } from "../../../lib/common.ts";
import fill from '../../../lib/fill-dict.ts';

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');
const spliteNum = /^([A-Za-zèé /&''.-]+)(\d*)/;

export const handler: Handlers = {
    async GET(req) {
        try {
            const wordN = new URL(req.url).searchParams.get('q');
            if (!wordN) return badRequest;
            const m = spliteNum.exec(wordN);
            if (!m) return badRequest;
            const word = m[1];
            // Read
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get<IDictP>([category, wordN]);
            const dict = res.value ?? {};
            if (!dict.def || !dict.phonetic || !dict.pic || !dict.sound || !dict.trans) await fill(dict, word);
            // Write
            if (dict.modified && res.value) {
                delete dict.modified;
                await kv.set([category, wordN], dict);
            }
            kv.close();
            return jsonResponse(dict);
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    }
};
