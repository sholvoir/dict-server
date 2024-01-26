import { useRef } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { IDict } from "../lib/idict.ts";
import Cookies from "js-cookie";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";

const baseApi = '/api';
//const noImage = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
const inputNames = ['word','pic','trans','sound','phonetic'];
type InputName = typeof inputNames[number];

export default function Lookup() {
    const auth = Cookies.get('auth');
    const inputs: Record<InputName, Signal<string>> = {};
    for (const name of inputNames) inputs[name] = useSignal('');
    const tips = useSignal('');
    const player = useRef<HTMLAudioElement>(null);
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const hideTips = () => tips.value = '';
    const handleInput = (ev: Event) => {
        const target = ev.target as HTMLInputElement|HTMLTextAreaElement;
        inputs[target.name].value = target.value;
    }
    const handleSearchClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            inputs['pic'].value = dic.pic ?? ''
            inputs['trans'].value = dic.trans ?? '';
            inputs['sound'].value = dic.sound ?? '';
            inputs['phonetic'].value = dic.phonetic ?? '';
        } else showTips(res.statusText);
    }
    const handlePlayClick = () => {
        if (!inputs['sound'].value) return showTips('no sound to play!');
        player.current?.play();
    }
    const handleUpdateClick = async () => {
        const dict: IDict = {};
        if (inputs['pic'].value) dict.pic = inputs['pic'].value;
        if (inputs['trans'].value) dict.trans = inputs['trans'].value;
        if (inputs['sound'].value) dict.sound = inputs['sound'].value;
        if (inputs['phonetic'].value) dict.phonetic = inputs['phonetic'].value;
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`,
            { method: 'PATCH', cache: 'no-cache', body: JSON.stringify(dict) }
        );
        if (res.ok) showTips(`success update word "${inputs['word'].value}"!`);
        else showTips('Network Error!');
    };
    const handleDeleteClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(inputs['word'].value)}`,
            { method: 'DELETE', cache: 'no-cache' }
        );
        if (res.ok) showTips(`success delete word "${inputs['word'].value}"!`);
        else showTips('Network Error!');
    };
    return <div class="flex flex-col gap-2">
        <div class="absolute top-0 inset-x-[10%] bg-[rgba(255,255,0,0.5)] text-center rounded-md [&>*]:w-full [&>*]:px-2 [&>input]:border [&>textarea]:border" onClick={hideTips}>{tips.value}</div>
        <input type="text" name="word" placeholder="word" value={inputs['word'].value} onInput={handleInput} onChange={handleSearchClick}/>
        <input type="text" name="phonetic" placeholder="phonetic" value={inputs['phonetic'].value} onInput={handleInput}/>
        <textarea name="trans" placeholder="trans" class="h-32" value={inputs['trans'].value} onInput={handleInput}/>
        {/*<div class="flex gap-2">
            <img class="max-h-[480px] max-w-[720px]" src={inputs['pic'].value || noImage}/>
            <textarea name="pic" placeholder="pic" class="grow border px-2"
                value={inputs['pic'].value} onInput={handleInput}/>
        </div>*/}
        <textarea name="sound" placeholder="sound" class="h-32" value={inputs['sound'].value} onInput={handleInput}/>
        <div class="w-full flex">
            <button class="w-20 border rounded-md px-2 bg-blue-800 text-white disabled:opacity-50 disabled:bg-gray-500"
                type="button" disabled={!inputs['word'].value} onClick={handleSearchClick}>Search</button>
            <button class="w-20 border rounded-md px-2 bg-blue-800 text-white disabled:opacity-50 disabled:bg-gray-500"
                type="botton" disabled = {!auth || !inputs['word'].value} onClick={handleDeleteClick}>Delete</button>
            <button class="w-20 border rounded-md px-2 bg-blue-800 text-white disabled:opacity-50 disabled:bg-gray-500"
                type="botton" disabled = {!auth || !inputs['word'].value} onClick={handleUpdateClick}>Update</button>
            <div class="grow"/>
            <button class="disabled:opacity-50" type="botton" onClick={handlePlayClick}
                disabled={!inputs['sound'].value}><IconPlayerPlayFilled class="w-6 h-6"/></button>
        </div>
        <audio ref={player} src={inputs['sound'].value}/>
    </div>;
}
