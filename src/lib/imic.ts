export interface IPronounce {
   phonetic?: string;
   sound?: string;
}
export interface IEntry {
   pos?: string;
   pronounces?: Array<IPronounce>;
   top?: string;
   meanings?: Array<string>;
}
export interface IDict {
   word: string;
   version?: number;
   entries?: Array<IEntry>;
}
