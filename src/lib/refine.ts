const replace: Record<string, string> = {
   "，": ",",
   "、": ",",
   "；": ";",
   "（": "(",
   "）": ")",
   "<": "(",
   ">": ")",
   " ": "",
};
export const refine = (o?: string) =>
   o?.replaceAll(/([，、；（）<>]|(?<!\w) (?!\w))/g, (m) => replace[m]);

export default refine;
