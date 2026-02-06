export interface IPronounce {
   sound?: string | null;
   phon?: string;
}
export interface IPhonetic {
   geo?: string | null;
   prs?: Array<IPronounce>;
}
export interface IVariant {
   spec?: string;
   labels?: string[];
   v?: string;
   grammar?: string;
}
export interface IXref {
   prefix?: string;
   ref?: string;
}
export interface IInflection {
   label?: string;
   inflected: Array<string>;
}
export interface IWebTop {
   inflections?: Array<IInflection>;
   variants?: Array<any>;
   grammar?: string;
   labels?: Array<any>;
   use?: string;
   def?: string;
}
export interface ISenseTop {
   variants?: Array<any>;
   grammar?: string;
   cf?: Array<any>;
   inflections?: Array<IInflection>;
   labels?: Array<any>;
   disg?: string;
   use?: string;
   def?: string;
   xrefs?: Array<IXref>;
}
export interface ISense {
   shcut?: string;
   senseTop?: ISenseTop;
   variants?: Array<any>;
   grammar?: string;
   cf?: Array<any>;
   inflections?: Array<IInflection>;
   labels?: Array<any>;
   disg?: string;
   use?: string;
   def?: string;
   xrefs?: Array<IXref>;
}
export interface IOxfordWebEntry {
   headWord?: string;
   pos?: string;
   phonetics?: Array<any>;
   webTop?: IWebTop;
   senses?: Array<ISense>;
}

export interface IOxfordWeb {
   version: number;
   entries: Array<IOxfordWebEntry>;
}
