---
name: director-cast-to-javascript
description: Generate the index.js (definition) for a decompiled Director cast or movie from its Members.csv / Casts.csv. Use when generating per-cast index.js registrations or movie packs for apps/client/src/game/*.
---

# Generate a Director pack (cast or movie) → `index.js`

Uses the generator at `packages/director/scripts/generate-pack.mjs`.

## Invocations

```bash
node packages/director/scripts/generate-pack.mjs cast apps/client/src/game/fuse_client
node packages/director/scripts/generate-pack.mjs movie apps/client/src/game/habbo
```

Run from repo root. Cast emits `<dir>/index.js` from `Members.csv`
(`<cast>_Members.csv` alt). Movie emits `<dir>/index.js` from `Casts.csv`;
`../<name>/index.js` imports sibling packs, movie-dir members inline, others empty;
`totalCastSlots` = max `Number`.

## Verify

```bash
pnpm --filter @project-reborn/director test
```

## Never

- Hand-edit generated `index.js` (regenerate instead).
- Binary `.cst/.dcr/.dir` parsing, or Lingo translation (sibling `.js` is input).