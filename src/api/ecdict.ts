import { emptyResponse } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { collectionDict, collectionIssue } from "../lib/mongo.ts";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

const app = new Hono();
app.get(auth, admin, async (c) => {
   const issues: Array<{ issue: string }> = [];
   const cursor = collectionDict.find({ mic: { $exists: true } });
   u: for await (const dict of cursor) {
      if (dict.mic?.entries?.length)
         for (const entry of dict.mic.entries) {
            if (issues.length > 9) break u;
            if (entry.phonetic?.includes("/,/")) {
               issues.push({ issue: dict.mic.word });
               continue u;
            }
            if (entry.pos === "ecdict") {
               issues.push({ issue: dict.mic.word });
               continue u;
            }
         }
   }
   if (!issues.length) return emptyResponse();
   const result = await collectionIssue.insertMany(issues);
   if (!result.acknowledged) return c.json(result, 500);
   console.log(`API ecdict as issue GET ${result.insertedCount}`);
   return c.json(result);
});

export default app;
