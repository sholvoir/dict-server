export interface IEntry {
   sound?: string;
   phonetic?: string;
   meanings?: Record<string, Array<string>>;
}
export interface IDict {
   word: string;
   version?: number;
   entries?: Array<IEntry>;
}
