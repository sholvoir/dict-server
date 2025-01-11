// deno-lint-ignore-file no-explicit-any
import { IDict } from "./idict.ts";

export const VOCABULARY_URL = 'https://www.micit.co/vocabulary/vocabulary-0.1.8.txt';
export interface IDictP extends IDict { modified?: any }