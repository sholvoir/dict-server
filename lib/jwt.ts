import { create, Header, Payload, verify } from "djwt";
import { decodeBase64 } from '$std/encoding/base64.ts';

const key = await crypto.subtle.importKey(
    'raw',
    decodeBase64(Deno.env.get('DICT_KEY')!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
);
const tokenHeader: Header = { alg: "HS256", typ: "JWT" };
const payloadTemplate = { iss: "sholvoir.com", sub: "dict" };
const expire = () => Math.floor(Date.now() / 1000) + 300 * 24 * 60 * 60;

export async function createToken(payload: Payload) {
    return await create(tokenHeader, { ...payloadTemplate, exp: expire(), ...payload }, key);
}

export async function verifyToken(token: string): Promise<Payload> {
    return await verify(token, key);
}