export interface ISenseBase {
   lang: string;
   word: string;
}
export interface IExample {
   example: string;
   sense: ISenseBase;
}
export interface ISense extends ISenseBase {
   sensenumber: string;
   definition: string;
   examples: Array<IExample>;
}
export interface IGramCat {
   audiourl: string;
   pronunciation: string;
   senses: Array<ISense>;
   partofspeech: string;
   audio: string;
   forms: Array<{ form: string }>;
}
export interface IWords {
   word: string;
   indexforms: Array<string>;
}
export interface ICollinsPrimary {
   words: IWords;
   gramcat: Array<IGramCat>;
}
