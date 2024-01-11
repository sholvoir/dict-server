import { JWT } from "generic-ts/jwt.ts";

export const jwt = new JWT({ iss: 'sholvoir.com', sub: 'memword' });
await jwt.importKey(Deno.env.get('DICT_KEY')!);