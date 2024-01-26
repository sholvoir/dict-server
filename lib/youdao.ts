import { IDict } from "./idict.ts";

const baseUrl = 'https://dict.youdao.com/jsonapi';
const refine = (o?: string) => o?.replaceAll('，', ',').replaceAll('；',';').replaceAll('（', '(').replaceAll('）',')').replaceAll(' ', '');
const abbr = (partofspeech: string) => {
    const p = partofspeech.toLowerCase()
    if (p.startsWith('n')) return 'n.';
    if (p.startsWith('v')) return 'v.';
    if (p.startsWith('adj')) return 'adj.';
    if (p.startsWith('adv')) return 'adv.';
    if (p.startsWith('pron')) return 'pron.';
    if (p.startsWith('prep')) return 'prep.';
    if (p.startsWith('conj')) return 'conj.';
    if (p.startsWith('interj')) return 'interj.';
    return p;
}

export async function getAll(en: string): Promise<IDict> {
    const resp = await fetch(`${baseUrl}?q=${en}`);
    const result: IDict = {};
    if (!resp.ok) return result;
    const root = await resp.json();
    if (root.collins_primary?.words?.word === en && root.collins_primary?.gramcat?.length) for (const x of root.collins_primary.gramcat) {
        if (!result.phonetic) result.phonetic = x.pronunciation;
        if (!result.sound) result.sound = x.audiourl;
        if (!result.trans) {
            const ts = [];
            if (x.senses?.length) for (const y of x.senses) {
                ts.push(refine(y.word));
            }
            if (ts.length) result.trans = `${abbr(x.partofspeech)}${ts.join(';')}`;
        }
    }
    if ((!result.phonetic || !result.trans) && root.collins?.collins_entries) {
        const collinsTran = new RegExp(`<b>${en}</b>.+ (.+?)$`, 'i');
        const ts = [];
        for (const x of root.collins.collins_entries) {
            if (!result.phonetic) result.phonetic = x.phonetic;
            if (x.entries?.entry?.length) for (const y of x.entries.entry) {
                if (y.tran_entry?.length) for (const z of y.tran_entry) {
                    const m = z.tran?.match(collinsTran);
                    if (m) ts.push(`${abbr(z.pos_entry?.pos)}${refine(m[1])}`);
                }
            }
        }
        if (!result.trans && ts.length) result.trans = ts.join('\n');
    }
    if ((!result.trans || !result.phonetic) && root.ec?.word?.length) {
        const ts = [];
        for (const x of root.ec?.word) {
            if (!result.phonetic) {
                const p = x.usphone?.split('; ')[0];
                if (p) result.phonetic = `/${p}/`;
            }
            if (x.trs?.length) for (const y of x.trs) {
                if (y.tr?.length) for (const z of y.tr) {
                    if (z.l?.i?.length) for (const w of z.l.i) {
                        ts.push(refine(w))
                    }
                }
            }
        }
        if (!result.trans && ts.length) result.trans = ts.join('\n')
    }
    if (!result.trans && root.individual?.trs?.length) {
        const ts = [];
        for (const x of root.individual.trs) {
            ts.push(`${x.pos}${refine(x.tran)}`)
        }
        if (ts.length) result.trans = ts.join('\n');
    }
    if (!result.phonetic && root.simple?.word?.length) for (const x of root.simple?.word) {
        if (!result.phonetic) result.phonetic = x.usphone;
    }
    return result;
}

if (import.meta.main) for (const en of Deno.args) console.log(await getAll(en));