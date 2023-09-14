import { MiddlewareHandlerContext } from '$fresh/server.ts';
import { getCookies } from "$std/http/cookie.ts";
import { verifyToken } from "/lib/jwt.ts";

export async function handler(req: Request, ctx: MiddlewareHandlerContext) {
    const token = getCookies(req.headers).Authorization || req.headers.get("Authorization")?.match(/Bearer (.*)/)?.at(1);
    if (!token) return new Response(undefined, { status: 401 });
    try {
        ctx.state.user = { id: (await verifyToken(token)).aud };
        return await ctx.next();
    } catch (e) {
        return new Response(e, { status: 501 });
    }
}