import { createSignal } from "solid-js";

const DIALS = [
   "",
   "#home",
   "#help",
   "#about",
   "#issue",
   "#setting",
   "#book",
   "#search",
   "#study",
   "#signup",
   "#signin",
] as const;
export type TDial = (typeof DIALS)[number];

export const [user, setUser] = createSignal("");
export const [tips, setTips] = createSignal("");
export const [isPhaseAnswer, setPhaseAnswer] = createSignal(false);
export const [bid, setBId] = createSignal<string>();
export const [sprint, setSprint] = createSignal(-1);
export const [name, setName] = createSignal("");
export const [showLoading, setShowLoading] = createSignal(false);
export const [loca, setLoca] = createSignal<TDial>("");
export const [vocabulary, setVocabulary] = createSignal<Set<string>>(new Set());

let timeout: NodeJS.Timeout | undefined;
export const hideTips = () => setTips("");
export const go = (d?: TDial) => setLoca(d ?? (user() ? "#home" : "#about"));
export const showTips = (content: string, autohide = true) => {
   setTips(content);
   if (autohide) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(hideTips, 3000);
   }
};
