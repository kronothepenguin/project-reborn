import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/__tests__/**/*.test.js"],
    setupFiles: ["./src/__test-shims__/index.js"],
    globals: true,
  },
});
