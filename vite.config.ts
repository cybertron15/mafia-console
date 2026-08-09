import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // GitHub Pages project site: https://cybertron15.github.io/mafia-console/
  base: "/mafia-console/",
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
  plugins: [tailwindcss(), viteReact()],
});
