import { IS_BROWSER } from "$fresh/runtime.ts";
import { VOCABULARY_URL } from "../lib/common.ts";
import { IDict } from "../lib/idict.ts";
import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { requestInit } from "@sholvoir/generic/http";
import Cookies from "js-cookie";
import TextInput from "@sholvoir/components/islands/input-text.tsx";
import TextareaInput from "@sholvoir/components/islands/input-textarea.tsx";
import ButtonBase from "@sholvoir/components/islands/button-base.tsx";
import Button from "@sholvoir/components/islands/button-ripple.tsx";

const vocabulary: Array<string> = [];

export default function Lookup() {
    if (!IS_BROWSER) return <div/>
    const auth = Cookies.get('auth');
    const ini = useSignal(false);
    const word = useSignal('');
    const def = useSignal('');
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
        const res = await fetch(`/pub/word?q=${encodeURIComponent(word.value)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            def.value = dic.def ?? '';
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
        const dict: IDict = {};
        if (def.value) dict.def = def.value;
        if (trans.value) dict.trans = trans.value;
        if (phonetic.value) dict.phonetic = phonetic.value;
        if (sound.value) dict.sound = sound.value;
        const res = await fetch(`/api/word?q=${encodeURIComponent(word.value)}`, requestInit(dict, 'PUT'));
        if (res.ok) showTips(`success update word "${word.value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const handleDeleteClick = async () => {
        const res = await fetch(`/api/word?q=${encodeURIComponent(word.value)}`, { method: 'DELETE' });
        if (res.ok) showTips(`success delete word "${word.value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const init = async () => {
        const res1 = await fetch(VOCABULARY_URL, { cache: 'force-cache' });
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
    return <div class="h-[100dvh] p-2 mx-auto flex flex-col gap-2 bg-cover bg-center text-2xl">
        <div class="fixed top-0 inset-x-0 bg-[#ff08] text-center " onClick={hideTips}>{tips.value}</div>
        <TextInput name="word" placeholder="word" class="w-full [&>div]:bg-stone-200 dark:[&>div]:bg-stone-800"
            binding={word} options={vocabulary} onChange={handleSearchClick}/>
        <TextInput name="phonetic" placeholder="phonetic" binding={phonetic}/>
        <TextareaInput name="trans" placeholder="trans" class="h-32 grow" binding={trans}/>
        <TextareaInput name="def" placeholder="def" class="h-32 grow" binding={def}/>
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
