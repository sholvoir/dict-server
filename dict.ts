import { DB } from "https://deno.land/x/sqlite/mod.ts";

const createTableSQL = "CREATE TABLE IF NOT EXISTS dict (word TEXT PRIMARY KEY, value TEXT) WITHOUT ROWID;";
const selectSQL = "SELECT value FROM dict WHERE word = ?;";
const deleteSQL = 'DELETE FROM dict WHERE word = ?;'
const replaceSQL = "INSERT OR REPLACE INTO dict (word, value) VALUES (?, ?);";

interface DictItem {
    word?: string;
    trans?: string;
    soundGB?: string;
    soundUS?: string;
    phoneticsGB?: string;
    phoneticsUS?: string;
}

export class Dict {
    static _db: DB;

    static init() {
        Dict._db = new DB("dict._db");
        Dict._db.query(createTableSQL).return();
    }
    static close() { Dict._db.close(); }

    static get(word: string): DictItem | null {
        const rows = Array.from(Dict._db.query(selectSQL, [word]));
        return rows.length ? JSON.parse(rows[0][0]) : null;
    }
    static remove(word: string) {
        Dict._db.query(deleteSQL, [word]).return();
    }
    static set(word: string, value: DictItem) {
        Dict._db.query(replaceSQL, [word, JSON.stringify(value)]).return();
    }
    static patch(word: string, value: DictItem) {
        const rows = Array.from(Dict._db.query(selectSQL, [word]));
        const ovalue = rows.length ? JSON.parse(rows[0][0]) : undefined;
        const nvalue: DictItem = { ...ovalue, ...value };
        Dict.set(word, nvalue);
        return nvalue;
    }
}

