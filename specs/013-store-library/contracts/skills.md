# Contract: Skills

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

Two agent skills are deliverables of this feature. Both live under `.agents/skills/<name>/SKILL.md` and follow the repository's skill conventions (YAML frontmatter with `name` and a third-person `description` stating what the skill does and when to use it).

## Skill: `documenting-with-okf`

**Purpose**: Author and validate OKF knowledge concepts for the store.

**Required content**:

1. `description` naming OKF and the trigger (writing or updating concept documents / knowledge bundles).
2. A short explanation of OKF: markdown + YAML frontmatter, one concept per file, bundle = directory.
3. The project bundle layout and concept types (see `knowledge-bundle.md`).
4. Frontmatter rules: required `type`; recommended `title`, `description`, `resource`, `tags`, `timestamp`; source path format.
5. Body rules: `# Schema`, `# Operations`, `# Examples`, `# Citations`; structural markdown; bundle-relative links.
6. `index.md`/`log.md` rules, newest-first dated log entries.
7. A copy-paste conformance checklist.
8. Links to all three authoritative references in `knowledge-bundle.md`.

**Verification**: running the checklist against `packages/store/knowledge/` reports no violations.

## Skill: `adding-data-persistence`

**Purpose**: Take a feature from "needs to persist data" to working typed operations in the store.

**Required content** (workflow order):

1. `description` naming persistence and the trigger (an app or feature needs new persisted data).
2. Choose the feature filename family (`<feature>.schema.sql`, `<feature>.query.sql`).
3. Add the schema file under `packages/store/schema/` following `sql-conventions.md` (additive, idempotent, naming, value conventions).
4. Add named operations under `packages/store/queries/`.
5. Document both files with the `documenting-with-okf` skill; update the bundle index.
6. Run `go tool sqlc generate` (or `make generate`) from `packages/store`; commit the generated file.
7. Consume the generated operations from `store.Open(...)`; use transactions for multi-step writes and the error helpers for classification.
8. Verify: `go vet ./...`, `go test ./...`, and a clean `git diff --exit-code` after regeneration.
9. A copy-paste contribution checklist combining steps 2–8.

**Verification**: a contributor who follows only this skill can add a table and query that compile, run, and are documented and indexed.

## Boundaries

- Neither skill adds runtime behavior; they document and choreograph existing contracts.
- The persistence skill references the OKF skill instead of duplicating documentation rules.
- Neither skill introduces a migration mechanism; incompatible structural changes remain out of scope.
