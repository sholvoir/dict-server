import type {
   IInflection,
   ISense,
   ISenseTop,
   IVariant,
   IWebTop,
} from "./i-oxford-web.ts";
import type { IDictionary } from "./idict.ts";
import type { IDict, IEntry } from "./imic.ts";

const collinsTail = /(?<=[.?] )([\W; ]+?)$/;
const replace: Record<string, string> = {
   "，": ",",
   "、": ",",
   "；": ";",
   "（": "(",
   "）": ")",
   " ": "",
};
const refine = (o?: string) =>
   o?.replaceAll(/([，、；（）]|(?<!\w) (?!\w))/g, (m) => replace[m]);

const variantToString = (variant: IVariant) => {
   if (variant.length === 1 && variant[0].v) return `<b>${variant[0].v}</b>`;
   const variantStr = [];
   for (const item of variant) {
      if (item.spec) variantStr.push(item.spec);
      if (item.labels) variantStr.push(item.labels.join(", "));
      if (item.v) variantStr.push(`<b>${item.v}</b>`);
      if (item.grammar) variantStr.push(item.grammar);
   }
   return `<i>(${variantStr.join(" ")})</i>`;
};

const inflectionsToString = (inflections: Array<IInflection>) =>
   inflections
      .map(
         (inflection) =>
            `${inflection.label} ${inflection.inflected
               .map((i) => `<b>${i}</b>`)
               .join(", ")}`,
      )
      .join(", ");

const webTopToString = (webtop: IWebTop): string | undefined => {
   const webtopArray = [];
   if (webtop.inflections)
      webtopArray.push(`(${inflectionsToString(webtop.inflections)})`);
   if (webtop.grammar) webtopArray.push(webtop.grammar);
   if (webtop.labels) webtopArray.push(`<i>(${webtop.labels.join(", ")})</i>`);
   if (webtop.variants)
      for (const variant of webtop.variants) {
         webtopArray.push(variantToString(variant));
      }
   if (webtop.use) webtopArray.push(webtop.use);
   if (webtop.def) webtopArray.push(webtop.def);
   if (webtopArray.length) return webtopArray.join(" ");
};

const senseTopToString = (senseTop: ISenseTop): string => {
   const senseTopArray = [];
   if (senseTop.variants)
      for (const variant of senseTop.variants)
         senseTopArray.push(variantToString(variant));
   if (senseTop.grammar) senseTopArray.push(senseTop.grammar);
   if (senseTop.cf)
      senseTopArray.push(
         senseTop.cf.map((c: string) => `<b>${c}</b>`).join(" | "),
      );
   if (senseTop.inflections)
      senseTopArray.push(`(${inflectionsToString(senseTop.inflections)})`);
   if (senseTop.labels)
      senseTopArray.push(`<i>(${senseTop.labels.join(", ")})</i>`);
   if (senseTop.disg) senseTopArray.push(senseTop.disg);
   if (senseTop.use) senseTopArray.push(senseTop.use);
   if (senseTop.def) senseTopArray.push(senseTop.def);
   return senseTopArray.join(" ");
};

const senseToString = (sense: ISense): string | undefined => {
   const meanArray = [];
   if (sense.shcut) meanArray.push(`(${sense.shcut})`);
   if (sense.senseTop) meanArray.push(senseTopToString(sense.senseTop));
   if (sense.variants)
      for (const variant of sense.variants)
         meanArray.push(variantToString(variant));
   if (sense.grammar) meanArray.push(sense.grammar);
   if (sense.cf)
      meanArray.push(sense.cf.map((c: string) => `<b>${c}</b>`).join(" | "));
   if (sense.inflections)
      meanArray.push(`(${inflectionsToString(sense.inflections)})`);
   if (sense.labels) meanArray.push(`<i>(${sense.labels.join(", ")})</i>`);
   if (sense.disg) meanArray.push(sense.disg);
   if (sense.use) meanArray.push(sense.use);
   if (sense.def) meanArray.push(sense.def);
   if (meanArray.length) return meanArray.join(" ");
};

