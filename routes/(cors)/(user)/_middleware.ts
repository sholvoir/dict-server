import { FreshContext } from '$fresh/server.ts';
import { getCookies } from "@std/http";
import { jwt } from '../../../lib/jwt.ts';
import { internalServerError } from "@sholvoir/generic/http";

export async function handler(req: Request, ctx: FreshContext) {
    const auth = new URL(req.url).searchParams.get('auth');
    const token = auth ? decodeURIComponent(auth) :
        getCookies(req.headers).auth ||
        req.headers.get("Authorization")?.match(/Bearer (.*)/)?.at(1);
    try {
        const payload = token && await jwt.verifyToken(token);
        if (payload) ctx.state.user = payload.aud;
        return await ctx.next();
    } catch { return internalServerError; }
}