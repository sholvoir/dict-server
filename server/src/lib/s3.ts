import { S3 } from "@sholvoir/generic/s3";

export const s3 = new S3(
   "https://s3.us-east-005.backblazeb2.com",
   "us-east-005",
   Deno.env.get("BACKBLAZE_KEY_ID")!,
   Deno.env.get("BACKBLAZE_APP_KEY")!,
   "vocabulary",
);

if (import.meta.main) {
   await s3.putTextObject("test.txt", "test");
   const text = await s3.getTextObject("test.txt");
   console.log(text);
   await s3.deleteObject("test.txt");
}
