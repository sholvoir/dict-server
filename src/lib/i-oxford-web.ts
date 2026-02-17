export interface IPronounce {
   sound?: string | null;
   phon?: string;
}
export interface IPhonetic {
   geo?: string | null;
   prs?: Array<IPronounce>;
}
export interface IInflection {
   label?: string;
   inflected: Array<string>;
}
export interface IShcut {
   type: "shcut";
   value: string;
}
export interface IPos {
   type: "pos";
   value: string;
}
export interface IGrammar {
   type: "grammar";
   value: string;
}
export interface ISep {
   type: "sep";
   value: string;
}
export interface ICf {
   type: "cf";
   value: string;
}
export interface IInflections {
   type: "inflections";
   value: Array<IInflection>;
}
export interface ILabels {
   type: "labels";
   value: Array<string>;
}
export interface IDisg {
   type: "disg";
   value: string;
}
export interface IUse {
   type: "use";
   value: string;
}
export interface IDef {
   type: "def";
   value: string;
}
export interface IV {
   type: "v";
   value: string;
}
export interface ISpec {
   type: "spec";
   value: string;
}
export interface IVariant {
   type: "variants";
   value: Array<ISpec | ILabels | IGrammar | IV>;
}
export type ISenseItem =
   | IShcut
   | IPos
   | IVariant
   | IGrammar
   | ISep
   | ICf
   | IInflections
   | ILabels
   | IDisg
   | IUse
   | IDef;
export type ISense = Array<ISenseItem>;
export interface IOxfordWebEntry {
   headWord?: string;
   pos?: string;
   phonetics?: Array<IPhonetic>;
   webTop?: ISense;
   senses?: Array<ISense>;
}
export interface IOxfordWeb {
   version: number;
   entries: Array<IOxfordWebEntry>;
}
