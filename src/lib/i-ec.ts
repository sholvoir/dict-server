export interface ILi {
   l: { i: string };
}
export interface ITr {
   tr: Array<{ l: { i: Array<string> } }>;
}
export interface IWf {
   wf: {
      name: string;
      value: string;
   };
}
export interface IWord {
   ukphone: string;
   ukspeech: string;
   usphone: string;
   usspeech: string;
   "return-phrase": ILi;
   trs: Array<ITr>;
   wfs: Array<IWf>;
}
export interface IEC {
   exam_type: Array<string>;
   source: {
      name: string;
      url: string;
   };
   word: Array<any>;
}
