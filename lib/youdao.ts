const baseUrl = 'https://dict.youdao.com/jsonapi';

export async function trans(en: string): Promise<string|undefined> {
    const resp = await fetch(`${baseUrl}?q=${en}`);
    if (!resp.ok) return undefined;
    const tr = (await resp.json()).individual?.trs?.[0];
    if (!tr) return undefined;
    return `${tr.pos}${tr.tran?.replaceAll('，', ',').replaceAll('；',';')}`;
}

if (import.meta.main) console.log(await trans(Deno.args[0]));