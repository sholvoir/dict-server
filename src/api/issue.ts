import { emptyResponse, STATUS_CODE } from "@sholvoir/generic/http";
import { Hono } from "hono";
import type { jwtEnv } from "../lib/env.ts";
import { collectionIssue } from "../lib/mongo.ts";
import { getVocabulary } from "../lib/spell-check.ts";
import admin from "../mid/admin.ts";
import auth from "../mid/auth.ts";

export default new Hono<jwtEnv>()
   .get(auth, admin, async (c) => {
      const issues = [];
      for await (const issue of collectionIssue.find()) issues.push(issue);
      console.log(`API issue GET successed`);
      return c.json(issues);
   })
   .post(auth, async (c) => {
      const reporter = c.get("username");
      const issue = (await c.req.json()).issue;
      if (!issue) return emptyResponse(STATUS_CODE.BadRequest);
      const { vocab } = await getVocabulary();
      if (!vocab.has(issue)) return emptyResponse(STATUS_CODE.NotAcceptable);
      const sissue = await collectionIssue.findOne({ issue });
      if (sissue) return emptyResponse(STATUS_CODE.Conflict);
      const result = await collectionIssue.insertOne({ issue });
      if (!result.acknowledged) {
         console.log(`API issue POST ${reporter} ${issue} write error`);
         return emptyResponse(STATUS_CODE.InternalServerError);
      } else {
         console.log(`API issue POST ${reporter} ${issue}`);
         return c.text(result.insertedId.toString(), STATUS_CODE.Created);
      }
   })
   .delete(auth, admin, async (c) => {
      const issue = c.req.query("issue");
      if (!issue) return emptyResponse(STATUS_CODE.BadRequest);
      const result = await collectionIssue.deleteOne({ issue });
      if (!result.acknowledged) {
         console.log(`API issue DELETE ${issue} write error`);
         return emptyResponse(STATUS_CODE.InternalServerError);
      } else if (!result.deletedCount) {
         console.log(`API issue DELETE ${issue} not found`);
         return emptyResponse(STATUS_CODE.NotFound);
      } else {
         console.log(`API issue DELETE ${issue}`);
         return emptyResponse();
      }
   });
