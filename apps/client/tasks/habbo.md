# habbo Cast (DCR / Movie)

**Special case:** This is the main `.dcr` movie. It defines castLibs via `Casts.csv` and its own "Internal" cast members via `Internal_Members.csv`.

## LingoScript Translation (Internal cast only)

- [x] Internal_1_Initialization.ls → initialization.js
- [x] Internal_2_Init.ls → init.js
- [x] Internal_3_Loop.ls → loop.js

## Member Registration (Internal cast)

- [x] Register member #1 "Initialization" (script)
- [ ] Register member #2 "Init" (script)
- [ ] Register member #3 "Loop" (script)
- [x] Register member #4 "Logo" (bitmap)

## Cast Library Setup (from Casts.csv)

- [x] Register castLib #1 "Internal" (this cast)
- [ ] Register castLib #2 "fuse_client" → direct import from `apps/client/src/game/fuse_client/`
- [ ] Skip castLib #3-73 "bin" / "empty N" (placeholder slots)
