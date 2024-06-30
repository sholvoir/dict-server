import { JWT } from "@sholvoir/generic/jwt";

export const jwt = new JWT({ iss: 'micit.co', sub: 'dict' });
await jwt.importKey(Deno.env.get('DICT_KEY')!);