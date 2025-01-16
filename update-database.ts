import { vocabularyUrl } from "./lib/common.ts";
import { IDict } from "./lib/idict.ts";

const category = 'dict';
const kvPath = Deno.env.get('DENO_KV_PATH');

const update = async () => {
    const kv = await Deno.openKv(kvPath);
    const res = await kv.get<string>(['system', 'vocabulary-version']);
    const vocabularyVersion = res.value;
    if (!vocabularyVersion) return (console.log("No Vocabulary Version!"), kv.close());

    const vocabulary = new Set<string>();
    const res1 = await fetch(vocabularyUrl(vocabularyVersion), { cache: 'force-cache' });
    if (res1.ok) {
        const delimitor = /[,:] */;
        for (const line of (await res1.text()).split('\n')) {
            let [word] = line.split(delimitor);
            word = word.trim();
            if (word) vocabulary.add(word);
        }
    } else return (console.error(res1.status), kv.close());

    const entyies = kv.list<IDict>({ prefix: [category] });
    for await (const entry of entyies) {
        const word = entry.key[1] as string;
        if (vocabulary.has(word)) vocabulary.delete(word);
        else {
            console.log(`Deleting from server: ${word}.`);
            await kv.delete(entry.key);
        }
    }
    for (const word of vocabulary) {
        console.log(`Adding to server: ${word}.`);
        await kv.set([category, word], {});
    }
    kv.close();
}

if (import.meta.main) update();