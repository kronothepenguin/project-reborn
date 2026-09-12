# Phase 0 Research: Central Store Library

**Feature**: `specs/013-store-library` | **Date**: 2026-09-12

All unknowns from the plan's Technical Context are resolved below. Tooling choices were user-directed (driver, sqlc, `.schema.sql`/`.query.sql` split, always-on foreign keys and WAL, Open/Close, OKF docs, two skills); this document records why each choice is sound and what was rejected.

## D1 — Module name and layout

- **Decision**: `packages/store`, Go module `github.com/kronothepenguin/project-reborn/packages/store`, registered with `go work use`; public package `store` at the module root; sqlc output at the root.
- **Rationale**: The name matches the spec and the authentication library's persistence contracts. Layout follows the repository rule "packages expose their public API at the root and keep implementation under `internal/`" — but the generated query code *is* the public data-access API, so it belongs at the root; adding a hand-written wrapper would be a boilerplate layer that YAGNI rejects. User decision C3 confirmed `store` over `storage`, `persistence`, and `database`.
- **Alternatives considered**: `packages/storage` (historical, deleted; README still mentions it), `packages/persistence` (longer, abstract), `packages/database` (names the engine), generated code under `internal/store` with root wrappers (rejected: every query would need a handwritten passthrough).

## D2 — Database driver and connection flags

- **Decision**: `modernc.org/sqlite` v1.58.x (pure Go, BSD-3-Clause), driver name `sqlite`, DSN `file:<path>?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)`. No CGO.
- **Rationale**: Pure Go keeps the workspace buildable without a C toolchain; each `_pragma` executes per connection, so every pooled connection gets referential integrity and the busy timeout, and WAL is persistent in the file. Verified locally: `PRAGMA foreign_keys` returns 1 and `PRAGMA journal_mode` returns `wal` after open with this DSN.
- **Alternatives considered**: `mattn/go-sqlite3` (CGO; historical choice), `ncruces/go-sqlite3` (wazero), `zombiezen/go-sqlite` — rejected for build friction or maturity. Setting pragmas with a one-time `Exec` after open was rejected because it does not cover connections created later by the pool.
- Sources: <https://pkg.go.dev/modernc.org/sqlite>, <https://gitlab.com/cznic/sqlite/-/tags>

## D3 — Connection pool and multi-process concurrency

- **Decision**: One `*sql.DB` per process with `SetMaxOpenConns(1)` and `SetMaxIdleConns(1)`, plus `busy_timeout(5000)`. Writes serialize inside the process; cross-process contention waits up to five seconds and then surfaces as a busy error.
- **Rationale**: WAL allows many readers but only one writer at a time, even across processes. `database/sql` defaults to unlimited open connections, which produces `SQLITE_BUSY` ("database is locked") under write contention; `busy_timeout` cannot always save a contended transaction because SQLite returns `SQLITE_BUSY` immediately when waiting could deadlock (read-lock upgrade). A single connection is the simplest configuration that is always correct; a separate read-only pool can be added later only if measured.
- **Alternatives considered**: multi-connection pool with retries (racy for writes), `_txlock=immediate` (does not reliably honor the busy timeout on `BeginTx`), application-level retry loops (complexity without a demonstrated need).
- Sources: <https://www.sqlite.org/wal.html#concurrency>, <https://github.com/mattn/go-sqlite3#faq>, <https://gitlab.com/cznic/sqlite/-/issues/232>

## D4 — Applying schemas at startup; reserved placeholder and Ping

- **Decision**: `//go:embed schema/*.schema.sql`, executed in lexicographic filename order on every `Open`, each file via a single multi-statement `ExecContext`. The module ships `schema/store.schema.sql` containing only a comment reserving the name, and `queries/ping.query.sql` with `-- name: Ping :one` / `SELECT 1 AS ok;`.
- **Rationale**: Idempotent DDL makes startup repeatable and safe; a single multi-statement `Exec` was verified to work with modernc.org/sqlite. `//go:embed` fails the build when a directory contains no embeddable files (verified), so at least one file must exist under `schema/`; sqlc fails with "no queries contained in paths" when the queries directory has no annotated query (verified in sqlc source), so at least one query must exist. `Ping` is a genuinely useful readiness/connectivity operation and keeps the whole pipeline (schema → query → generate → consume) exercised with zero domain data. A comment-only file parses to zero statements and executes as a no-op (verified).
- **Alternatives considered**: no schema directory until the first feature (build breaks on embed), an options surface to pass schemas at runtime (YAGNI), a real bookkeeping table (unneeded until a migration feature exists).
- Sources: <https://docs.sqlc.dev/en/latest/reference/config.html>, <https://pkg.go.dev/embed>

