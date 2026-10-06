export interface IBasicEntry {
   cet: string;
   headword: string;
   wordforms: {
      wordform: Array<{ word: string }>;
   };
}
export interface IPosEntry {
   pos: string;
   pos_tips: string;
}
export interface IExamSent {
   eng_sent: string;
   chn_sent: string;
}
export interface ITransEntry {
   pos_entry: IPosEntry;
   exam_sents: {
      sent: Array<IExamSent>;
   };
   tran: string;
}
export interface IEntry {
   tran_entry: Array<ITransEntry>;
}
export interface ICollinsEntry {
   headword: string;
   star: string;
   phonetic: string;
   basic_entries: {
      basic_entry: Array<IBasicEntry>;
   };
   entries: {
      entry: Array<IEntry>;
   };
}
export interface ICollins {
   collins_entries: Array<ICollinsEntry>;
}
