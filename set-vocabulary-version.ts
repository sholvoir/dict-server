const catalog = 'system';
const kvPath = Deno.env.get('DENO_KV_PATH');

const run = async () => {
    const vocabularyVersion = Deno.args[0];
    if (vocabularyVersion) {
        const kv = await Deno.openKv(kvPath);
        const res = await kv.set([catalog, 'vocabulary-version'], vocabularyVersion);
        console.log(res);
    }
}

if (import.meta.main) await run();