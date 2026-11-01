export interface IPronounce {
   phonetic?: string;
   sound?: string;
}
export interface IEntry {
   hword?: string;
   partsOfSpeech?: string;
   prons?: Array<IPronounce>;
}
export interface IWebsterWeb {
   word: string;
   version?: number;
   entries?: Array<IEntry>;
}
