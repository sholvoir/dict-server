import {
   DOMParser,
   type Element,
   type HTMLDocument,
   NodeType,
} from "@b-fuze/deno-dom";
import type {
   IInflection,
   IOxfordWebEntry,
   IPhonetic,
   IPronounce,
   ISense,
   ISenseTop,
   IVariant,
   IWebTop,
} from "./i-oxford-web.ts";
import type { IDictionary } from "./idict.ts";

const version = 2;
const userAgent =
   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const baseUrl = "https://www.oxfordlearnersdictionaries.com/us/search/english";
const regId = /\/([\w_+-]+)$/;
const regId2Word = /[\d_]/g;

const labelsRegex = /[()]/g;
const extractLabels = (span: Element) =>
   span.textContent.replaceAll(labelsRegex, "").split(", ");

const extractVariant = (div: Element) => {
   const variant: IVariant = [];
   for (const variantsChildNode of div.childNodes) {
      if (variantsChildNode.nodeType === NodeType.TEXT_NODE) {
         const spec = variantsChildNode.nodeValue
            ?.replaceAll(labelsRegex, "")
            .trim();
         if (spec) variant.push({ spec });
      } else if (variantsChildNode.nodeType === NodeType.ELEMENT_NODE) {
         const variantsChild = variantsChildNode as Element;
         if (
            variantsChild.tagName === "SPAN" ||
            variantsChild.classList.contains("v-g")
         ) {
            for (const child of variantsChild.children) {
               if (child.tagName === "SPAN") {
                  if (child.classList.contains("labels"))
                     variant.push({ labels: child.textContent!.split(", ") });
                  if (child.classList.contains("v"))
                     variant.push({ v: child.textContent });
                  if (child.classList.contains("grammar"))
                     variant.push({ grammar: child.textContent });
               }
            }
         }
      }
   }
   return variant;
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
const extractInflections = (div: Element) => {
   const inflections = [];
   let inflection: IInflection = { label: "", inflected: [] as Array<string> };
   for (const childNode of div.childNodes) {
      if (childNode.nodeType === NodeType.TEXT_NODE) {
         const text = childNode.nodeValue;
         if (!text) continue;
         if (text === ")") {
            inflections.push(inflection);
            return inflections;
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
   return inflections;
};

const extractWebTop = (div: Element, entry: IOxfordWebEntry) => {
   // headword, pos, phonetics, variants, inflections, labels
   const webTop: IWebTop = {};
   for (const webTopChild of div.children) {
      switch (webTopChild.tagName) {
         case "H1":
            if (webTopChild.classList.contains("headword"))
               entry.headWord = webTopChild.textContent;
            break;
         case "SPAN":
            if (webTopChild.classList.contains("pos")) {
               entry.pos = webTopChild.textContent;
            } else if (webTopChild.classList.contains("phonetics")) {
               entry.phonetics = extractPhonetics(webTopChild);
            } else if (webTopChild.classList.contains("labels")) {
               webTop.labels = extractLabels(webTopChild);
            } else if (webTopChild.classList.contains("use")) {
               webTop.use = webTopChild.textContent;
            } else if (webTopChild.classList.contains("grammar")) {
               webTop.grammar = webTopChild.textContent;
            } else if (webTopChild.classList.contains("def")) {
               webTop.def = webTopChild.textContent;
            }
            break;
         case "DIV":
            if (webTopChild.classList.contains("variants")) {
               if (!webTop.variants) webTop.variants = [];
               webTop.variants.push(extractVariant(webTopChild));
            } else if (webTopChild.classList.contains("inflections")) {
               webTop.inflections = extractInflections(webTopChild);
            }
      }
   }
   if (Object.keys(webTop).length) entry.webTop = webTop;
};

const extractSenseTop = (span: Element) => {
   // variants, grammar, def
   const senseTop: ISenseTop = {};
   for (const child of span.children)
      switch (child.tagName) {
         case "SPAN":
            if (child.classList.contains("dis-g"))
               senseTop.disg = child.textContent;
            else if (child.classList.contains("cf")) {
               if (!senseTop.cf) senseTop.cf = [];
               senseTop.cf.push(child.textContent);
            } else if (child.classList.contains("grammar"))
               senseTop.grammar = child.textContent;
            else if (child.classList.contains("labels"))
               senseTop.labels = extractLabels(child);
            else if (child.classList.contains("def"))
               senseTop.def = child.textContent;
            break;
         case "DIV":
            if (child.classList.contains("variants")) {
               if (!senseTop.variants) senseTop.variants = [];
               senseTop.variants.push(extractVariant(child));
            } else if (child.classList.contains("inflections"))
               senseTop.inflections = extractInflections(child);
      }
   return senseTop;
};

const extractSense = (li: Element, shcut?: string) => {
   const sense: ISense = {};
   if (shcut) sense.shcut = shcut;
   for (const child of li.children)
      switch (child.tagName) {
         case "SPAN":
            if (child.classList.contains("sensetop")) {
               const senseTop = extractSenseTop(child);
               if (Object.keys(senseTop).length) sense.senseTop = senseTop;
            } else if (child.classList.contains("dis-g"))
               sense.disg = child.textContent;
            else if (child.classList.contains("grammar"))
               sense.grammar = child.textContent;
            else if (child.classList.contains("use"))
               sense.use = child.textContent;
            else if (child.classList.contains("labels"))
               sense.labels = extractLabels(child);
            else if (child.classList.contains("cf")) {
               if (!sense.cf) sense.cf = [];
               sense.cf.push(child.textContent);
            } else if (child.classList.contains("def"))
               sense.def = child.textContent;
            break;
         case "DIV":
            if (child.classList.contains("variants")) {
               if (!sense.variants) sense.variants = [];
               sense.variants.push(extractVariant(child));
            } else if (child.classList.contains("inflections"))
               sense.inflections = extractInflections(child);
      }
   return sense;
};

const extract = (doc: HTMLDocument): IOxfordWebEntry | undefined => {
   const entry: IOxfordWebEntry = {};
   const entryDiv = doc.querySelector("#entryContent>.entry");
   if (!entryDiv) return;
   const webTopDiv = entryDiv.querySelector(".top-container>.top-g>.webtop");
   if (webTopDiv) extractWebTop(webTopDiv, entry);
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
               const sense = extractSense(senseLi, shcutH2?.textContent);
               if (Object.keys(sense).length) entry.senses.push(sense);
            }
         } else if (
            olChild.tagName === "LI" &&
            olChild.classList.contains("sense")
         ) {
            const sense = extractSense(olChild);
            if (Object.keys(sense).length) entry.senses.push(sense);
         }
      }
   }
   return entry;
};

const fill = async (dict: IDictionary) => {
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
               const m = regId.exec(href);
               if (!m) continue;
               const id = m[1];
               const w = id.replaceAll(regId2Word, "").toLocaleLowerCase();
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

if (import.meta.main)
   for (const word of Deno.args) {
      await Deno.writeTextFile(
         `z.json`,
         JSON.stringify(await fill({ input: word }), null, 2),
      );
   }
