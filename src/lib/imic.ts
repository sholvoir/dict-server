export const Poses = [
   "noun",
   "pron",
   "verb",
   "adj",
   "adv",
   "prep",
   "conj",
   "inter",
   "deter",
   "ecdict",
] as const;
export type TPos = (typeof Poses)[number];
export interface IEntry {
   pos?: string;
   sound?: string;
   phonetic?: string;
   meanings?: string;
}
export interface IDict {
   word: string;
   version?: number;
   entries?: Array<IEntry>;
}
