import { DOMParser } from "@b-fuze/deno-dom";
import type { Hono } from "hono";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

const url = "https://www.micinfotech.com/dict/";

const apply = (app: Hono) => {
   app.use("/", auth, admin, async (c) => {
      const res = await fetch(`${url}index.html`);
      if (!res.ok) return res;
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      if (!doc) return c.text("Error parsing HTML");
      const base = doc.createElement("base");
      base.setAttribute("href", url);
      doc.head.insertBefore(base, doc.head.firstChild);
      return c.html(doc.documentElement?.outerHTML ?? "");
   });
};

export default apply;
