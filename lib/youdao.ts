// deno-lint-ignore-file no-explicit-any
import { IDict } from "./idict.ts";

const baseUrl = 'https://dict.youdao.com/jsonapi';
const refine = (o?: string) => o?.replaceAll('，', ',').replaceAll('；',';').replaceAll('（', '(').replaceAll('）',')').replaceAll(' ', '');

export async function getPhoneticTrans(en: string): Promise<IDict> {
    const resp = await fetch(`${baseUrl}?q=${en}`);
    const result: IDict = {};
    if (!resp.ok) return result;
    const root = await resp.json();
    const trs = root.individual?.trs;
    if (trs && trs.length) result.trans = trs.map((tr: any) => `${tr.pos}${refine(tr.tran)}`).join(' ');
    const p = root.ec?.word?.[0]?.usphone?.split('; ')[0];
    if (p) result.phonetic = `/${p}/`;
    if (!result.trans)
        result.trans = root.ec?.word?.[0]?.trs?.map((x: any) => 
            x.tr?.map((y: any) => y.l?.i?.map(refine).join(' ')).join(' ')
        ).join(' ');
    return result;
}

if (import.meta.main) for (const en of Deno.args) console.log(await getPhoneticTrans(en));