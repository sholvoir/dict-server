import type { Hono } from "hono";
import { proxy } from "hono/proxy";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";
import renew from "../mid/renew.ts";

const url = "https://www.micinfotech.com/dict";

const apply = (app: Hono) => {
   app.get("/", auth, admin, renew, () => proxy(`${url}/index.html`));
   app.get("/assets/*", (c) => proxy(`${url}${c.req.path}`));
};

export default apply;
