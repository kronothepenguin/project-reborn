import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { resolve, basename } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

const root = import.meta.dirname;
const srcDir = resolve(root, 'src');
const castsDir = resolve(srcDir, 'casts');

// ── Discover cast entry points ─────────────────────────────────────────

function discoverCastEntries() {
  const entries = {};

  if (!existsSync(castsDir)) return entries;

  for (const castName of readdirSync(castsDir)) {
    if (!castName.startsWith('hh_')) continue;
    const castPath = resolve(castsDir, castName);
    const indexPath = resolve(castPath, 'index.js');

    if (existsSync(indexPath)) {
      entries[`casts/${castName}`] = indexPath;
    } else {
      // Find first .js file in the cast directory
      const jsFiles = readdirSync(castPath).filter(f => f.endsWith('.js'));
      if (jsFiles.length > 0) {
        entries[`casts/${castName}`] = resolve(castPath, jsFiles[0]);
      }
    }
  }

  return entries;
}

const castEntries = discoverCastEntries();

export default defineConfig(({ command }) => ({
  root: resolve(root, 'public'),
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
    lib: command === 'build' ? undefined : undefined,

    rollupOptions: {
      input: {
        // Main entry: habbo + fuse_client
        main: resolve(srcDir, 'index.js'),
        // Individual cast bundles
        ...castEntries,
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'main') {
            return 'fuse-client.main.js';
          }
          return `casts/${chunkInfo.name}.js`;
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',
      },
      external: [],
    },
  },

  plugins: [
    splitVendorChunkPlugin(),
  ],

  define: {
    // Expose env vars to the client
    'import.meta.env.PROCESS_LOG_URL': JSON.stringify(process.env.VITE_PROCESS_LOG_URL || ''),
    'import.meta.env.ACCOUNT_ID': JSON.stringify(process.env.VITE_ACCOUNT_ID || ''),
    'import.meta.env.CLIENT_URL': JSON.stringify(process.env.VITE_CLIENT_URL || ''),
    'import.meta.env.SERVER_HOST': JSON.stringify(process.env.VITE_SERVER_HOST || 'localhost'),
    'import.meta.env.SERVER_PORT': JSON.stringify(process.env.VITE_SERVER_PORT || '30001'),
    'import.meta.env.DEBUG_MODE': JSON.stringify(process.env.VITE_DEBUG_MODE === 'true'),
  },

  server: {
    port: 3000,
    open: false,
  },
}));
