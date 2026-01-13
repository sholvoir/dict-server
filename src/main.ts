import getDicts from "./lib/youdao.ts";

Deno.serve(async (req) => {
   const url = new URL(req.url);
   const word = url.searchParams.get("q");
   if (!word) return new Response(null, { status: 400 });
   const word1 = encodeURIComponent(word);
   return new Response(JSON.stringify(await getDicts(word1)));
});