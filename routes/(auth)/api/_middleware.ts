import { FreshContext } from "$fresh/server.ts";
import { forbidden } from "@sholvoir/generic/http";

export async function handler(req: Request, ctx: FreshContext) {
    if (req.method == 'GET' || ctx.state.user == 'c292YXIuaGVAZ21haWwuY29t') return await ctx.next();
    return forbidden;
}