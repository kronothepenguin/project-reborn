import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  build: {
    lib: {
      entry: "src/main.js",
    },
  },

  define: {
    "import.meta.env.VITE_SERVER_HOST": JSON.stringify(
      process.env.VITE_SERVER_HOST || "localhost",
    ),
    "import.meta.env.VITE_SERVER_PORT": JSON.stringify(
      process.env.VITE_SERVER_PORT || "3000",
    ),
    "import.meta.env.VITE_DEBUG_MODE": JSON.stringify(
      process.env.VITE_DEBUG_MODE === "true",
    ),
    "import.meta.env.VITE_PROCESS_LOG_URL": JSON.stringify(
      process.env.VITE_PROCESS_LOG_URL || "",
    ),
    "import.meta.env.VITE_ACCOUNT_ID": JSON.stringify(
      process.env.VITE_ACCOUNT_ID || "",
    ),
    "import.meta.env.VITE_CLIENT_URL": JSON.stringify(
      process.env.VITE_CLIENT_URL || "",
    ),
    "import.meta.env.VITE_EXTERNAL_VARIABLES_TXT": JSON.stringify(
      process.env.VITE_EXTERNAL_VARIABLES_TXT || "",
    ),
  },

  server: {
    open: false,
  },
}));
