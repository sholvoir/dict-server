import type { IInflections, ISense, IVariant } from "./i-oxford-web.ts";
import type { IDictionary } from "./idict.ts";
import type { IDict, IEntry } from "./imic.ts";

const collinsTail = /(?<=[.?] )([\W; ]+?)$/;
const replace: Record<string, string> = {
   "，": ",",
   "、": ",",
   "；": ";",
   "（": "(",
   "）": ")",
   "<": "(",
   ">": ")",
   " ": "",
};
const refine = (o?: string) =>
   o?.replaceAll(/([，、；（）<>]|(?<!\w) (?!\w))/g, (m) => replace[m]);

const variantToString = (variant: IVariant) => {
   if (variant.value.length === 1 && variant.value[0].type === "v")
      return `<b>${variant.value[0].value}</b>`;
   const variantStr = [];
   for (const item of variant.value) {
      switch (item.type) {
         case "spec":
            variantStr.push(item.value);
            break;
         case "labels":
            variantStr.push(item.value.join(", "));
            break;
         case "v":
            variantStr.push(`<b>${item.value}</b>`);
            break;
         case "grammar":
            variantStr.push(item.value);
            break;
      }
   }
   return `<i>(${variantStr.join(" ")})</i>`;
};

const inflectionsToString = (inflections: IInflections) =>
   inflections.value
      .map(
         (inflection) =>
            `${inflection.label} ${inflection.inflected
               .map((i) => `<b>${i}</b>`)
               .join(", ")}`,
      )
      .join(", ");

const senseToString = (sense: ISense): string | undefined => {
   const mean = [];
   for (const item of sense) {
      switch (item.type) {
         case "shcut":
            mean.push(`(${item.value})`);
            break;
         case "pos":
            mean.push(`<i>${item.value}</i>`);
            break;
         case "labels":
            mean.push(`<i>(${item.value.join(", ")})</i>`);
            break;
         case "variants":
            mean.push(variantToString(item));
            break;
         case "grammar":
            mean.push(item.value);
            break;
         case "inflections":
            mean.push(`(${inflectionsToString(item)})`);
            break;
         case "disg":
            mean.push(item.value);
            break;
         case "sep":
            mean.push(item.value);
            break;
         case "cf":
            mean.push(`<b>${item.value}</b>`);
            break;
         case "use":
            mean.push(item.value);
            break;
         case "def":
            mean.push(item.value);
            break;
      }
   }
   if (mean.length) return mean.join(" ");
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
               const mean = senseToString(element.webTop)?.replace("’", "'");
               if (mean) means.push(mean);
            }
            for (const sense of element.senses) {
               const mean = senseToString(sense)?.replace("’", "'");
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
