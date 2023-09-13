// deno-lint-ignore-file no-empty
import { MiddlewareHandlerContext } from '$fresh/server.ts';
import { getCookies } from "$std/http/cookie.ts";
import { verifyToken } from "/lib/jwt.ts";

export const handler = [
    async (req: Request, ctx: MiddlewareHandlerContext) => {
        const origin  = req.headers.get('Origin') || '*';
        if (req.method == 'OPTIONS') {
            const res = new Response(undefined, { status: 204 });
            const h = res.headers;
            h.set("Access-Control-Allow-Origin", origin);
            h.set("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS");
            return res;
        }
        const res = await ctx.next();
        const h = res.headers;
        h.set("Access-Control-Allow-Origin", origin);
        h.set("Access-Control-Allow-Credentials", "true");
        h.set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE");
        h.set("Access-Control-Allow-Headers",
            "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With"
        );
        return res;
    },
    async (req: Request, ctx: MiddlewareHandlerContext) => {
        const token = getCookies(req.headers).Authorization || req.headers.get("Authorization")?.match(/Bearer (.*)/)?.at(1);
        if (token) try { ctx.state.user = { id: (await verifyToken(token)).aud }; } catch {}
        return await ctx.next();
    }
];