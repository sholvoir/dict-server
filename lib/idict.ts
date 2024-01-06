import { Tag } from "vocabulary/tag.ts";

export interface IDict {
    trans?: string;
    sound?: string;
    phonetic?: string;
    tags?: Tag[];
}