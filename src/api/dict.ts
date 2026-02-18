import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { fill } from "../lib/dict.ts";
import type { jwtEnv } from "../lib/env.ts";
import type { IDictionary } from "../lib/idict.ts";
import type { IDict } from "../lib/imic.ts";
import micFill from "../lib/mic.ts";
import { collectionDict } from "../lib/mongo.ts";
import { getVocabulary } from "../lib/spell-check.ts";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

const app = new Hono<jwtEnv>();

const fillAndReplaceDict = async (dict: IDictionary) => {
   await fill(dict);
   if (dict.modified) {
      delete dict.modified;
      await collectionDict.replaceOne({ input: dict.word }, dict);
   }
};

app.get(async (c) => {
   const word = c.req.query("q");
   const re = c.req.query("re");
   const mic = c.req.query("mic");
   if (!word) return emptyResponse(STATUS_CODE.BadRequest);
   const dict = await collectionDict.findOne({ input: word });
   if (!dict) {
      const ndict = await fill({ input: word });
      const { vocab } = await getVocabulary();
      if (vocab.has(word)) await collectionDict.insertOne(ndict);
      console.log(`API 'dict' GET word: ${word}`);
      return c.json(mic ? ndict.mic : ndict);
   } else if (!dict.mic) {
      await fillAndReplaceDict(dict);
      console.log(`API 'dict' GET word: ${word}`);
      return c.json(mic ? dict.mic : dict);
   } else if (!re) {
      fillAndReplaceDict(dict);
      console.log(`API 'dict' GET word: ${word} (cached)`);
      return c.json(mic ? dict.mic : dict);
   } else {
      await fillAndReplaceDict(dict);
      delete dict.mic;
      micFill(dict);
      console.log(`API 'dict' GET word: ${word} (refilled)`);
      return c.json(mic ? dict.mic : dict);
   }
})
   .put(auth, admin, async (c) => {
      const cDict = (await c.req.json()) as IDict;
      if (!cDict) return emptyResponse(STATUS_CODE.BadRequest);
      cDict.version = Date.now();
      const result = await collectionDict.updateOne(
         { input: cDict.word },
         { $set: { mic: cDict } },
         { upsert: true },
      );
      if (!result.acknowledged)
         return emptyResponse(STATUS_CODE.InternalServerError);
      console.log(`API dict PUT ${cDict.word}`);
      return emptyResponse();
   })
   .delete(auth, admin, async (c) => {
      const word = c.req.query("q");
      if (!word) return emptyResponse(STATUS_CODE.BadRequest);
      const result = await collectionDict.deleteOne({ input: word });
      if (!result.deletedCount) return emptyResponse(STATUS_CODE.NotFound);
      console.log(`API dict DELETE ${word}`);
      return emptyResponse();
   });

export default app;
