import type { IInflections, ISense, IVariant } from "./i-oxford-web.ts";
import type { IDictionary } from "./idictionary.ts";
import type { IDict, IEntry, IPronounce } from "./imic.ts";

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
   const mic: IDict = {
      word,
      version: Date.now(),
      entries: [],
   };
   // English-Chinese Dict
   const nameRegex = new RegExp(`【名】|（人名）|（${word}）人名`, "i");
   if (dict.ec?.word?.length) {
      for (const x of dict.ec.word) {
         const entry: IEntry = { pos: "ecdict" };
         if (x.usphone || x.usspeech) {
            const pronounce: IPronounce = {};
            if (x.usphone) pronounce.phonetic = `/${x.usphone}/`;
            if (x.usspeech) pronounce.sound = x.usspeech;
            entry.pronounces = [pronounce];
         }
         if (x.trs?.length) {
            const meanings: Array<string> = [];
            for (const y of x.trs) {
               if (y.tr?.length)
                  for (const z of y.tr) {
                     if (z.l?.i?.length)
                        for (const w of z.l.i) {
                           if (w.match(nameRegex)) continue;
                           meanings.push(w);
                        }
                  }
            }
            if (meanings.length) entry.meanings = meanings.join("\n");
         }
         mic.entries?.push(entry);
      }
   }
   // Oxford Web
   if (dict.oxford_web) {
      for (const element of dict.oxford_web.entries) {
         const entry: IEntry = { pos: element.pos };
         if (element.phonetics?.length) {
            const pronounces = [];
            for (const phonet of element.phonetics) {
               if (phonet.geo === "n_am")
                  for (const pr of phonet.prs ?? []) {
                     if (pr.sound || pr.phon) {
                        const pronounce: IPronounce = {};
                        if (pr.phon) pronounce.phonetic = pr.phon;
                        if (pr.sound) pronounce.sound = pr.sound;
                        pronounces.push(pronounce);
                     }
                  }
            }
            if (pronounces.length) entry.pronounces = pronounces;
         }
         if (element.webTop) {
            entry.top = senseToString(element.webTop)?.replaceAll(/[‘’]/g, "'");
         }
         if (element.senses) {
            const meanings: Array<string> = [];
            for (const sense of element.senses) {
               const meaning = senseToString(sense)?.replace(/[‘’]/g, "'");
               if (meaning) meanings.push(meaning);
            }
            if (meanings.length) entry.meanings = meanings.join("\n");
         }
         mic.entries?.push(entry);
      }
   }
   // Collins Dict
   if (!mic.entries?.length && dict.collins?.collins_entries?.length) {
      const collinsTran = new RegExp(`<b>${word}`, "i");
      for (const collinsEntry of dict.collins.collins_entries) {
         const meaningMap = new Map<string, string[]>();
         if (collinsEntry.entries?.entry?.length)
            for (const entry of collinsEntry.entries.entry) {
               if (entry.tran_entry?.length)
                  for (const tranEntry of entry.tran_entry) {
                     const pos = tranEntry.pos_entry?.pos;
                     if (pos?.toLowerCase().includes("phrase")) continue;
                     if (!tranEntry.tran) continue;
                     if (!tranEntry.tran?.match(collinsTran)) continue;
                     const meanings = meaningMap.get(pos);
                     const item = tranEntry.tran;
                     if (meanings) meanings.push(item);
                     else meaningMap.set(pos, [item]);
                  }
            }
         if (meaningMap.size) {
            for (const [pos, meanings] of meaningMap.entries()) {
               const entry: IEntry = { pos, meanings: meanings.join("\n") };
               if (collinsEntry.phonetic)
                  entry.pronounces = [{ phonetic: collinsEntry.phonetic }];
               mic.entries?.push(entry);
            }
         }
      }
   }
   // Individual Dict
   if (!mic.entries?.length && dict.individual?.trs?.length) {
      for (const x of dict.individual.trs) {
         if (x.tran && x.pos)
            mic.entries?.push({ pos: x.pos, meanings: x.tran });
      }
   }
   // Collins Primary Dict
   if (!mic.entries?.length && dict.collins_primary) {
      const cp = dict.collins_primary;
      if (cp.words?.word === word && cp.gramcat?.length) {
         for (const gram of dict.collins_primary.gramcat) {
            const entry: IEntry = {
               pos: gram.partofspeech,
               pronounces: [
                  { sound: gram.audiourl, phonetic: gram.pronunciation },
               ],
            };
            const meanings: Array<string> = [];
            for (const sense of gram.senses)
               meanings.push(
                  `${sense.definition} <strong>${sense.word}</strong>`,
               );
            if (meanings.length) entry.meanings = meanings.join("\n");
            mic.entries?.push(entry);
         }
      }
   }
   dict.mic = mic;
   dict.modified = true;
   return dict;
};

export default fill;
