import { encodeBase64 } from "$std/encoding/base64.ts";

const bytes = await Deno.readFile('../../Downloads/a__us_2_rr.ogg');
console.log(`data:audio/ogg;base64,${encodeBase64(bytes)}`);