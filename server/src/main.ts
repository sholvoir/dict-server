import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/deno";
import dict from "./api/dict.ts";
import ecdict from "./api/ecdict.ts";
import issue from "./api/issue.ts";
import origin from "./api/origin.ts";
import vocabulary from "./api/vocabulary.ts";

const run = () => {
   const app = new Hono();
   app.use(cors());
   app.use("/", serveStatic({ path: "./public/index.html" }));
   app.use("/assets/*", serveStatic({ root: "./public" }));
   app.route("/api/v2/dict", dict);
   app.route("/api/v2/ecdict", ecdict);
   app.route("/api/v2/issue", issue);
   app.route("/api/v2/origin", origin);
   app.route("/api/v2/vocabulary", vocabulary);
   Deno.serve({ port: +(Deno.env.get("PORT") ?? 8080) }, app.fetch);
};

if (import.meta.main) run();
