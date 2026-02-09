export interface IPronounce {
   sound?: string | null;
   phon?: string;
}
export interface IPhonetic {
   geo?: string | null;
   prs?: Array<IPronounce>;
}
export type IVariant = Array<{
   spec?: string;
   labels?: string[];
   v?: string;
   grammar?: string;
}>;
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
   variants?: Array<IVariant>;
   grammar?: string;
   labels?: Array<string>;
   use?: string;
   def?: string;
}
export interface ISenseTop {
   variants?: Array<IVariant>;
   grammar?: string;
   cf?: Array<string>;
   inflections?: Array<IInflection>;
   labels?: Array<string>;
   disg?: string;
   use?: string;
   def?: string;
   xrefs?: Array<IXref>;
}
export interface ISense {
   shcut?: string;
   senseTop?: ISenseTop;
   variants?: Array<IVariant>;
   grammar?: string;
   cf?: Array<string>;
   inflections?: Array<IInflection>;
   labels?: Array<string>;
   disg?: string;
   use?: string;
   def?: string;
   xrefs?: Array<IXref>;
}
export interface IOxfordWebEntry {
   headWord?: string;
   pos?: string;
   phonetics?: Array<IPhonetic>;
   webTop?: IWebTop;
   senses?: Array<ISense>;
}

export interface IOxfordWeb {
   version: number;
   entries: Array<IOxfordWebEntry>;
}
