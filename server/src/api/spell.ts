import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { check } from "../lib/spell-check.ts";

const app = new Hono();

app.post(async (c) => {
   const text = await c.req.text();
   if (!text.length) return emptyResponse(STATUS_CODE.BadRequest);
   const result = await check(text.split("\n"));
   if (Object.keys(result).length)
      return c.json(result, STATUS_CODE.NotAcceptable);
   return emptyResponse(STATUS_CODE.OK);
});

export default app;
