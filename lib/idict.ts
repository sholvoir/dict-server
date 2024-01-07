import { Tag } from "vocabulary/tag.ts";

export interface IDict {
    word: string;
    pic?: string;
    trans?: string;
    sound?: string;
    phonetic?: string;
    tags?: Tag[];
}