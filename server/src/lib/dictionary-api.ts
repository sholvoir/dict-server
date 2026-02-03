const baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";

const freeDictionaryApi = async (word: string): Promise<any> => {
   const res = await fetch(`${baseUrl}/${word}`);
   if (!res.ok) throw res;
   return await res.json();
};

export default freeDictionaryApi;

if (import.meta.main)
   for (const word of Deno.args) console.log(await freeDictionaryApi(word));
