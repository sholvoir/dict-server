import { Handlers } from "$fresh/server.ts";
const key = 'dict.sholvoir.com';

export default async function Init() {
    const res = await fetch('https://www.sholvoir.com/vocabulary/0.0.1/vocabulary.json');
    const words = await res.json();
    const kv = await Deno.openKv();
    for (const word in words) await kv.set([key, word], {});
    return (<div class="p-4 mx-auto max-w-screen-md">Finish Data Init</div>);
}