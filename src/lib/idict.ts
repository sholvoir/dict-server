import type { IOxfordWeb } from "./i-oxford-web.ts";
import type { IWebsterWeb } from "./i-webster-web.ts";
import type * as Mic from "./imic.ts";

export interface IDictionary {
   input: string;
   version?: string;
   modified?: boolean;
   mic?: Mic.IDict;
   free_dictionary_api?: Array<any>;
   webster_api?: Array<any>;
   webster_web?: IWebsterWeb;
   oxford_web?: IOxfordWeb;
   [key: string]: any;
}