const fill = (dict: IDictionary) => {
   if (!dict.input) return dict;
   if (dict.mic) return dict;
   const word = dict.input;
   const entry: IEntry = { phonetic: "", meanings: {} };
   const mic: IDict = {
      word,
      version: Date.now(),
      entries: [entry],
   };
   // Webster Web
   if (dict.webster_web?.sound) entry.sound = dict.webster_web.sound;
   // Webster API
   if (!entry.sound && dict.webster_api) {
      const element = dict.webster_api[0];
      if (typeof element !== "string") {
         const audio = element.hwi?.prs?.[0]?.sound?.audio;
         if (audio) entry.sound = audio;
      }
   }
   // Oxford Web
   if (dict.oxford_web) {
      const phonetics = new Set<string>();
      for (const element of dict.oxford_web.entries)
         if (element.phonetics)
            for (const phonet of element.phonetics)
               if (phonet.geo === "n_am")
                  for (const pr of phonet.prs ?? []) {
                     if (pr.phon) phonetics.add(pr.phon);
                     if (!entry.sound && pr.sound) entry.sound = pr.sound;
                  }
      if (phonetics.size) entry.phonetic = Array.from(phonetics).join(",");
      for (const element of dict.oxford_web.entries) {
         if (element.senses) {
            const pos = element.pos ?? "unkown";
            const means: Array<string> = [];
            if (element.webTop) {
               const mean = webTopToString(element.webTop);
               if (mean) means.push(mean);
            }
            for (const sense of element.senses) {
               const mean = senseToString(sense);
               if (mean) means.push(mean);
            }
            entry.meanings![pos] = means;
         }
      }
   }
   // Collins Primary Dict
   if ((!entry.phonetic || !entry.sound) && dict.collins_primary) {
      const cp = dict.collins_primary;
      if (cp.words?.word === word && cp.gramcat?.length) {
         for (const gram of dict.collins_primary.gramcat) {
            if (!entry.phonetic && gram.pronunciation)
               entry.phonetic = `/${gram.pronunciation}/`;
            if (!entry.sound && gram.audiourl) entry.sound = gram.audiourl;
         }
      }
   }
   // Simple Dict
   if ((!entry.phonetic || !entry.sound) && dict.simple?.word?.length)
      for (const x of dict.simple.word) {
         if (x["return-phrase"] !== word) continue;
         if (!entry.phonetic && x.usphone) entry.phonetic = `/${x.usphone}/`;
         if (!entry.sound && x.usspeech) entry.sound = x.usspeech;
      }
   // Collins Dict
   if (!entry.meanings && dict.collins?.collins_entries?.length) {
      const collinsTran = new RegExp(`<b>${word}`, "i");
      const meanings: Record<string, Array<string>> = {};
      for (const x of dict.collins.collins_entries) {
         if (x.entries?.entry?.length)
            for (const y of x.entries.entry) {
               if (y.tran_entry?.length)
                  for (const z of y.tran_entry) {
                     const pos = z.pos_entry?.pos;
                     if (
                        (z.headword && z.headword !== word) ||
                        pos?.toLowerCase().includes("phrase")
                     )
                        continue;
                     if (z.tran?.match(collinsTran)) {
                        const m = z.tran.match(collinsTail);
                        if (m) {
                           const item = refine(m[1])!;
                           if (meanings[pos]) meanings[pos].push(item);
                           else meanings[pos] = [item];
                           1;
                        }
                     }
                  }
            }
      }
      if (Object.keys(meanings).length) entry.meanings = meanings;
   }
   // Individual Dict
   if (!entry.meanings && dict.individual?.trs?.length) {
      const meanings: Record<string, Array<string>> = {};
      for (const x of dict.individual.trs) {
         const item = refine(x.tran)!;
         if (meanings[x.pos]) meanings[x.pos].push(item);
         else meanings[x.pos] = [item];
      }
      if (Object.keys(meanings).length) entry.meanings = meanings;
   }
   // English-Chinese Dict
   const nameRegex = new RegExp(`【名】|（人名）|（${word}）人名`, "i");
   if (dict.ec?.word?.length) {
      const means: Array<string> = [];
      for (const x of dict.ec.word) {
         if (!entry.phonetic && x.usphone) entry.phonetic = `/${x.usphone}/`;
         if (!entry.sound && x.usspeech) entry.sound = x.usspeech;
         if (x.trs?.length)
            for (const y of x.trs) {
               if (y.tr?.length)
                  for (const z of y.tr) {
                     if (z.l?.i?.length)
                        for (const w of z.l.i) {
                           if (w.match(nameRegex)) continue;
                           means.push(refine(w)!);
                        }
                  }
            }
      }
      if (!entry.meanings) entry.meanings = { ecdict: means };
      else entry.meanings = { ecdict: means, ...entry.meanings };
   }
   dict.mic = mic;
   return dict;
};

export default fill;
