// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  build: { format: "file" },

  server: {
    port: 22827,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte()],
});