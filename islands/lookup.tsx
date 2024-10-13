import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IDict } from "../lib/idict.ts";
import { requestInit } from "@sholvoir/generic/http";
import Cookies from "js-cookie";
import TextInput from "@sholvoir/components/islands/input-text.tsx";
import TextareaInput from "@sholvoir/components/islands/input-textarea.tsx";
import ButtonBase from "@sholvoir/components/islands/button-base.tsx";
import Button from "@sholvoir/components/islands/button-ripple.tsx";

const baseApi = '/api';
const vocabularyUrl = 'https://www.micit.co/vocabulary/vocabulary-0.0.24.txt';
const vocabulary: Array<string> = [];

export default function Lookup() {
    if (!IS_BROWSER) return <div/>
    const auth = Cookies.get('auth');
    const ini = useSignal(false);
    const word = useSignal('');
    const def = useSignal('');
    const pic = useSignal('');
    const trans = useSignal('');
    const sound = useSignal('');
    const phonetic = useSignal('');
    const tips = useSignal('');
    const player = useRef<HTMLAudioElement>(null);
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const hideTips = () => tips.value = '';
    const handleSearchClick = async () => {
        const w = word.value;
        const res = await fetch(`${baseApi}/${encodeURIComponent(w)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            def.value = dic.def ?? '';
            pic.value = dic.pic ?? '';
            trans.value = dic.trans ?? '';
            sound.value = dic.sound ?? '';
            phonetic.value = dic.phonetic ?? '';
        } else showTips(`Error: ${res.status}`);
    }
    const handlePlayClick = () => {
        if (!sound.value) return showTips('no sound to play!');
        player.current?.play();
    }
    const handleUpdateClick = async () => {
        const dict: IDict = { def: def.value, trans: trans.value, phonetic: phonetic.value };
        if (sound.value.startsWith("http")) dict.sound = sound.value;
        if (pic.value.startsWith("http")) dict.pic = pic.value;
        const res = await fetch(`${baseApi}/${encodeURIComponent(word.value)}`, requestInit(dict, 'PATCH'));
        if (res.ok) showTips(`success update word "${word.value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const handleDeleteClick = async () => {
        const res = await fetch(`${baseApi}/${encodeURIComponent(word.value)}`, { method: 'DELETE' });
        if (res.ok) showTips(`success delete word "${word.value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const init = async () => {
        const res1 = await fetch(vocabularyUrl, { cache: 'force-cache' });
        if (res1.ok) {
            const delimitor = /[,:] */;
            for (const line of (await res1.text()).split('\n')) {
                let [word] = line.split(delimitor);
                word = word.trim();
                if (word) vocabulary.push(word);
            }
        } else return console.error(res1.status);
        ini.value = true;
    };
    useEffect(() => { init().catch(console.error) }, []);
    return <div class="h-[100dvh] p-2 mx-auto flex flex-col gap-2 bg-cover bg-center text-thick-shadow"
        style={pic.value ? `background-image: url(${pic.value});` : ''}>
        <div class="fixed top-0 inset-x-0 bg-[#ff08] text-center " onClick={hideTips}>{tips.value}</div>
        <TextInput name="word" placeholder="word" class="w-full [&>div]:bg-stone-200 dark:[&>div]:bg-stone-800"
            binding={word} options={vocabulary} onChange={handleSearchClick}/>
        <TextInput name="phonetic" placeholder="phonetic" binding={phonetic}/>
        <TextareaInput name="trans" placeholder="trans" class="h-32 grow" binding={trans}/>
        <TextareaInput name="def" placeholder="def" class="h-32 grow" binding={def}/>
        <TextareaInput name="pic" placeholder="pic" class="h-8" binding={pic}/>
        <TextareaInput name="sound" placeholder="sound" class="h-32" binding={sound}/>
        <div class="w-full flex gap-2 [&>button]:bg-indigo-700 [&>button]:text-white">
            <Button class="disabled:opacity-50 disabled:bg-gray-500"
                disabled={!ini.value || !word.value} onClick={handleSearchClick}>Search</Button>
            <Button class="disabled:opacity-50 disabled:bg-gray-500"
                disabled = {!auth || !word.value} onClick={handleDeleteClick}>Delete</Button>
            <Button class="disabled:opacity-50 disabled:bg-gray-500"
                disabled = {!auth || !word.value} onClick={handleUpdateClick}>Update</Button>
            <div class="grow"/>
            <ButtonBase onClick={handlePlayClick} disabled={!sound.value}>Play</ButtonBase>
        </div>
        <audio ref={player} src={sound.value}/>
    </div>;
}
