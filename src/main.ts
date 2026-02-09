import { Hono } from "hono";
import { cors } from "hono/cors";
import dict from "./api/dict.ts";
import ecdict from "./api/ecdict.ts";
import apply from "./api/index.ts";
import issue from "./api/issue.ts";
import sound from "./api/sound.ts";
import spell from "./api/spell.ts";
import vocabulary from "./api/vocabulary.ts";

const API_BASE = "/api/v2";

const run = () => {
   const app = new Hono();
   app.use(cors());
   apply(app);
   app.route(`${API_BASE}/dict`, dict);
   app.route(`${API_BASE}/ecdict`, ecdict);
   app.route(`${API_BASE}/issue`, issue);
   app.route(`${API_BASE}/sound`, sound);
   app.route(`${API_BASE}/spell`, spell);
   app.route(`${API_BASE}/vocabulary`, vocabulary);
   Deno.serve({ port: +(Deno.env.get("PORT") ?? 8080) }, app.fetch);
};

if (import.meta.main) run();
