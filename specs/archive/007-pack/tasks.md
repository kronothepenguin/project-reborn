# Tasks: 007 — Pack

**Gate**: `pnpm --filter @project-reborn/director test` (288 green). All-or-nothing for commit.

- [x] T001 — Co-plan definition contract with 008 (C8): Movie/Cast/Member/ScoreDefinition shapes shared by builders, generators, ingester. *(done in 008 Phase D)*
- [x] T002 — Builders (`pack/movie.js`, `pack/cast.js`) conform to C8 (options+score, bitmap `data` payload). *(done in 008 Phase D)*
- [x] T003 — `scripts/generate-pack.mjs` cast + movie emit C8-shaped `index.js`; PNG inline base64; internal cast inline; sibling imports; empty-slot fill. *(done in 008 Phase D)*
- [x] T004 — Generate `fuse_client/index.js` (89 members) + `habbo/index.js` (73 slots: Internal 4 + fuse_client import + 70 empty). *(done in 008 Phase D)*
- [x] T005 — builder-shape + ingest-habbo tests green. *(done in 008 Phase D)*
- [x] T006 — spec.md + plan.md for 007 (this spec, per speckit). *(done now)*
- [x] T007 — Upgrade `director-cast-to-javascript` skill from placeholder to the real generator wrapper. *(below)*
- [x] T008 — Regenerate both packs, verify no drift, full gate green, present review before commit. *(verified: idempotent, 288 green)*

<!-- Phase boundary: docs + skill land with the next commit (007 spec docs + skill upgrade + roadmap status 007 row). -->