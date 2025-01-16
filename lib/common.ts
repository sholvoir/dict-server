// deno-lint-ignore-file no-explicit-any
import { IDict } from "./idict.ts";

export const vocabularyUrl = (version: string) => `https://www.micit.co/vocabulary/vocabulary-${version}.txt`;
export interface IDictP extends IDict { modified?: any }