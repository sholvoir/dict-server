export interface IWord {
   ukphone: string;
   ukspeech: string;
   usphone: string;
   usspeech: string;
   "return-phrase": string;
   collegeExamVoice: {
      speechWord: string;
   };
}
export interface ISimple {
   query: string;
   word: Array<IWord>;
}
