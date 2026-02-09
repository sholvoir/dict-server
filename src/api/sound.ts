import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";

const defaultAgent = "Thunder Client (https://www.thunderclient.com)";
const app = new Hono();

app.get(async (c) => {
   const soundUrl = c.req.query("q");
   if (!soundUrl) return emptyResponse(STATUS_CODE.BadRequest);
   const resp = await fetch(soundUrl, {
      headers: { "User-Agent": c.req.header("User-Agent") ?? defaultAgent },
   });
   if (!resp.ok) return emptyResponse(STATUS_CODE.NotFound);
   const headers = new Headers();
   resp.headers.forEach((value, key) => headers.set(key, value));
   headers.set("Cache-Control", "public, max-age=31536000");
   return new Response(resp.body, { headers });
});

export default app;
