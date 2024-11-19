import { IDict } from "./idict.ts";

const baseUrl = 'https://dict.youdao.com/jsonapi';
const youdaoAudio = 'https://dict.youdao.com/dictvoice?audio='//complete&type=2
const collinsTail = /(?<=[\.\?] )([\W; ]+?)$/;
const replace: Record<string, string> = { '，':',', '、':',', '；':';', '（':'(', '）':')', ' ':'' };
const refine = (o?: string) => o?.replaceAll(/([，、；（）]|(?<!\w) (?!\w))/g, m => replace[m]);
const abbr = (partofspeech?: string) => {
    if (!partofspeech) return '';
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

const getDict = async (en: string): Promise<IDict|null> => {
    const resp = await fetch(`${baseUrl}?q=${en}`);
    if (!resp.ok) return null;
    const root = await resp.json();
    const result: IDict = {};
    const nameRegex = new RegExp(`【名】|（人名）|（${en}）人名`, 'i');
    // Simple Dict
    if ((!result.phonetic || !result.sound) && root.simple?.word?.length) for (const x of root.simple?.word) {
        if (x['return-phrase'] !== en) continue;
        if (!result.phonetic && x.usphone) result.phonetic = `/${x.usphone}/`;
        if (!result.sound && x.usspeech) result.sound = `${youdaoAudio}${x.usspeech}`;
    }
    // English-Chinese Dict
    if ((!result.trans || !result.phonetic || !result.sound) && root.ec?.word?.length) {
        const ts = [];
        for (const x of root.ec?.word) {
            if (!result.phonetic && x.usphone) result.phonetic = `/${x.usphone}/`;
            if (!result.sound && x.usspeech) result.sound = `${youdaoAudio}${x.usspeech}`;
            if (x.trs?.length) for (const y of x.trs) {
                if (y.tr?.length) for (const z of y.tr) {
                    if (z.l?.i?.length) for (const w of z.l.i) {
                        if (w.match(nameRegex)) continue;
                        ts.push(refine(w));
                    }
                }
            }
        }
        if (!result.trans && ts.length) result.trans = ts.join('\n')
    }
    // Collins Dict
    if ((!result.phonetic || !result.trans) && root.collins?.collins_entries?.length) {
        const collinsTran = new RegExp(`<b>${en}`, 'i');
        const ts = [];
        for (const x of root.collins.collins_entries) {
            if (!result.phonetic && x.phonetic) result.phonetic = `/${x.phonetic}/`;
            if (x.entries?.entry?.length) for (const y of x.entries.entry) {
                if (y.tran_entry?.length) for (const z of y.tran_entry) {
                    if ((z.headword && z.headword !== en) || z.pos_entry?.pos?.toLowerCase().includes('phrase')) continue;
                    if (z.tran?.match(collinsTran)) {
                        const m = z.tran.match(collinsTail);
                        if (m) ts.push(`${abbr(z.pos_entry?.pos)}${refine(m[1])}`);
                    }
                }
            }
        }
        if (!result.trans && ts.length) result.trans = ts.join('\n');
    }
    // Individual Dict
    if (!result.trans && root.individual?.trs?.length) {
        const ts = [];
        for (const x of root.individual.trs) {
            ts.push(`${x.pos}${refine(x.tran)}`)
        }
        if (ts.length) result.trans = ts.join('\n');
    }
    // Collins Primary Dict
    if (!result.phonetic && !result.sound && root.collins_primary?.words?.word === en && root.collins_primary?.gramcat?.length) {
        for (const x of root.collins_primary.gramcat) {
            if (!result.phonetic && x.pronunciation) result.phonetic = `/${x.pronunciation}/`;
            if (!result.sound && x.audiourl) result.sound = x.audiourl;
        }
    }
    return result;
}

export default getDict;

if (import.meta.main) for (const en of Deno.args) console.log(await getDict(en));