import {
   DOMParser,
   type Element,
   type HTMLDocument,
   NodeType,
} from "@b-fuze/deno-dom";

const userAgent =
   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const baseUrl = "https://www.oxfordlearnersdictionaries.com/us/search/english";
const regId = /\/([\w_+-]+)$/;
const regId2Word = /[\d_]/g;

const labelsRegex = /[()]/g;
const extractLabels = (span: Element) =>
   span.textContent.replaceAll(labelsRegex, "").split(", ");

const extractVariant = (div: Element) => {
   const variant: Array<{
      spec?: string;
      labels?: string[];
      v?: string;
      grammar?: string;
   }> = [];
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
   const phonetics = [];
   for (const div of span.children)
      if (div.tagName === "DIV") {
         const phonetic: any = { geo: div.getAttribute("geo") };
         const phs = [];
         for (const soundDiv of div.querySelectorAll(
            "div.sound.audio_play_button.icon-audio",
         )) {
            const ph: any = {};
            ph.sound = soundDiv.getAttribute("data-src-mp3");
            const phonSpan = soundDiv.nextSibling;
            if (phonSpan) ph.phon = phonSpan.textContent;
            phs.push(ph);
         }
         phonetic.phs = phs;
         phonetics.push(phonetic);
      }
   return phonetics;
};

const labelRegex = /(?:\(|,\s)(\w+)\s/;
const extractInflections = (div: Element) => {
   const inflections = [];
   let inflection = { label: "", inflected: [] as Array<string> };
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

const extractWebTop = (div: Element, entry: any) => {
   // headword, pos, phonetics, variants, inflections, labels
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
               entry.labels = extractLabels(webTopChild);
            } else if (webTopChild.classList.contains("use")) {
               entry.use = webTopChild.textContent;
            } else if (webTopChild.classList.contains("grammar")) {
               entry.grammar = webTopChild.textContent;
            } else if (webTopChild.classList.contains("def")) {
               entry.def = webTopChild.textContent;
            }
            break;
         case "DIV":
            if (webTopChild.classList.contains("variants")) {
               if (!entry.variants) entry.variants = [];
               entry.variants.push(extractVariant(webTopChild));
            } else if (webTopChild.classList.contains("inflections")) {
               entry.inflections = extractInflections(webTopChild);
            }
      }
   }
};

const extractSenseTop = (span: Element, sense: any) => {
   // variants, grammar, def
   for (const c of span.children)
      switch (c.tagName) {
         case "SPAN":
            if (c.classList.contains("dis-g")) sense.disg = c.textContent;
            else if (c.classList.contains("cf")) {
               if (!sense.cf) sense.cf = [];
               sense.cf.push(c.textContent);
            } else if (c.classList.contains("grammar"))
               sense.grammar = c.textContent;
            else if (c.classList.contains("labels"))
               sense.labels = extractLabels(c);
            else if (c.classList.contains("def")) sense.def = c.textContent;
            else if (c.classList.contains("xrefs")) {
               const xref = { prefix: "", ref: "" };
               for (const ch of c.children) {
                  if (
                     ch.tagName === "SPAN" &&
                     ch.classList.contains("prefix")
                  ) {
                     xref.prefix = ch.textContent;
                  } else if (
                     ch.tagName === "A" &&
                     ch.classList.contains("Ref")
                  ) {
                     xref.ref = ch.textContent;
                  }
               }
               if (!sense.xrefs) sense.xrefs = [];
               sense.xrefs.push(xref);
            }
            break;
         case "DIV":
            if (c.classList.contains("variants")) {
               if (!sense.variants) sense.variants = [];
               sense.variants.push(extractVariant(c));
            } else if (c.classList.contains("inflections"))
               sense.inflections = extractInflections(c);
      }
};

const extractSenseLi = (li: Element, sense: any) => {
   for (const child of li.children)
      switch (child.tagName) {
         case "SPAN":
            if (child.classList.contains("sensetop"))
               extractSenseTop(child, sense);
            else if (child.classList.contains("dis-g"))
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
            }
      }
};

const extract = (doc: HTMLDocument): any => {
   const entry: any = {};
   const entryDiv = doc.querySelector("#entryContent>.entry");
   if (!entryDiv) return entry;
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
               const sense: any = {};
               if (shcutH2) sense.shcut = shcutH2.textContent;
               extractSenseLi(senseLi, sense);
               if (Object.keys(sense).length) entry.senses.push(sense);
            }
         } else if (
            olChild.tagName === "LI" &&
            olChild.classList.contains("sense")
         ) {
            const sense: any = {};
            extractSenseLi(olChild, sense);
            if (Object.keys(sense).length) entry.senses.push(sense);
         }
      }
   }
   return entry;
};

const oxford = async (word: string): Promise<Array<any>> => {
   const ids = new Set<string>();
   const result: Array<any> = [];
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
      if (e) result.push(extract(doc));
      const nearbyUl = doc.querySelector(".nearby>.list-col");
      if (!nearbyUl) return;
      const changedWord = word.replace("%20", "-");
      for (const li of nearbyUl.children)
         if (li.tagName === "LI")
            for (const a of li.querySelectorAll("a")) {
               const href = a.getAttribute("href");
               if (!href) continue;
               const m = regId.exec(href);
               if (!m) continue;
               const id = m[1];
               const w = id.replaceAll(regId2Word, "");
               if (w !== changedWord) continue;
               if (ids.has(id)) continue;
               ids.add(id);
               ref = url;
               await readUrl(href, true);
            }
   };
   await readUrl(ref, false);
   return result;
};

export default oxford;

if (import.meta.main)
   for (const word of Deno.args) {
      const encodeWord = encodeURIComponent(word);
      await Deno.writeTextFile(
         `z.json`,
         JSON.stringify(await oxford(encodeWord), null, 2),
      );
   }
