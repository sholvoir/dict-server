const key = 'dict.sholvoir.com';

async function run() {
    const res = await fetch('https://www.sholvoir.com/vocabulary/0.0.1/vocabulary.json');
    const words = await res.json();
    const kv = await Deno.openKv();
    for (const word in words)
        await kv.set([key, word], {});
}

if (import.meta.main) await run();