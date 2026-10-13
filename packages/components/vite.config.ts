import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte(), tailwindcss(), svelteTesting()],
  resolve: {
    conditions: [...defaultClientConditions],
  },
  ssr: {
    resolve: {
      conditions: [...defaultClientConditions],
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});