## D5 — sqlc configuration and tooling

- **Decision**: sqlc v1.31.x, `sqlc.yaml` version 2, `engine: sqlite`, `schema: schema`, `queries: queries`, `gen.go.package: store`, `out: .`, `emit_interface` left off. Pinned with `tool github.com/sqlc-dev/sqlc/cmd/sqlc` in `packages/store/go.mod`; `Makefile` target `generate: go tool sqlc generate`.
- **Rationale**: Directory paths are globbed in lexicographic order, so filename ordering is a documented convention (see D12). Cross-file `REFERENCES` work because the sqlc SQLite catalog does not resolve foreign keys. Generated files (`db.go`, `models.go`, `*.query.sql.go`) are committed; the tool directive keeps the sqlc version reproducible per the constitution's "no global tool installs" rule.
- **Alternatives considered**: sqlc v1 config (legacy), `go run ...@version` (does not pin through go.mod), a `tools.go` file (superseded by the `tool` directive).
- Sources: <https://docs.sqlc.dev/en/latest/reference/config.html>, <https://go.dev/doc/modules/managing-dependencies#tools>

## D6 — Value and time storage conventions

- **Decision**: Store time as unix seconds in UTC in integer columns; use `INTEGER`/`TEXT`/`REAL`/`BLOB` and `INTEGER` 0/1 for booleans, consistently with the session specification's reference schema. No sqlc `overrides` and no driver time magic.
- **Rationale**: `INTEGER` maps to `int64` in sqlc and modernc.org/sqlite, which is unambiguous and immune to time-zone or text-format differences across processes; the session authentication contract already uses unix seconds. Driver-level time conversion (`_time_format`, `_inttotime`) was rejected because it keys off declared column types and adds invisible behavior.
- **Alternatives considered**: `DATETIME` text with `_time_format=sqlite&_timezone=UTC`, `overrides` to `time.Time` — both add convention and coupling for no benefit at this project's scale.
- Sources: <https://github.com/sqlc-dev/sqlc/blob/v1.31.1/internal/codegen/golang/sqlite_type.go>, <https://pkg.go.dev/modernc.org/sqlite#Driver.Open>

## D7 — Error classification

- **Decision**: Export four helpers backed by `errors.As(err, *sqlite.Error)` and `sql.ErrNoRows`: `IsNotFound`, `IsConflict` (primary-key/unique constraint), `IsForeignKey`, `IsBusy` (busy or locked). sqlc generated methods return raw errors; consumers classify through the helpers.
- **Rationale**: Extended SQLite result codes are stable and were verified locally (`UNIQUE` 2067/1555, `FOREIGN KEY` 787, `SQLITE_BUSY` 5, `SQLITE_LOCKED` 6). `errors.Is(err, sql.ErrNoRows)` covers absent rows. This satisfies FR-005 without wrapping every generated method.
- **Alternatives considered**: string matching (fragile), wrapping each generated query (boilerplate), a custom error type per operation (YAGNI).
- Sources: <https://www.sqlite.org/rescode.html#constraint>, <https://pkg.go.dev/modernc.org/sqlite#Error>

## D8 — Public API: Open/Close, queries, transactions

- **Decision**: `store.Open(path string) (*Store, error)`, `(*Store).Close() error`; `Store` embeds the generated `*Queries` so consumers call typed operations directly; `(*Store).Begin(ctx) (*Tx, error)` with `Tx` embedding `*Queries` and exposing `Commit`/`Rollback`. `Open` creates missing directories? No — the consuming application owns the path; `Open` creates the file and applies schemas.
- **Rationale**: Embedding keeps the call sites minimal (`s.Ping(ctx)`, `s.GetSession(ctx, id)`), avoids wrapper methods, and lets transactions reuse the exact same typed operations via sqlc's `WithTx`. Explicit `Begin`/`Commit`/`Rollback` matches the standard library and the spec's "unit of work" requirement; a callback helper can be added later if a call site wants it.
- **Alternatives considered**: exposing `*sql.DB` for consumers to manage (breaks the single-owner rule), a hand-written interface per query (boilerplate), callback-only transactions (less flexible, no simpler).

