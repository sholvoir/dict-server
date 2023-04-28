import { DataSource, findOne, deleteOne, insertOne, updateOne } from 'sholvoir/mongo.ts';

const dataSource: DataSource = {
    "dataSource": "Cluster0",
    "database": "dict",
    "collection": "dict"
}

export interface Dict {
    _id?: string
    word?: string;
    trans?: string;
    sound?: string;
    phonetics?: string;
}

export async function get(word: string) {
    return (await findOne(dataSource, { word })) as Dict;
}
export async function remove(word: string) {
    return await deleteOne(dataSource, { word });
}
export async function add(dict: Dict) {
    return await insertOne(dataSource, dict as Record<string, unknown>);
}
export async function patch(word: string, value: Dict) {
    if (value.word) delete value.word;
    if (value._id) delete value._id;
    return await updateOne(dataSource, { word }, value as Record<string, unknown>);
}
