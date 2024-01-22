// deno-lint-ignore-file no-explicit-any
const baseUrl = 'https://dict.youdao.com/jsonapi';

export async function trans(en: string): Promise<string|undefined> {
    const resp = await fetch(`${baseUrl}?q=${en}`);
    if (!resp.ok) return undefined;
    const trs = (await resp.json()).individual?.trs;
    if (!trs || !trs.length) return undefined;
    return trs.map((tr: any) => `${tr.pos}${tr.tran?.replaceAll('，', ',').replaceAll('；',';')}`).join(' ');
}

if (import.meta.main) for (const en of Deno.args) console.log(await trans(en));