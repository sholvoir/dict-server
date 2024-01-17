import { Signal, useSignal } from "@preact/signals";
import { IDict } from "../lib/idict.ts";
import Cookies from "js-cookie";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";

const baseApi = '/api';
const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
const inputNames = ['word','pic','trans','sound','phonetic'];
type InputName = typeof inputNames[number];

export default function Lookup() {
    const inputs: Record<InputName, Signal<string>> = {};
    for (const name of inputNames) inputs[name] = useSignal('');
    const tips = useSignal('');
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const hideTips = () => tips.value = '';
    const handleInput = (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        inputs[target.name].value = target.value;
    }
    const handleSearchClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            inputs['phonetic'].value = dic.phonetic!;
            inputs['trans'].value = dic.trans!;
            inputs['sound'].value = dic.sound!;
            inputs['pic'].value = dic.pic!
        } else showTips(await res.text());
    }
    const handlePlayClick = () => {
        if (!inputs['sound'].value) return showTips('no sound to play!');
        try { (new Audio(inputs['sound'].value)).play(); }
        catch (e) { showTips(e.toString()); }
    }
    const handleUpdateClick = async () => {
        const dict: IDict = {};
        if (inputs['pic'].value) dict.trans = inputs['pic'].value;
        if (inputs['trans'].value) dict.trans = inputs['trans'].value;
        if (inputs['sound'].value) dict.trans = inputs['sound'].value;
        if (inputs['phonetic'].value) dict.trans = inputs['phonetic'].value;
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`,
            { method: 'PATCH', cache: 'no-cache', body: JSON.stringify(dict) }
        );
        if (res.ok) showTips(`success upate word "${inputs['word'].value}"!`);
        else showTips('Network Error!');
    }
    return <div class="[&>div]:m-1 [&>div]:flex [&>div]:gap-2">
        <div class="absolute top-0 inset-x-[10%] bg-[rgba(255,255,0,0.5)] text-center rounded-md" onClick={hideTips}>{tips.value}</div>
        <div>
            <input type="text" name="word" placeholder="word"
                class="grow border px-2" value={inputs['word'].value}
                onInput={handleInput} onChange={handleSearchClick}/>
            <button type="button" class="w-20 border rounded-md px-2 bg-blue-800 text-white"
                onClick={handleSearchClick}>Search</button>
        </div>
        <div>
            <input type="text" name="phonetic" placeholder="phonetic"
                class="border px-2 mr-1" value={inputs['phonetic'].value} onInput={handleInput}/>
            <input type="text" name="trans" placeholder="trans"
                class="grow border px-2" value={inputs['trans'].value}
                onInput={handleInput} />
        </div>
        <div class="justify-center">
            <img class="max-h-[480px] max-w-[720px]" src={inputs['pic'].value || noImage}/>
        </div>
        <div>
            <textarea name="pic" placeholder="pic" class="grow border px-2"
                value={inputs['pic'].value} onInput={handleInput}/>
        </div>
        <div>
            <textarea name="sound" placeholder="sound" class="grow border h-48 px-2"
                value={inputs['sound'].value} onInput={handleInput}/>
            <button onClick={handlePlayClick}><IconPlayerPlayFilled class="w-6 h-6"/></button>
        </div>
        <div class="justify-end">
            <button type="botton" class="w-20 border rounded-md px-2 bg-blue-800 text-white disabled:opacity-50 disabled:bg-gray-300"
                disabled = {!Cookies.get('auth')}
                onClick={handleUpdateClick}>Update</button>
        </div>
    </div>;
}
