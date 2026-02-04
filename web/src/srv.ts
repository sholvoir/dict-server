import { getJson, jsonHeader, url } from "@sholvoir/generic/http";
import type { IDict } from "../../server/src/lib/idict.ts";

export const API_URL = "/api/v2";

export const getEcdict = async () => fetch(`${API_URL}/ecdict`);

export const getIssues = () =>
   getJson<Array<{ _id: string; issue: string }>>(`${API_URL}/issues`);

export const deleteIssue = async (id: string) =>
   fetch(url(`${API_URL}/issue`, { id }), {
      method: "DELETE",
   });

export const getDict = (word: string) =>
   getJson<IDict>(url(`${API_URL}/dict`, { q: word }));

export const putDict = (dict: IDict) =>
   fetch(`${API_URL}/dict`, {
      method: "PUT",
      headers: jsonHeader,
      body: JSON.stringify(dict),
   });

export const deleteDict = (word: string) =>
   fetch(url(`${API_URL}/dict`, { q: word }), {
      method: "DELETE",
   });

export const getVocabulary = getJson<{
   words: string[];
   checksum: string;
}>(`${API_URL}/vocabulary`);

export const postVocabulary = (words: string) =>
   fetch(`${API_URL}/vocabulary`, {
      method: "POST",
      body: words,
   });

export const deleteVocabulary = (words: string) =>
   fetch(`${API_URL}/vocabulary`, {
      method: "DELETE",
      body: words,
   });
