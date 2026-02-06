import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { check } from "../lib/spell-check.ts";

const app = new Hono();

app.post(async (c) => {
   const text = await c.req.text();
   if (!text.length) return emptyResponse(STATUS_CODE.BadRequest);
   const result = await check(text);
   return c.json(result);
});

export default app;
