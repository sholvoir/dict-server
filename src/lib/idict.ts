import type { ICollins } from "./i-collins.ts";
import type { ICollinsPrimary } from "./i-collins-primary.ts";
import type { IEC } from "./i-ec.ts";
import type { IFDAEntry } from "./i-free-dictionary-api.ts";
import type { IOxfordWeb } from "./i-oxford-web.ts";
import type { ISimple } from "./i-simple.ts";
import type { IWebsterWeb } from "./i-webster-web.ts";
import type { IDict } from "./imic.ts";

export interface IDictionary {
   input: string;
   simple?: ISimple;
   collins?: ICollins;
   ec?: IEC;
   collins_primary?: ICollinsPrimary;
   version?: number;
   modified?: boolean;
   free_dictionary_api?: Array<IFDAEntry>;
   webster_api?: Array<any>;
   webster_web?: IWebsterWeb;
   oxford_web?: IOxfordWeb;
   mic?: IDict;
   [key: string]: any;
}
