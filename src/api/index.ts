import type { Hono } from "hono";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

const url = "https://www.micinfotech.com/dict";

const apply = (app: Hono) => {
   app.get("/", auth, admin, () => fetch(`${url}/index.html`));
   app.get("/assets/*", (c) => fetch(`${url}${c.req.path}`));
};

export default apply;
