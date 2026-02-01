import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
   base: "",
   plugins: [devtools(), solidPlugin(), tailwindcss()],
   build: {
      target: "esnext",
      emptyOutDir: true,
   },
   server: {
      proxy: {
         "/api": {
            target: "http://localhost:8080",
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/api/, ""),
         },
      },
   },
});
