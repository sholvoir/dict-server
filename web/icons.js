import { readFile, writeFile } from "node:fs/promises";
import { locate } from "@iconify/json";
import { getIconsCSS } from "@iconify/utils";

/**
 * List of icons. Key is icon set prefix, value is array of icons
 *
 * @type {Record<string, string[]>}
 */
const icons = {
   "material-symbols": [
      // "check-circle",
      // "chevron-left",
      "chevron-right",
      // "delete-outline",
      // "dictionary",
      // "error",
      // "family-star",
      // "help-outline",
      // "refresh",
      // "settings",
      // "volume-up",
   ],
   mdi: ["chevron-down", "chevron-up" /*, "cross-circle"*/],
   // hugeicons: ["online-learning-01"],
   // tabler: ["info-octagon"],
   // "icon-park-outline": ["chinese"],
};

// Parse each icon set
let code = "";
for (const prefix in icons) {
   // Find location of .json file
   const filename = locate(prefix);

   // Load file and parse it
   /** @type {import("@iconify/types").IconifyJSON} */
   const iconSet = JSON.parse(await readFile(filename, "utf8"));

   // Get CSS
   const css = getIconsCSS(iconSet, icons[prefix]);

   // Add it to code
   code += css;
}

// Save CSS file
await writeFile("src/icons.css", code, "utf8");
console.log(`Saved CSS (${code.length} bytes)`);
