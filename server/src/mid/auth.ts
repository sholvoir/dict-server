import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { JWT } from "@sholvoir/generic/jwt";
import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono/types";
import type { jwtEnv } from "../lib/env.ts";

const jwt = new JWT({ iss: "micinfotech.com", sub: "memword" });
await jwt.importKey(Deno.env.get("APP_KEY"));

const auth: MiddlewareHandler<jwtEnv> = async (c, next) => {
   const token =
      c.req.query("auth") ||
      getCookie(c, "auth") ||
      c.req
         .header("Authorization")
         ?.match(/Bearer (.*)/)
         ?.at(1);

   let username = "";
   if (token)
      try {
         const payload = await jwt.verifyToken(token);
         if (payload) username = payload.aud as string;
      } catch {}
   if (username) c.set("username", username);
   else return emptyResponse(STATUS_CODE.Unauthorized);
   await next();
};

export default auth;
