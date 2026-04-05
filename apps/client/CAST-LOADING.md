# CAST-LOADING.md - Dynamic Cast Loading System

## Overview

This document describes how the original Director MX 2004 dynamic cast loading system is translated to JavaScript with Vite.

## Original Director Behavior

### Boot Sequence
1. `habbo/Internal_1_Initialization.ls` → `prepareMovie()` preloads `fuse_client.cct` (castLib 2)
2. `habbo/Internal_2_Init.ls` → `exitFrame()` waits for `netDone()`, then calls `initCore()`
3. `fuse_client/74_Core Thread Class.ls` → `updateState()` orchestrates the full load sequence

### Cast Loading Flow (`Core Thread Class`)
```
load_variables → load_params → load_texts → load_casts → validate_resources → init_threads
```

1. **load_variables**: Downloads `external_variables.txt` → parses key-value pairs into variable manager
2. **load_params**: Dumps variables, sets tempo, initializes encoding, configures debug
3. **load_texts**: Downloads external texts file (localized strings)
4. **load_casts**: Reads `cast.entry.#` from variables → builds list → `startCastLoad(["hh_entry_uk.cct", "hh_entry_base.cct", ...])`
5. **validate_resources**: Checks which casts actually loaded, re-downloads missing ones
6. **init_threads**: Initializes all thread managers, executes `#Initialize` message

### `startCastLoad()` (CastLoad Manager Class)
- Accepts list of cast names
- Appends `.cct` extension (or `.cst` in Author mode)
- Downloads each cast from `getMoviePath() + castName + ".cct"`
- Mounts into available castLib slots
- Indexes members for fast lookup
- Reports progress via callbacks

### Furni Dynamic Downloads
- Template: `dynamic.download.url + "hh_furni_xx_" + typeid + ".cct"`
- Sound template: `dynamic.download.url + "sounds/" + typeid + ".cct"`
- Downloaded on-demand when furniture is encountered
- Contains assets (bitmaps, sounds) without code

## JavaScript Translation

### Implemented Casts (Static Bundles)

Casts with translated LingoScript code are bundled as ES modules:

```js
// Build-time registry from external_variables.txt
const castRegistry = {
  'hh_entry_uk': () => import('./hh_entry_uk/index.js'),
  'hh_entry_base': () => import('./hh_entry_base/index.js'),
  'hh_shared': () => import('./hh_shared/index.js'),
  // ... all cast.entry.# entries
}
```

Vite configuration uses `import.meta.glob` to auto-discover cast entry points:

```js
const castModules = import.meta.glob('./**/index.js', { eager: false })
```

Each cast is output as a separate chunk in the build:
```
dist/
├── fuse-client.main.js    # Main bundle (habbo + fuse_client)
├── casts/
│   ├── hh_entry_init.js
│   ├── hh_human.js
│   └── ...
└── chunks/
    └── [hash].js          # Shared chunks
```

### Furni Casts (Dynamic Binary Loading)

Furniture `.cct` files are loaded at runtime from the game server:

```js
async function loadFurniCast(typeId) {
  const url = `${dynamicDownloadUrl}hh_furni_xx_${typeId}.cct`
  const response = await fetch(url)
  const blob = await response.blob()
  // Future: WASM extraction from blob
  // const assets = await extractCctAssets(blob)
  return blob
}
```

### WASM Integration (Future)

The `.cct` binary format will be parsed using a WASM module (projector-rays or director-rs):

```js
// Future implementation
import initCctParser, { extractAssets } from './cct-parser.wasm'

await initCctParser()

async function loadFurniCast(typeId) {
  const url = `${dynamicDownloadUrl}hh_furni_xx_${typeId}.cct`
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const assets = extractAssets(buffer)
  // Register assets in the sprite/visualizer system
  return assets
}
```

### Asset Resolution

Assets from translated casts use Vite imports:

```js
// Relative import from original casts directory
import logoPng from '../../../../casts/fuse_client/1_Logo.png'

// Or copied to local folder with Members.csv name
import systemProps from './System Props.txt'
```

### External Variables in Dev Mode

Development params are loaded from `.env.development`:

```env
VITE_SERVER_HOST=localhost
VITE_SERVER_PORT=3000
VITE_EXTERNAL_VARIABLES_TXT=./external_variables.txt
VITE_PROCESS_LOG_URL=
VITE_ACCOUNT_ID=
VITE_DEBUG_MODE=true
```

These are injected at build time via Vite's `define` config and available as `import.meta.env.VITE_*`.

### Mount API

The build exports a `mount` function that replaces Director's movie initialization:

```js
import { mount } from './client'

mount(document.getElementById('game'), {
  serverHost: 'localhost',
  serverPort: 3000,
  width: 800,
  height: 600,
  debug: true,
  // Additional external params that would come from sw1-sw9 in Director
})
```

## Cast Loading Order

From `client/external/external_variables.txt`, the `cast.entry.#` entries determine load order:

```
1: hh_entry_uk
2: hh_entry_base
3: hh_shared
4: hh_interface
5: hh_patch_uk
6: hh_human
7: hh_human_body
8: hh_human_face
9: hh_human_item
10: hh_human_hats
11: hh_human_hair
12: hh_human_shirt
13: hh_human_leg
14: hh_human_shoe
15: hh_kiosk_room
16: hh_pets_common
17: hh_room_utils
18: hh_room_ui
19: hh_furni_classes
20: hh_room
21: hh_club
22: hh_photo
23: hh_navigator
24: hh_cat_code
25: hh_cat_gfx_all
26: hh_buffer
27: hh_dynamic_downloader
28: hh_recycler
29: hh_poll
30: hh_tutorial
31: hh_entry_init
32: hh_human_acc_eye
33: hh_human_acc_face
34: hh_human_acc_head
35: hh_human_50_face
36: hh_human_50_hats
37: hh_human_50_hair
38: hh_human_50_acc_eye
39: hh_human_50_acc_face
40: hh_human_50_acc_head
41: hh_human_50_body
42: hh_friend_list
43: hh_instant_messenger
44: hh_ig
45: hh_ig_interface
46: hh_pets
47: hh_guide
```

Room-specific casts (`room.cast.#`) are loaded separately when entering rooms:
```
1: hh_soundmachine
2: hh_human_acc_chest
3: hh_human_acc_waist
4: hh_human_50_shirt
5: hh_human_50_leg
6: hh_human_50_shoe
7: hh_human_50_item
8: hh_human_50_acc_chest
9: hh_human_50_acc_waist
10: hh_roomdimmer
11: hh_badges
```
