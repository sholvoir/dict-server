import { FreshContext } from '$fresh/server.ts';
import { getCookies } from "$std/http/cookie.ts";
import { verifyToken } from "../../lib/jwt.ts";

export const handler = [
    async (req: Request, ctx: FreshContext) => {
        const origin  = req.headers.get('Origin') || '*';
        if (req.method == 'OPTIONS') {
            const res = new Response(undefined, { status: 204 });
            const h = res.headers;
            h.set("Access-Control-Allow-Origin", origin);
            h.set("Access-Control-Allow-Methods", "PUT, GET, PATCH");
            return res;
        }
        const res = await ctx.next();
        const h = res.headers;
        h.set("Access-Control-Allow-Origin", origin);
        h.set("Access-Control-Allow-Credentials", "true");
        h.set("Access-Control-Allow-Methods", "PUT, OPTIONS, GET, PATCH");
        h.set("Access-Control-Allow-Headers",
            "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With"
        );
        return res;
    },
    async (req: Request, ctx: FreshContext) => {
        if (req.method == 'GET') return await ctx.next();
        const token = getCookies(req.headers).Authorization || req.headers.get("Authorization")?.match(/Bearer (.*)/)?.at(1);
        if (!token) return new Response(undefined, { status: 401 });
        try {
            ctx.state.user = { id: (await verifyToken(token)).aud };
            return await ctx.next();
        } catch (e) {
            return new Response(e, { status: 501 });
        }
        
    }
];