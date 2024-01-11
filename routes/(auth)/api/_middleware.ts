import { FreshContext } from "$fresh/server.ts";

export async function handler(req: Request, ctx: FreshContext) {
    if (req.method == 'GET' || ctx.state.user) return await ctx.next();
    return new Response(undefined, { status: 401 });
}