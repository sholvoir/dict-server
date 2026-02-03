import type { IEntry } from "../../server/src/lib/idict";

export const API_URL = "http://localhost:8080";

export const getEcdictAsIssue = async (word: string) => {
   const res = await fetch(`${API_URL}/ecdict/${word}`);
   return res.json();
};

export const postVocabulary = async (word: string, entry: IEntry) => {
   const res = await fetch(`${API_URL}/vocabulary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, entry }),
   });
   return res.json();
};

export const getIssues = async () => {
   const res = await fetch(`${API_URL}/issues`);
   return res.json();
};

export const deleteIssue = async (id: string) => {
   const res = await fetch(`${API_URL}/issues/${id}`, {
      method: "DELETE",
   });
   return res.json();
};

export const getDefinition = async (word: string) => {
   const res = await fetch(`${API_URL}/definition/${word}`);
   return res.json();
};

export const putDefinition = async (word: string, entry: IEntry) => {
   const res = await fetch(`${API_URL}/definition/${word}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
   });
   return res.json();
};

export const deleteDefinition = async (word: string) => {
   const res = await fetch(`${API_URL}/definition/${word}`, {
      method: "DELETE",
   });
   return res.json();
};

export const getDict = async () => {
   const res = await fetch(`${API_URL}/dict`);
   return res.json();
};

export const putDict = async (word: string, entry: IEntry) => {
   const res = await fetch(`${API_URL}/dict/${word}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
   });
   return res.json();
};

export const deleteDict = async (word: string) => {
   const res = await fetch(`${API_URL}/dict/${word}`, {
      method: "DELETE",
   });
   return res.json();
};

export const getVocabulary = async () => {
   const res = await fetch(`${API_URL}/vocabulary`);
   return res.json();
};

export const deleteVocabulary = async (word: string) => {
   const res = await fetch(`${API_URL}/vocabulary/${word}`, {
      method: "DELETE",
   });
   return res.json();
};
