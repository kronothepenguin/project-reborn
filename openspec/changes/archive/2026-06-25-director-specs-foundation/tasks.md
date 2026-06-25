## 1. Author capability specs

- [x] 1.1 Write `specs/director-core/spec.md` — internal simulator layer responsibility, no `./core` export, data structures + Ref classes + media types, references to `docs/director-inventory.json` and `docs/drmx2004_scripting_ref.txt`
- [x] 1.2 Write `specs/director-lingo/spec.md` — single `./lingo` export, four requirement sections (Functions, Globals, Constants, Syntax), globals-as-core-coupling-point, references to `docs/director-inventory.json` methods array and MX 2004 chapters
- [x] 1.3 Write `specs/director-runtime/spec.md` — single `./runtime` export, custom elements, event loop, cast loader, script lifecycle, canvas, references to MX 2004 Chapter 10

## 2. Author planning artifacts

- [x] 2.1 Write `proposal.md` — why, what changes, capabilities (3 new, 0 modified), impact, non-goals
- [x] 2.2 Write `design.md` — 7 decisions with rationale and alternatives, risks/trade-offs

## 3. Validate

- [x] 3.1 Run `openspec validate director-specs-foundation --type change` — passes with no issues
- [x] 3.2 Run `openspec show director-specs-foundation` — confirm deltas parse as three ADDED capabilities

## 4. Archive and sync into main specs

- [ ] 4.1 Run `openspec archive director-specs-foundation -y` to sync the three capabilities into `openspec/specs/`
- [ ] 4.2 Run `openspec list --specs` — confirm `director-core`, `director-lingo`, `director-runtime` are listed
- [ ] 4.3 Run `openspec validate --specs` — confirm all three specs validate

## 5. Follow-up (not part of this change)

- [ ] 5.1 Delete `openspec/changes/archive/` in one commit once the new specs are confirmed in `openspec/specs/`
- [ ] 5.2 Reconcile `packages/director/package.json` exports (`./api`, `./runtime`, `./syntax`) with the spec contract (`./lingo`, `./runtime`, no `./core`) — separate change
- [ ] 5.3 Optional: extract `docs/drmx2004_scripting_ref.pdf`/`.txt` into per-function `docs/director-ref/<name>.md` via pdf2 utilities — separate tooling change
