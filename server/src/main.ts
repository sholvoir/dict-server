import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/deno";
import dict from "./api/dict.ts";
import ecdict from "./api/ecdict.ts";
import issue from "./api/issue.ts";
import sound from "./api/sound.ts";
import spell from "./api/spell.ts";
import vocabulary from "./api/vocabulary.ts";
import { API_BASE } from "./lib/common.ts";

const run = () => {
   const app = new Hono();
   app.use(cors());
   app.use("/", serveStatic({ path: "./public/index.html" }));
   app.use("/assets/*", serveStatic({ root: "./public" }));
   app.route(`${API_BASE}/dict`, dict);
   app.route(`${API_BASE}/ecdict`, ecdict);
   app.route(`${API_BASE}/issue`, issue);
   app.route(`${API_BASE}/sound`, sound);
   app.route(`${API_BASE}/spell`, spell);
   app.route(`${API_BASE}/vocabulary`, vocabulary);
   Deno.serve({ port: +(Deno.env.get("PORT") ?? 8080) }, app.fetch);
};

if (import.meta.main) run();
