import { FreshContext } from "$fresh/server.ts";
import { forbidden } from "@sholvoir/generic/http";

export async function handler(_req: Request, ctx: FreshContext) {
    return ctx.state.user == 'c292YXIuaGVAZ21haWwuY29t' ? await ctx.next() : forbidden;
}