import type { IDictionary } from "./idict.ts";

const baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";

const fill = async (dict: IDictionary) => {
   if (!dict.input) return dict;
   if (dict.free_dictionary_api) return dict;
   const res = await fetch(`${baseUrl}/${encodeURIComponent(dict.input)}`);
   if (!res.ok) return dict;
   dict.free_dictionary_api = await res.json();
   dict.modified = true;
   return dict;
};

export default fill;

if (import.meta.main)
   for (const word of Deno.args) console.log(await fill({ input: word }));
