import { defineConfig } from 'vite';
import { resolve, basename } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

const root = import.meta.dirname;
const srcDir = resolve(root, 'src');

// ── Discover cast entry points ─────────────────────────────────────────
// Finds all cast directories in src/ (habbo, fuse_client, hh_*)
// Each cast must have an index.js that re-exports everything

function discoverCastEntries() {
  const entries = {};

  if (!existsSync(srcDir)) return entries;

  for (const name of readdirSync(srcDir)) {
    // Skip core/ directory and non-directories
    if (name === 'core' || name === 'main.js') continue;

    const entryPath = resolve(srcDir, name, 'index.js');
    if (existsSync(entryPath)) {
      entries[name] = entryPath;
    }
  }

  return entries;
}

const castEntries = discoverCastEntries();

export default defineConfig(({ command }) => ({
  root: root,
  base: './',

  resolve: {
    alias: {
      '@': srcDir,
    },
  },

  build: {
    outDir: resolve(root, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    lib: command === 'build' ? {
      entry: resolve(srcDir, 'main.js'),
      formats: ['es'],
      fileName: () => 'client.js',
    } : undefined,

    rollupOptions: {
      input: {
        // Main entry: mount() function
        main: resolve(srcDir, 'main.js'),
        // Individual cast bundles (loaded dynamically)
        ...castEntries,
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'main') {
            return 'client.js';
          }
          return `casts/${chunkInfo.name}.js`;
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',
      },
    },
  },

  plugins: [],

  define: {
    'import.meta.env.VITE_SERVER_HOST': JSON.stringify(process.env.VITE_SERVER_HOST || 'localhost'),
    'import.meta.env.VITE_SERVER_PORT': JSON.stringify(process.env.VITE_SERVER_PORT || '3000'),
    'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(process.env.VITE_DEBUG_MODE === 'true'),
    'import.meta.env.VITE_PROCESS_LOG_URL': JSON.stringify(process.env.VITE_PROCESS_LOG_URL || ''),
    'import.meta.env.VITE_ACCOUNT_ID': JSON.stringify(process.env.VITE_ACCOUNT_ID || ''),
    'import.meta.env.VITE_CLIENT_URL': JSON.stringify(process.env.VITE_CLIENT_URL || ''),
    'import.meta.env.VITE_EXTERNAL_VARIABLES_TXT': JSON.stringify(process.env.VITE_EXTERNAL_VARIABLES_TXT || ''),
  },

  server: {
    port: 3000,
    open: false,
  },
}));
