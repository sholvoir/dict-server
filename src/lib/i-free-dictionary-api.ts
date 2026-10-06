export interface ILicense {
   name: string;
   url: string;
}
export interface IPhonetic {
   text: string;
   audio: string;
   sourceUrl?: string;
   license?: ILicense;
}
export interface IDefinition {
   definition: string;
   synonyms: Array<string>;
   antonyms: Array<string>;
   example?: string;
}
export interface IMeaning {
   partOfSpeech: string;
   definitions: Array<IDefinition>;
   synonyms: Array<string>;
   antonyms: Array<string>;
}
export interface IFDAEntry {
   word: string;
   phonetic: string;
   phonetics: Array<IPhonetic>;
   license: ILicense;
   sourceUrls: Array<string>;
}
