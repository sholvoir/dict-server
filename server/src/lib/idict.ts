export interface IMean {
    def?: string;
    trans?: string;
}
export interface IEntry {
    sound?: string;
    phonetic?: string;
    meanings?: Record<string, Array<IMean>>;
}
export interface IDict {
    _id?: string;
    word: string;
    version?: number;
    entries?: Array<IEntry>;
}