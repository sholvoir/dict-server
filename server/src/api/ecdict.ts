import { emptyResponse } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { collectionDict, collectionIssue } from "../lib/mongo.ts";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

const app = new Hono();
app.get(auth, admin, async (c) => {
   const issues: Array<{ issue: string }> = [];
   const cursor = collectionDict.find();
   u: for await (const dict of cursor) {
      if (dict.mic?.entries)
         for (const entry of dict.mic.entries) {
            if (entry.phonetic?.includes("/,/")) {
               issues.push({ issue: dict.word });
               continue u;
            }
            if (entry.meanings) {
               if (issues.length > 9) break u;
               if (entry.meanings.ecdict) {
                  issues.push({ issue: dict.word });
                  continue u;
               }
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
