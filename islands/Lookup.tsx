// deno-lint-ignore-file no-explicit-any
import { useSignal } from "@preact/signals";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import { IDict } from "../lib/idict.ts";

const baseApi = '/api';
const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

export default function Lookup() {
    const prompt = useSignal('');
    const word = useSignal('');
    const pic  = useSignal('');
    const trans = useSignal('');
    const sound = useSignal('');
    const phonetic = useSignal('');
    const searchClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(word.value)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            phonetic.value = dic.phonetic!;
            trans.value = dic.trans!;
            sound.value = dic.sound!;
            prompt.value = '';
        } else {
            prompt.value = await res.text();
        }
    }
    const playClick = () => {
        if (sound.value) {
            try {
                (new Audio(sound.value)).play();
                prompt.value = '';
            } catch (e) {
                prompt.value = e.toString();
            }
        } else {
            prompt.value = 'no sound to play!';
        }
    }
    const updateClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(word.value)}`, {
            method: 'PATCH',
            cache: 'no-cache',
            body: JSON.stringify({ trans: trans.value, sound: sound.value, phonetic: phonetic.value })
        });
        if (res.ok) {
            prompt.value = (`success upate word "${word.value}"!`);
        } else {
            prompt.value = (await res.text());
        }
    }
    return <>
        <div class="m-1 text-red-500">{prompt}</div>
        <div class="m-1 flex space-x-2">
            <input type="text" name="word" placeholder="word" class="grow border px-2" value={word} onInput={({ target }) => word.value = (target as any).value} />
            <button type="button" class="w-20 border rounded-md px-2 bg-blue-800 text-white" onClick={searchClick}>Search</button>
        </div>
        <div class="m-1 flex">
            <input type="text" name="phonetic" placeholder="phonetic" class="border px-2 mr-2" value={phonetic} onInput={({ target }) => phonetic.value = (target as any).value}/>
            <input type="text" name="sound" placeholder="sound" class="grow border px-2" value={sound} onInput={({ target }) => sound.value = (target as any).value} />
            <IconPlayerPlayFilled class="w-6 h-6" onClick={playClick} />
        </div>
        <div class="m-1 flex space-x-2 justify-center">
            <img class="max-h-[480px] max-w-[720px]" src={pic.value || noImage}/>
        </div>
        <div class="m-1 flex space-x-2">
            <input type="text" name="trans" placeholder="trans" class="grow border px-2" value={trans} onInput={({ target }) => trans.value = (target as any).value} />
        </div>
        <div class="m-1 flex space-x-2">
            <div class="flex-grow"></div>
            <button type="botton" class="w-20 border rounded-md px-2 bg-blue-800 text-white" onClick={updateClick}>Update</button>
        </div>
    </>;
}
