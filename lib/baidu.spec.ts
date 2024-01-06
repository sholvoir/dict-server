import "$std/dotenv/load.ts";
import { trans } from './baibu.ts';

for (const en of Deno.args) console.log(await trans(en));