
import { Application, Router, Status } from 'https://deno.land/x/oak/mod.ts';
import { Dict } from './dict.ts';
import { log, setLogPath } from 'https://sholvoir.github.io/generic/log.ts';
import { trans } from './baibu.ts';
import { getSound } from "./google_dictionary_api.ts";

setLogPath('dict.log');
Dict.init()

const router = new Router().get('/:word', async (context) => {
    log('info', `GET ${context.params.word}`);
    const word = context.params.word;
    if (word) {
        let value: any = Dict.get(word);
        let modified = false;
        if (!value) {
            value = {};
            modified = true;
        }
        if (!value.trans) {
            value.trans = await trans(word);
            modified = true;
        }
        for (const soundStyle of ['GB', 'US']) if (!value[`sound${soundStyle}`]) {
            const sound = await getSound(word, <any>soundStyle);
            if (sound) {
                value[`sound${soundStyle}`] = sound.audio;
                value[`phonetics${soundStyle}`] = sound.text;
                modified = true;
            }
        }
        if (modified) Dict.set(word, value);
        context.response.body = JSON.stringify(value);
    } else context.response.body = 'null';
}).put('/:word', (context) => {
    const word = context.params.word;
    const value = context.request.body({ type: 'json'});
    if (word && value) Dict.set(word, <any>value);
    else context.response.status = Status.BadRequest;
}).patch('/:word', (context) => {
    const word = context.params.word;
    const value = context.request.body({ type: 'json'});
    log('info', `PUT ${context.params.word} with value ${JSON.stringify(value)}`);
    if (word && value) {
        Dict.set(word, <any>value);
        context.response.body = JSON.stringify(value);
    }
    else context.response.status = Status.BadRequest;
});

await new Application().use(router.routes()).use(router.allowedMethods()).listen({ port: 8080 });
