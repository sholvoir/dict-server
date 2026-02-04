import { MongoClient, ServerApiVersion } from "mongodb";
import type { IDict } from "./idict.ts";

const client = new MongoClient(Deno.env.get("MONGO_URI")!, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

export const connect = () => client.connect();
export const close = () => client.close();

const dictDB = client.db("dict");

export const collectionDict = dictDB.collection<IDict>("dict");
export const collectionIssue = dictDB.collection<{ issue: string }>("issue");
