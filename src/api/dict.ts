import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { fill } from "../lib/dict.ts";
import type { jwtEnv } from "../lib/env.ts";
import type { IDictionary } from "../lib/idictionary.ts";
import type { IDict } from "../lib/imic.ts";
import { collectionDict, collectionIssue } from "../lib/mongo.ts";
import { getVocabulary } from "../lib/spell-check.ts";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

const ecdictIssue = (dict: IDict) => {
   if (dict.entries.length)
      for (const entry of dict.entries)
         if (entry.pos === "ecdict") {
            collectionIssue.findOne({ issue: dict.word }).then((i) => {
               if (!i) {
                  console.log(`API 'dict' insert issue: ${dict.word}`);
                  collectionIssue.insertOne({
                     issue: dict.word,
                     reporter: "ecdict",
                  });
               }
            });
            return;
         }
};

const pdict = (dict: IDictionary, keys?: Array<keyof IDictionary>) => {
   if (!keys) return dict;
   const di: Partial<IDictionary> = {};
   for (const d of keys) di[d] = dict[d];
   return di;
};

export default new Hono<jwtEnv>()
   .get(async (c) => {
      const word = c.req.query("q");
      if (!word) return emptyResponse(STATUS_CODE.BadRequest);
      const ds = c.req.query("d")?.split(",") as (keyof IDictionary)[];
      const userAgent = c.req.header("User-Agent") || "";
      const dict = await collectionDict.findOne({ input: word });
      if (!dict) {
         const ndict = await fill({ input: word }, userAgent);
         const { vocab } = await getVocabulary();
         if (vocab.has(word)) {
            await collectionDict.insertOne(ndict);
            if (ndict.mic) ecdictIssue(ndict.mic);
         }
         console.log(`API 'dict' GET word: ${word}`);
         return c.json(pdict(ndict, ds));
      } else {
         if (Object.keys(dict).length < 6) await fill(dict, userAgent);
         if (dict.modified) {
            delete dict.modified;
            await collectionDict.replaceOne({ _id: dict._id }, dict);
         }
         console.log(`API 'dict' GET word: ${word} (refilled)`);
         return c.json(pdict(dict, ds));
      }
   })
   .patch(auth, admin, async (c) => {
      const dict = (await c.req.json()) as IDictionary;
      if (!dict) return emptyResponse(STATUS_CODE.BadRequest);
      const input = dict.input ?? dict.mic?.word;
      if (!input) return emptyResponse(STATUS_CODE.BadRequest);
      dict.version = Date.now();
      const result = await collectionDict.updateOne(
         { input },
         { $set: dict },
         { upsert: true },
      );
      if (!result.acknowledged)
         return emptyResponse(STATUS_CODE.InternalServerError);
      console.log(`API dict PATCH ${input}`);
      return emptyResponse();
   })
   .delete(auth, admin, async (c) => {
      const input = c.req.query("q");
      if (!input) return emptyResponse(STATUS_CODE.BadRequest);
      const result = await collectionDict.deleteOne({ input });
      if (!result.deletedCount) return emptyResponse(STATUS_CODE.NotFound);
      console.log(`API dict DELETE ${input}`);
      return emptyResponse();
   });
