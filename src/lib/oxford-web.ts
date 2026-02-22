import {
   DOMParser,
   type Element,
   type HTMLDocument,
   NodeType,
} from "@b-fuze/deno-dom";
import type {
   IGrammar,
   IInflection,
   IInflections,
   ILabels,
   IOxfordWebEntry,
   IPhonetic,
   IPronounce,
   ISense,
   ISpec,
   IV,
   IVariant,
} from "./i-oxford-web.ts";
import type { IDictionary } from "./idict.ts";

const version = 4;
const baseUrl = "https://www.oxfordlearnersdictionaries.com/us/search/english";

const extractLabels = (span: Element): ILabels => ({
   type: "labels",
   value: span.textContent!.replaceAll(/[()]/g, "").split(", "),
});

const extractVariant = (div: Element): IVariant | undefined => {
   const variant: Array<ISpec | ILabels | IGrammar | IV> = [];
   for (const variantsChildNode of div.childNodes) {
      if (variantsChildNode.nodeType === NodeType.TEXT_NODE) {
         const spec = variantsChildNode.nodeValue
            ?.replaceAll(/[()]/g, "")
            .trim();
         if (spec) variant.push({ type: "spec", value: spec });
      } else if (variantsChildNode.nodeType === NodeType.ELEMENT_NODE) {
         const variantsChild = variantsChildNode as Element;
         if (
            variantsChild.tagName === "SPAN" ||
            variantsChild.classList.contains("v-g")
         ) {
            for (const child of variantsChild.children) {
               if (child.tagName === "SPAN") {
                  if (child.classList.contains("labels"))
                     variant.push(extractLabels(child));
                  if (child.classList.contains("v"))
                     variant.push({ type: "v", value: child.textContent });
                  if (child.classList.contains("grammar"))
                     variant.push({
                        type: "grammar",
                        value: child.textContent,
                     });
               }
            }
         }
      }
   }
   if (variant.length) return { type: "variants", value: variant };
};

const extractPhonetics = (span: Element) => {
   const phonetics: Array<IPhonetic> = [];
   for (const div of span.children)
      if (div.tagName === "DIV") {
         const phonetic: IPhonetic = { geo: div.getAttribute("geo") };
         const prs: Array<IPronounce> = [];
         for (const soundDiv of div.querySelectorAll(
            "div.sound.audio_play_button.icon-audio",
         )) {
            const ph: IPronounce = {};
            ph.sound = soundDiv.getAttribute("data-src-mp3");
            const phonSpan = soundDiv.nextSibling;
            if (phonSpan) ph.phon = phonSpan.textContent;
            prs.push(ph);
         }
         phonetic.prs = prs;
         phonetics.push(phonetic);
      }
   return phonetics;
};

