import { Handlers } from "$fresh/server.ts";
import { internalServerError, jsonResponse } from "@sholvoir/generic/http";

const catalog = 'system';
const kvPath = Deno.env.get('DENO_KV_PATH');

export const handler: Handlers = {
    async GET() {
        try {
            const kv = await Deno.openKv(kvPath);
            const res = await kv.get<string>([catalog, 'vocabulary-version']);
            const vocabularyVersion = res.value;
            return jsonResponse({vocabularyVersion});
        } catch { return internalServerError; }
    }
};