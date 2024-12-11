import { Handlers } from "$fresh/server.ts";
import { badRequest, internalServerError, notFound } from '@sholvoir/generic/http';

export const handler: Handlers = {
    async GET(req) {
        try {
            const soundUrl = new URL(req.url).searchParams.get('q');
            if (!soundUrl) return badRequest;
            const reqInit = { headers: { 'User-Agent': req.headers.get('User-Agent') || 'Thunder Client (https://www.thunderclient.com)'} }
            const resp = await fetch(soundUrl, reqInit);
            if (!resp.ok) return notFound;
            resp.headers.set('Cache-Control', 'public, max-age=31536000');
            return resp
        } catch (e) {
            console.error(e);
            return internalServerError;
        }
    }
};
