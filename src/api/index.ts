import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import type { Hono } from "hono";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";
import renew from "../mid/renew.ts";

const url = "https://www.micinfotech.com/dict";

const apply = (app: Hono) => {
   app.get("/", auth, admin, renew, async (c) => {
      const resp = await fetch(`${url}/index.html`);
      if (!resp.ok) return emptyResponse(STATUS_CODE.NotFound);
      const text = await resp.text();
      return c.html(text);
   });
   app.get("/assets/*", async (c) => {
      const resp = await fetch(`${url}${c.req.path}`);
      if (!resp.ok) return emptyResponse(STATUS_CODE.NotFound);
      return resp;
   });
};

export default apply;
