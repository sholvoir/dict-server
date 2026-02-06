import { getJson, jsonHeader, url } from "@sholvoir/generic/http";
import { API_BASE } from "../../server/src/lib/common.ts";
import type { IDict } from "../../server/src/lib/idict.ts";

export const getEcdict = async () => fetch(`${API_BASE}/ecdict`);

export const getIssues = () =>
   getJson<Array<{ _id: string; issue: string }>>(`${API_BASE}/issues`);

export const deleteIssue = async (id: string) =>
   fetch(url(`${API_BASE}/issue`, { id }), {
      method: "DELETE",
   });

export const getDict = (word: string) =>
   getJson<IDict>(url(`${API_BASE}/dict`, { q: word }));

export const putDict = (dict: IDict) =>
   fetch(`${API_BASE}/dict`, {
      method: "PUT",
      headers: jsonHeader,
      body: JSON.stringify(dict),
   });

export const deleteDict = (word: string) =>
   fetch(url(`${API_BASE}/dict`, { q: word }), {
      method: "DELETE",
   });

export const getVocabulary = () =>
   getJson<{
      words: string[];
      checksum: string;
   }>(`${API_BASE}/vocabulary`);

export const postVocabulary = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, {
      method: "POST",
      body: words,
   });

export const deleteVocabulary = (words: string) =>
   fetch(`${API_BASE}/vocabulary`, {
      method: "DELETE",
      body: words,
   });