## D9 — OKF knowledge bundle

- **Decision**: An OKF v0.2 bundle at `packages/store/knowledge/` with `index.md` (root, `okf_version: "0.2"`), one concept per schema file under `schemas/`, and one concept per query file under `queries/`. Concept types used by this project: `SQLite Table`, `SQL Schema File`, `SQL Query`, `Go Package`. Every concept has frontmatter (`type` required; `title`, `description`, `resource`, `tags`, `timestamp` recommended), a body with `# Schema` / `# Operations` / `# Examples` / `# Citations` as applicable, bundle-relative links to related concepts, and the source file path in `resource`.
- **Rationale**: OKF is markdown + YAML frontmatter, readable by humans and agents, diffable, and already suggested to live near the code it describes. One concept per schema file and per query file directly implements FR-017 and is easy to keep in sync when files are added. The bundle-per-module placement keeps the store self-describing.
- **Alternatives considered**: repo-root `docs/` bundle (farther from the code and from future feature contributions), one concept per table only (schema files with several tables would lack a 1:1 link), no bundle until real tables exist (would delay the skill and conformance check).
- Sources: <https://okf.md/spec/>, <https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing>, <https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf>

## D10 — Skills

- **Decision**: Two skills under `.agents/skills/`:
  - `documenting-with-okf/SKILL.md` — OKF description, the project's bundle layout and concept types, frontmatter and body rules, cross-linking, index/log conventions, a copy-paste conformance checklist, and links to the authoritative sources (Google Cloud announcement, okf.md spec, GoogleCloudPlatform/knowledge-catalog).
  - `adding-data-persistence/SKILL.md` — the end-to-end contribution workflow: add `.schema.sql` + `.query.sql` files under `packages/store`, keep them additive/idempotent and follow the SQL conventions, document with `documenting-with-okf`, run `go tool sqlc generate`, consume the generated operations through `store.Open`, run `go vet`/`go test`, commit generated code.
- **Rationale**: Both deliverables are explicitly requested and directly support FR-017–FR-019 and SC-008/SC-009. Splitting documentation mechanics from the persistence workflow keeps each skill single-purpose (SOLID) and lets the persistence skill reference the OKF skill instead of duplicating it.
- **Alternatives considered**: one combined skill (mixes two concerns), documentation in `docs/` only (agents and contributors would not load it automatically).
- Sources: `.agents/skills/reviewing-skills/SKILL.md`, `.agents/skills/applying-go-patterns/SKILL.md`

## D11 — Testing strategy

- **Decision**: Tests run from `packages/store` with `go test ./...` and `-race`. Use temp-file databases (`t.TempDir()`) for anything that asserts WAL or cross-connection behavior; assert `PRAGMA foreign_keys` = 1 and `PRAGMA journal_mode` = wal immediately after `Open`. Apply fixtures from `testdata/` through the unexported schema applier. For multi-process contention, re-exec the test binary as a helper subprocess that holds a write transaction while the main test asserts the busy outcome. In-memory shared-cache databases are used only for tests that do not need WAL.
- **Rationale**: WAL does not exist for in-memory databases (the pragma silently reports `memory`), and in-process connections do not faithfully model cross-process locking; subprocess tests cover the spec's multi-application story. Temp files avoid leaking state between tests.
- **Alternatives considered**: bare `:memory:` (per-connection, no WAL), long-lived repo-root database (pollutes the workspace), external test infrastructure (overkill).
- Sources: <https://www.sqlite.org/inmemorydb.html>, <https://www.sqlite.org/wal.html#sometimes_queries_return_sqlite_busy_in_wal_mode>

## D12 — Additive schema evolution

- **Decision**: Every schema file uses idempotent, additive DDL (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). Files are applied lexicographically by filename on every open. The store never alters or drops structures it does not declare, and no schema-version tracking is introduced. Incompatible changes to an existing structure require a future migration feature.
- **Rationale**: Matches the user's incremental model and keeps mixed-version deployments working (an older application ignores tables added by a newer one). Avoids a shared revision number that every feature would have to bump, and avoids `PRAGMA user_version` semantics that do not fit multi-feature contributions. sqlc parses the same files, so code generation and runtime application cannot drift.
- **Alternatives considered**: version guard that refuses newer databases (blocks rolling upgrades, requires global coordination), a migration framework now (no real migration exists yet — YAGNI).