const labelRegex = /(?:\(|,\s)(\w+)\s/;
const extractInflections = (div: Element): IInflections | undefined => {
   const inflections: Array<IInflection> = [];
   let inflection: IInflection = { label: "", inflected: [] as Array<string> };
   for (const childNode of div.childNodes) {
      if (childNode.nodeType === NodeType.TEXT_NODE) {
         const text = childNode.nodeValue;
         if (!text) continue;
         if (text === ")") {
            inflections.push(inflection);
            break;
         } else {
            const match = labelRegex.exec(text);
            if (match) {
               if (inflection.label && inflection.inflected.length)
                  inflections.push(inflection);
               const label = match[1];
               inflection = { label, inflected: [] };
            }
         }
      } else if (childNode.nodeType === NodeType.ELEMENT_NODE) {
         const child = childNode as Element;
         if (
            child.tagName === "SPAN" &&
            child.classList.contains("inflected_form")
         ) {
            inflection.inflected.push(child.textContent);
         }
      }
   }
   if (inflections.length) return { type: "inflections", value: inflections };
};

const extractWebTop = (div: Element, entry: IOxfordWebEntry) => {
   for (const child of div.children) {
      switch (child.tagName) {
         case "H1":
            if (child.classList.contains("headword"))
               entry.headWord = child.textContent;
            break;
         case "SPAN":
            if (child.classList.contains("pos")) {
               entry.pos = child.textContent;
               child.classList.remove("pos");
            } else if (child.classList.contains("phonetics")) {
               entry.phonetics = extractPhonetics(child);
            }
      }
   }
};

const extractSense = (ele: Element, sense: ISense, shcut?: string) => {
   if (shcut) sense.push({ type: "shcut", value: shcut });
   for (const child of ele.children)
      switch (child.tagName) {
         case "SPAN":
            if (child.classList.contains("sensetop"))
               extractSense(child, sense);
            else if (child.classList.contains("pos"))
               sense.push({ type: "pos", value: child.textContent });
            else if (child.classList.contains("dis-g"))
               sense.push({ type: "disg", value: child.textContent });
            else if (child.classList.contains("grammar"))
               sense.push({ type: "grammar", value: child.textContent });
            else if (child.classList.contains("use"))
               sense.push({ type: "use", value: child.textContent });
            else if (child.classList.contains("labels"))
               sense.push(extractLabels(child));
            else if (child.classList.contains("sep"))
               sense.push({ type: "sep", value: child.textContent });
            else if (child.classList.contains("cf"))
               sense.push({ type: "cf", value: child.textContent });
            else if (child.classList.contains("def"))
               sense.push({ type: "def", value: child.textContent });
            break;
         case "DIV":
            if (child.classList.contains("variants")) {
               const variant = extractVariant(child);
               if (variant) sense.push(variant);
            } else if (child.classList.contains("inflections")) {
               const inflections = extractInflections(child);
               if (inflections) sense.push(inflections);
            }
      }
};

const extract = (doc: HTMLDocument): IOxfordWebEntry | undefined => {
   const entry: IOxfordWebEntry = {};
   const entryDiv = doc.querySelector("#entryContent>.entry");
   if (!entryDiv) return;
   const webTopDiv = entryDiv.querySelector(".top-container>.top-g>.webtop");
   if (webTopDiv) {
      extractWebTop(webTopDiv, entry);
      const webTop: ISense = [];
      extractSense(webTopDiv, webTop);
      if (webTop.length) entry.webTop = webTop;
   }
   const sensesOl = entryDiv.querySelector(
      "ol.sense_single, ol.senses_multiple",
   );
   if (sensesOl) {
      entry.senses = [];
      for (const olChild of sensesOl.children) {
         if (
            olChild.tagName === "SPAN" &&
            olChild.classList.contains("shcut-g")
         ) {
            const shcutH2 = olChild.querySelector("h2.shcut");
            for (const senseLi of olChild.querySelectorAll("li.sense")) {
               const sense: ISense = [];
               extractSense(senseLi, sense, shcutH2?.textContent);
               if (sense.length) entry.senses.push(sense);
            }
         } else if (
            olChild.tagName === "LI" &&
            olChild.classList.contains("sense")
         ) {
            const sense: ISense = [];
            extractSense(olChild, sense);
            if (sense.length) entry.senses.push(sense);
         }
      }
   }
   return entry;
};

const fill = async (dict: IDictionary, userAgent: string) => {
   if (!dict.input) return dict;
   if (dict.oxford_web && dict.oxford_web.version >= version) return dict;
   const word = encodeURIComponent(dict.input);
   const ids = new Set<string>();
   const entries: Array<IOxfordWebEntry> = [];
   let ref = `${baseUrl}/?q=${word}`;
   const cookies: Record<string, string> = {};
   const readUrl = async (url: string, e: boolean) => {
      const res = await fetch(url, {
         headers: {
            "User-Agent": userAgent,
            Referer: ref,
            Cookie: Object.entries(cookies)
               .map(([k, v]) => `${k}=${v}`)
               .join("; "),
         },
      });
      if (!res.ok) return;
      for (const cookie of res.headers.getSetCookie()) {
         const [k, v] = cookie.split("; ")[0].split("=");
         cookies[k] = v;
      }
      const doc = new DOMParser().parseFromString(
         await res.text(),
         "text/html",
      );
      if (e) {
         const entry = extract(doc);
         if (entry) entries.push(entry);
      }
      const nearbyUl = doc.querySelector(".nearby>.list-col");
      if (!nearbyUl) return;
      const changedWord = word.replaceAll("%20", "-").toLocaleLowerCase();
      for (const li of nearbyUl.children)
         if (li.tagName === "LI")
            for (const a of li.querySelectorAll("a")) {
               const href = a.getAttribute("href");
               if (!href) continue;
               const m = /\/([\w_+-]+)$/.exec(href);
               if (!m) continue;
               const id = m[1];
               const w = id.replaceAll(/[\d_]/g, "").toLocaleLowerCase();
               if (w !== changedWord) continue;
               if (ids.has(id)) continue;
               ids.add(id);
               ref = url;
               await readUrl(href, true);
            }
   };
   await readUrl(ref, false);
   if (!entries.length) return dict;
   dict.oxford_web = { version, entries };
   dict.modified = true;
   return dict;
};

export default fill;

if (import.meta.main) {
   const userAgent =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
   for (const word of Deno.args) {
      await Deno.writeTextFile(
         `z.json`,
         JSON.stringify(await fill({ input: word }, userAgent), null, 2),
      );
   }
}
