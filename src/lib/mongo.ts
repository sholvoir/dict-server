import { MongoClient, ServerApiVersion } from "mongodb";
import type { IDictionary } from "./idict.ts";

export const client = new MongoClient(Deno.env.get("MONGO_URI")!, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

export const connect = () => client.connect();
export const close = () => client.close();

const dictDB = client.db("dict");

export const collectionDict = dictDB.collection<IDictionary>("dict");
export const collectionIssue = dictDB.collection<{ issue: string }>("issue");
