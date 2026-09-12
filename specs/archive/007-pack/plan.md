# Implementation Plan: 007 — Pack

**Branch**: `007-pack` | **Date**: 2026-09-09 | **Spec**: [/specs/007-pack/spec.md](./spec.md)

> Note: 007 and 008 were **co-planned**; the definition contract (C8), the
> generators (R10), builder alignment, and the habbo/fuse_client packs were
> implemented inside 008's Phase D and committed with 008 (`b5bf80cb`). This
> plan records the decisions + the remaining 007-only deliverable: the
> **skill** (T002) + spec docs (T003) + gate verification (T004).

## Summary

The pack layer: a pure-data **definition contract** (C8) shared by the builders
(`pack/movie.js`, `pack/cast.js`), a CSV→`index.js` **generator**
(`scripts/generate-pack.mjs`), and the generated **virtual files** for habbo +
fuse_client. This structure closes the loop: builders emit the contract, the
generator emits the contract, and the 008 ingester consumes it — no drift.

## Technical Context

- **Language**: Node ≥20 ESM, zero deps; the generator mirrors the builder shape
  by hand (data-only, no shared runtime import — generated files must be portable).
- **Inputs**: `Members.csv` (`Number,Type,Name,"Registration Point",Filename`),
  `Casts.csv` (`Number,Name,Filename`), sibling `.js`/`.ls`/`.png` files.
- **Outputs**: `apps/client/src/game/<dir>/index.js` (cast or movie definition).
- **Gate**: `pnpm --filter @project-reborn/director test` (288 green at 008 commit).

## R decisions (research/design)

- R10 (from 008 plan): `generate-pack.mjs` reads the CSVs and emits C8-shaped
  `index.js`; PNG → inline base64 data URI; movie casts wired to sibling imports;
  internal cast (Inter_Members.csv) inline; empty slots filled.
- R11 (007-only): generated files are committed; header comment marks them generated.
- R12: the `director-cast-to-javascript` skill is upgraded from placeholder to a
  real how-to that wraps `generate-pack.mjs` (cast + movie invocations).

## Phases

### Phase 1 — Docs + skill (T001–T003)
spec.md (done above), plan.md, skill upgrade, generator already committed (008).

### Phase 2 — Verify + commit (T004)
Regenerate both packs, verify diff is stable, run full gate, present review.

**Verification**: generator idempotent (regenerate → no diff beyond header),
ingest-habbo + builder-shape tests green, full gate green.

**Out of scope**: 61 remaining cast folders, score data derivation (004/007-later), binary formats.