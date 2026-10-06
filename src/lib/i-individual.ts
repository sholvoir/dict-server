export interface ITr {
   pos: string;
   tran: string;
}
export interface IColloc {
   en: string;
   zh: string;
}
export interface IQuestionTypeInfo {
   time: number;
   type: string;
}
export interface IExamInfo {
   year: number;
   recommendationRate: number;
   frequency: number;
   questionTypeInfo: Array<IQuestionTypeInfo>;
}
export interface IExamSent {
   source: string;
   en: string;
   zh: string;
}
export interface IIndividual {
   trs: Array<ITr>;
   idiomatic: Array<{ colloc: IColloc }>;
   level: string;
   examInfo: IExamInfo;
   "return-phrase": string;
   pastExamSents: Array<IExamSent>;
}
