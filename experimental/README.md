# FuseClient JavaScript Translation

Translated Macromedia Director MX 2004 LingoScript → JavaScript with Canvas rendering.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env config and edit
cp .env.example .env

# Start dev server (Vite)
npm run dev

# Build for production
npm run build
```

## Dev Server

```bash
npm run dev        # → http://localhost:3000
```

Loads external params from `.env` file:

```env
VITE_PROCESS_LOG_URL=http://localhost:3001/processlog
VITE_ACCOUNT_ID=test_account_123
VITE_CLIENT_URL=http://localhost:3000
VITE_SERVER_HOST=localhost
VITE_SERVER_PORT=30001
VITE_DEBUG_MODE=true
```

## Build Output

```bash
npm run build
```

Produces:

```
dist/
├── fuse-client.main.js       # Main bundle (habbo + fuse_client)
│                             # Exports: mount(element, options)
├── casts/
│   ├── fuse-client.hh_room.js
│   ├── fuse-client.hh_human.js
│   ├── fuse-client.hh_furni_classes.js
│   └── ...                   # Each hh_* cast as independent bundle
├── chunks/                   # Shared code splits
└── assets/                   # Static assets
```

## Usage (after build)

```html
<canvas id="game" width="800" height="600"></canvas>
<script type="module">
  import { mount } from './dist/fuse-client.main.js';

  const client = await mount('#game', {
    processLogUrl: 'https://api.example.com/log',
    accountId: 'user-123',
    serverHost: 'game.example.com',
    serverPort: 30001,
    width: 800,
    height: 600,
    debug: true,
    customParams: { /* extra Lingo params */ },
  });

  // Later:
  client.unmount();
</script>
```

## Loading Cast Bundles

The main bundle dynamically loads cast bundles (replacing `.cct` loading):

```js
// Replace: castLib(5).fileName = "hh_room.cct"
// With:
const roomModule = await import('./dist/casts/fuse-client.hh_room.js');
```

Future: WASM module parses binary `.cct` files instead of JS bundles.

## Architecture

```
experimental/
├── src/
│   ├── core/               # Lingo runtime emulation
│   │   ├── lingo-runtime.js    # VOID, property lists, type helpers
│   │   ├── stage.js            # Canvas stage
│   │   └── frame-loop.js       # requestAnimationFrame loop
│   ├── casts/              # Translated cast modules
│   │   ├── habbo/          # habbo.dcr entry
│   │   ├── fuse_client/    # fuse_client.cct core
│   │   └── hh_*/           # Feature casts (one per directory)
│   ├── engine/             # Canvas rendering
│   │   ├── sprite-manager.js
│   │   └── visualizer.js
│   ├── system/             # System services
│   │   ├── network.js
│   │   └── system-props.js
│   └── index.js            # Main entry + mount() export
├── public/
│   └── index.html          # Dev shell
├── tasks/                  # Translation task docs (26 files)
├── vite.config.js          # Vite config (main + cast bundles)
├── .env                    # Dev external params
└── .env.example            # Env template
```

## Translation Notes

- Lingo `property` → JS class instance properties
- Lingo `global` → JS module-level variables or singletons
- Lingo `on handler me` → JS class methods
- Lingo `createObject(tID, tClassList)` → Object Manager with ancestor chaining
- Lingo `castLib(n)` → dynamic `import()` of cast bundles
- Lingo `go(the frame)` → `requestAnimationFrame` loop
- Lingo `the stage` → Canvas element
- Lingo `sprite(n)` → Sprite manager entries
