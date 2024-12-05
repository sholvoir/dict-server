// deno-lint-ignore-file no-explicit-any
import { IDict } from "./idict.ts";

export const VOCABULARY_URL = 'https://www.micit.co/vocabulary/vocabulary-0.0.31.txt';
export const NO_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
export interface IDictP extends IDict { modified?: any }