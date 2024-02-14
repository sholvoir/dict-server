import { FreshContext } from '$fresh/server.ts';
import { getCookies } from "$std/http/cookie.ts";
import { jwt } from '../../lib/jwt.ts';

export const handler = [
    async (req: Request, ctx: FreshContext) => {
        const origin  = req.headers.get('Origin') || '*';
        if (req.method == 'OPTIONS') {
            const res = new Response(undefined, { status: 204 });
            const h = res.headers;
            h.set("Access-Control-Allow-Origin", origin);
            h.set("Access-Control-Allow-Credentials", "true");
            h.set("Access-Control-Allow-Methods", "PUT, GET, PATCH, DELETE");
            return res;
        }
        const res = await ctx.next();
        const h = res.headers;
        h.set("Access-Control-Allow-Origin", origin);
        h.set("Access-Control-Allow-Credentials", "true");
        h.set("Access-Control-Allow-Methods", "PUT, OPTIONS, GET, PATCH, DELETE");
        h.set("Access-Control-Allow-Headers",
            "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With"
        );
        return res;
    },
    async (req: Request, ctx: FreshContext) => {
        const auth = new URL(req.url).searchParams.get('auth');
        const token = auth ? decodeURIComponent(auth) :
            getCookies(req.headers).auth ||
            req.headers.get("Authorization")?.match(/Bearer (.*)/)?.at(1);
        try {
            const payload = token && await jwt.verifyToken(token);
            if (payload) ctx.state.user = payload.aud;
            return await ctx.next();
        } catch (e) { return new Response(e, { status: 501 }); }
    }
];