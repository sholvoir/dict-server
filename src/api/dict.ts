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
   if (dict.entries?.length)
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
   .get(":word", async (c) => {
      const word = c.req.param("word");
      const ds = c.req.query("d")?.split(",") as (keyof IDictionary)[];
      const userAgent = c.req.header("User-Agent") || "";
      const dictionary = await collectionDict.findOne({ input: word });
      if (!dictionary) {
         const dict = await fill({ input: word }, userAgent);
         if (dict.modified) {
            delete dict.modified;
            const { vocab } = await getVocabulary();
            if (vocab.has(word)) {
               collectionDict.insertOne(dict);
               if (dict.mic) ecdictIssue(dict.mic);
            }
         }
         console.log(`API 'dict' GET word: ${word}`);
         return c.json(pdict(dict, ds));
      } else {
         const { _id, ...dict } = dictionary;
         if (Object.keys(dict).length < 6) await fill(dict, userAgent);
         if (dict.modified) {
            delete dict.modified;
            collectionDict.replaceOne({ _id }, dict);
            console.log(`API 'dict' GET word: ${word} (refilled)`);
         } else console.log(`API 'dict' GET word: ${word} (cached)`);
         return c.json(pdict(dict, ds));
      }
   })
   .patch(":word", auth, admin, async (c) => {
      const dict = (await c.req.json()) as IDictionary;
      if (!dict) return emptyResponse(STATUS_CODE.BadRequest);
      const input = c.req.param("word");
      if (dict.input && dict.input !== input)
         return emptyResponse(STATUS_CODE.BadRequest);
      if (dict.mic?.word && dict.mic.word !== input)
         return emptyResponse(STATUS_CODE.BadRequest);
      dict.version = Date.now();
      const result = await collectionDict.updateOne({ input }, { $set: dict });
      if (!result.acknowledged)
         return emptyResponse(STATUS_CODE.InternalServerError);
      if (!result.matchedCount) return emptyResponse(STATUS_CODE.NotFound);
      if (!result.modifiedCount)
         return emptyResponse(STATUS_CODE.NotAcceptable);
      console.log(`API dict PATCH ${input}`);
      return emptyResponse();
   })
   .delete(":word", auth, admin, async (c) => {
      const input = c.req.param("word");
      const result = await collectionDict.deleteOne({ input });
      if (!result.deletedCount) return emptyResponse(STATUS_CODE.NotFound);
      console.log(`API dict DELETE ${input}`);
      return emptyResponse();
   });
