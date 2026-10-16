import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";
import { ObjectId } from "mongodb";
import type { jwtEnv } from "../lib/env.ts";
import type { IIDIssue } from "../lib/iissue.ts";
import { collectionIssue } from "../lib/mongo.ts";
import { getVocabulary } from "../lib/spell-check.ts";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

export default new Hono<jwtEnv>()
   .get(auth, admin, async (c) => {
      const issues: Array<IIDIssue> = [];
      for await (const { _id, ...rest } of collectionIssue.find())
         issues.push({ id: _id.toString(), ...rest });
      console.log(`API issue GET successed ${issues.length}`);
      return c.json(issues);
   })
   .post(auth, async (c) => {
      const reporter = c.get("username");
      const issue = await c.req.text();
      if (!issue) return emptyResponse(STATUS_CODE.BadRequest);
      const { vocab } = await getVocabulary();
      if (!vocab.has(issue)) return emptyResponse(STATUS_CODE.NotAcceptable);
      const sissue = await collectionIssue.findOne({ issue });
      if (sissue) return emptyResponse(STATUS_CODE.Conflict);
      const result = await collectionIssue.insertOne({ issue, reporter });
      if (!result.acknowledged) {
         console.log(`API issue POST ${reporter} ${issue} write error`);
         return emptyResponse(STATUS_CODE.InternalServerError);
      } else {
         console.log(`API issue POST ${reporter} ${issue}`);
         return c.text(result.insertedId.toString(), STATUS_CODE.Created);
      }
   })
   .delete(":id", auth, admin, async (c) => {
      const id = c.req.param("id");
      if (!id) return emptyResponse(STATUS_CODE.BadRequest);
      const result = await collectionIssue.deleteOne({ _id: new ObjectId(id) });
      if (!result.acknowledged) {
         console.log(`API issue DELETE ${id} write error`);
         return emptyResponse(STATUS_CODE.InternalServerError);
      } else if (!result.deletedCount) {
         console.log(`API issue DELETE ${id} not found`);
         return emptyResponse(STATUS_CODE.NotFound);
      } else {
         console.log(`API issue DELETE ${id}`);
         return emptyResponse();
      }
   });
