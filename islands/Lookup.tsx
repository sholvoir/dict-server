// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />
import { useSignal } from "@preact/signals";
import IconPlayerPlayFilled from "tabler_icons/player-play-filled.tsx";
import { IDict } from "/lib/idict.ts";

const baseApi = '/api/dict';

export default function Counter() {
  const dic = useSignal({ prompt: '', word: '', trans: '', sound: '', phonetics: '' });
  return (
    <>
      <div class="m-1 text-red-500">{prompt}cc</div>
      <div class="m-1 flex space-x-2">
        <input type="text" class="grow border px-2" value={dic.value.word} onInput={({target})=>dic.value.word = (target as any).value}/>
        <button type="button" class="w-20 border rounded-md px-2 bg-blue-800 text-white"
          onClick={async () => {
            const res = await fetch(`${baseApi}/${encodeURIComponent(dic.value.word)}`);
            if (res.ok) {
              const {trans, sound, phonetics } = await res.json() as IDict;
              dic.value.phonetics = phonetics!;
              dic.value.trans = trans!;
              dic.value.sound = sound!;
              dic.value.prompt = '';
            } else {
              dic.value.prompt = await res.text();
            }
          }}>Search</button>
      </div>
      <div class="m-1 flex space-x-2">
        <input type="text" class="border px-2" value={dic.value.phonetics} onInput={({target})=>dic.value.phonetics = (target as any).value} />
        <input type="text" class="grow border px-2" value={dic.value.trans} onInput={({target})=>dic.value.trans = (target as any).value} />
      </div>
      <div class="m-1 flex space-x-2">
        <input type="text" class="flex-grow-1 border" value={dic.value.sound} onInput={({target})=>dic.value.sound = (target as any).value} />
        <IconPlayerPlayFilled class="w-6 h-6"  onClick={() => {
          if (dic.value.sound) {
            try {
              (new Audio(dic.value.sound)).play();
              dic.value.prompt = '';
            } catch (e) {
              dic.value.prompt = e.toString();
            }
          } else {
            dic.value.prompt = 'no sound to play!';
          }
        }}/>
      </div>
      <div class="m-1 flex space-x-2">
        <div class="flex-grow"></div>
        <button type="botton" class="w-20 border rounded-md px-2 bg-blue-800 text-white" onClick={async () => {
          const res = await fetch(`${baseApi}/${encodeURIComponent(dic.value.word)}`, {
            method: 'PATCH',
            cache: 'no-cache',
            body: JSON.stringify({trans: dic.value.trans, sound: dic.value.sound, phonetics: dic.value.phonetics})
          });
          if (res.ok) {
            dic.value.prompt = (`success upate word "${dic.value.word}"!`);
          } else {
            dic.value.prompt = (await res.text());
          }
        }}>Update</button>
      </div>
    </>
  );
}
