//@ts-ignore
import { defineConfig } from "vite";
//@ts-ignore
import react from "@vitejs/plugin-react";
//@ts-ignore
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5200,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 5200,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
