import { IDataSource, Mongo } from 'sholvoir/mongo.ts';

const dataSource: IDataSource = {
    "dataSource": "Cluster0",
    "database": "dict",
    "collection": "dict"
}

const dict = new Mongo(Deno.env.get('MONGO_END_POINT')!, Deno.env.get('MONGO_API_KEY')!, dataSource);

export interface Dict {
    _id?: string
    word?: string;
    trans?: string;
    sound?: string;
    phonetics?: string;
}


export async function get(word: string) {
    return (await dict.findOne({ word })) as Dict;
}
export async function remove(word: string) {
    return await dict.deleteOne({ word });
}
export async function add(d: Dict) {
    return await dict.insertOne(d as Record<string, unknown>);
}
export async function patch(word: string, value: Dict) {
    if (value.word) delete value.word;
    if (value._id) delete value._id;
    return await dict.updateOne({ word }, value as Record<string, unknown>);
}
