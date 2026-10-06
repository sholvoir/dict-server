export interface IEntry {
   pos?: string;
   sound?: string;
   phonetic?: string;
   meanings?: Array<string>;
}
export interface IDict {
   word: string;
   version?: number;
   entries?: Array<IEntry>;
}
