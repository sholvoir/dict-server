import { FreshContext } from '$fresh/server.ts';
import { noContent } from "@sholvoir/generic/http";

export async function handler(req: Request, ctx: FreshContext) {
        const origin  = '*';
        const res = req.method == 'OPTIONS' ? noContent.clone() : await ctx.next();
        const h = res.headers;
        h.set("Access-Control-Allow-Origin", origin);
        h.set("Access-Control-Allow-Credentials", "true");
        h.set("Access-Control-Allow-Methods", "PUT, OPTIONS, GET, PATCH, DELETE");
        h.set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With");
        return res;
    }