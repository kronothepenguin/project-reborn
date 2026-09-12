# Feature Specification: Central Store Library

**Feature Branch**: `013-store-library`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "lets build a store library, it is the central store that all the applications will use when require database queries and mutations. i expect this to be source of truth for data persistence."

## Background

The project has no central persistence layer. Applications that need to read or write data must open the database themselves, write their own queries, and manage their own schema; the session authentication specification (012) deliberately defined persistence contracts without an implementation, leaving every consumer to build database access from scratch. This feature introduces the central store library: the helper infrastructure that owns the project's database — its lifecycle, structural updates, atomic units of work — and the shared home in which every feature declares the data structures and operations it persists. The store defines no domain data of its own. Each feature that persists data contributes its structures and operations to the shared store and consumes them as typed operations; every application uses the same database and extends it incrementally as needed. Every contributed structure and operation is documented in the store's Open Knowledge Format (OKF) knowledge bundle, and two reusable project skills keep that workflow repeatable for humans and agents alike.

## Clarifications

### Session 2026-09-12 (resolved — user decisions recorded)

- **C1 — store-owned data: none; infrastructure only.** The store is helper infrastructure around the project's embedded database and its typed query workflow; it owns no domain data. Each feature that persists data adds its structures and operations to the shared store, and all applications use the same database, creating their structures as needed incrementally. (User: "none, it is just a helper infrastructure ... the apps that ... actually implement program features will use the same database and create their tables as needed incrementally.") The concrete toolchain for declaring structures and producing typed operations is deliberately a planning decision, not part of this specification.
- **C2 — schema evolution is additive; mixed versions coexist.** The store applies its declared, idempotent structures on startup and leaves unknown structures untouched, so an application running an older version and one running a newer version can share the database safely. Incompatible changes to existing structures are out of scope and require a future explicit migration capability. (User: "Additive-only, coexist (Recommended)".)
- **C3 — module name: `packages/store`.** Discussed alternatives (`storage`, `persistence`, `database`); the project keeps the term already used by this specification and by the authentication library's persistence contracts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Applications get persistence without owning database code (Priority: P1)

An application developer wires the store once at startup, then performs every read and write through typed store operations. The application never opens a database connection, writes a query, or manages structure.

**Why this priority**: This is the core promise — one source of truth for data persistence. Without it, each application keeps ad-hoc database code and the project has no central store.

**Independent Test**: Build a minimal test application that wires the store against a fresh location, performs a create/read/update/delete sequence through store operations, closes and reopens the store, and asserts every value and failure outcome.

**Acceptance Scenarios**:

1. **Given** a fresh deployment with no database, **When** the application starts and uses the store, **Then** the database and its structure are created automatically with no manual step.
2. **Given** an initialized store, **When** the application creates a record and reads it back, **Then** every stored value matches what was written.
3. **Given** records written through the store, **When** the application restarts, **Then** the records are still available unchanged.
4. **Given** a write that violates a data rule (for example, a uniqueness requirement), **When** it is attempted, **Then** the store reports a distinguishable failure and stores nothing partially.
5. **Given** no matching record, **When** a read is performed, **Then** the store distinguishes "not found" from "storage failure".

---

### User Story 2 - New features extend the shared data incrementally (Priority: P2)

A feature that needs new data adds its structures and operations to the shared store, and every application can then use them against the same database — without disturbing any data or feature already there.

**Why this priority**: The store owns no domain data; its usefulness depends on features being able to extend it safely and incrementally. This is how all project data will arrive over time.

**Independent Test**: Add a new set of structures and operations to the shared store next to an existing set, run them from two applications against a database that already holds data, and assert the old data and operations are untouched.

**Acceptance Scenarios**:

1. **Given** a store with existing data, **When** a feature adds its structures and operations, **Then** existing data remains intact and existing operations keep behaving as before.
2. **Given** a feature's operations are added to the store, **When** any application uses them, **Then** it can read and write that feature's data through the shared database.
3. **Given** several features' structures coexist in one database, **When** the store initializes, **Then** all of them are available after a single startup.

---

### User Story 3 - One authoritative structure evolves without losing data (Priority: P2)

As the project's data needs change, the store applies its declared structural additions automatically when applications start, keeps one authoritative definition of every structure it declares, and never destroys existing records.

**Why this priority**: A central store is only a source of truth if it, not individual applications, defines and evolves the data structures; silent data loss on upgrade would be unacceptable.

**Independent Test**: Seed a database with one store version, start an application with a newer store version, assert old records survive and the new structure works; restart and assert idempotence; open with an older application and assert coexistence.

**Acceptance Scenarios**:

1. **Given** a database with data created by an earlier version, **When** an application starts with a newer store version, **Then** existing records are retained and the structure is updated automatically.
2. **Given** a restart with no structural changes, **When** the store initializes, **Then** no data is altered and initialization is repeatable.
3. **Given** a database containing structures contributed by a different version, **When** the store initializes, **Then** it applies only its declared structures and leaves the others untouched.

---

### User Story 4 - Persisted data is documented and added through a repeatable workflow (Priority: P2)

A contributor who needs new persisted data follows the project's persistence skill: declare the structure and operations in the shared store, document both in the knowledge bundle using the project's OKF skill, generate the typed operations, and consume them — with no other instructions required.

**Why this priority**: The store is extended continuously by many features and agents; without one documented, repeatable workflow the knowledge bundle drifts from the code and the central store stops being the source of truth.

**Independent Test**: From a clean checkout, follow only the persistence skill to add a table and its queries; assert the documentation conforms, the generated operations compile and run against the database, and the knowledge bundle index lists the new concepts.

**Acceptance Scenarios**:

1. **Given** a feature needs new persisted data, **When** the contributor follows the persistence skill, **Then** schema files, query files, OKF documentation, and working typed operations are produced by the documented steps alone.
2. **Given** any schema or query file in the store, **When** the knowledge bundle is inspected, **Then** a conformant OKF concept exists for it, links to the source file, and is listed in the bundle index.
3. **Given** only the knowledge bundle and the skills, **When** an agent looks for a persisted structure, **Then** it can locate the structure, its operations, and the source files they come from.

---

### User Story 5 - Multi-step changes are all-or-nothing (Priority: P2)

An application can group several reads and writes into one atomic unit so that a failure halfway leaves the data exactly as it was.

**Why this priority**: Real operations such as account creation with related records must not leave half-written state; a central store must make atomicity easy rather than optional.

**Independent Test**: Execute a unit of work whose later step fails and assert no earlier change is visible; interrupt the process mid-unit and assert the same after restart.

**Acceptance Scenarios**:

1. **Given** a unit of work with several mutations, **When** every step succeeds, **Then** all changes become visible together.
2. **Given** a unit of work where a later step fails, **When** it ends, **Then** none of its changes are visible.
3. **Given** a process interrupted in the middle of a change, **When** the application restarts, **Then** no partial change remains.

---

### User Story 6 - Multiple applications share the store safely (Priority: P3)

Every application in the project can read and write the same central data concurrently, and the data stays consistent.

**Why this priority**: The project runs several applications (CMS now; game and housekeeping next) that must observe the same state; correctness under concurrency is required for the store to be the source of truth.

**Independent Test**: Run two or more processes performing mixed reads and writes against one database and assert committed-data visibility, consistency, and clean conflict behavior.

**Acceptance Scenarios**:

1. **Given** two processes sharing the database, **When** one commits a change, **Then** the other observes it on a subsequent read.
2. **Given** simultaneous conflicting writes, **When** they execute, **Then** the data remains consistent — serialized or one side fails cleanly — with no corruption.
3. **Given** a long-running write, **When** another process reads, **Then** the reader sees a consistent state (before or after the write), never a partial one.

---

### Edge Cases

- Database file missing: created automatically on first use.
- Database location unwritable or read-only: startup fails with an actionable error; no silent fallback to a different location, which would split the source of truth.
- Database file corrupt or not a database: fails clearly and preserves the file for recovery; never silently recreates or overwrites it.
- Database locked by another process beyond a bounded wait: fails with a clear, distinguishable error rather than hanging indefinitely.
- Process terminated mid-write: committed data remains intact; the interrupted unit leaves no partial changes.
- Two processes initialize a fresh database at the same time: exactly one setup wins and both proceed.
- Database containing structures this version does not know (for example, tables added by a newer application version): tolerated; they are left untouched and only known structures are applied.
- A schema contribution that changes an existing structure incompatibly: out of scope for this version; it requires a future explicit migration path rather than a silent rewrite.
- A feature adds its structures while another process is running: the running process is unaffected until it re-reads; no data is lost.
- A schema or query file with no OKF concept, or a concept missing its required type: an incomplete contribution, caught by the documentation conformance check.
- Text with non-ASCII characters, empty strings, and maximum-length values: stored and retrieved unchanged.
- Repeated create of a record that must be unique: distinguishable failure; the original record is untouched.
- Read of a deleted or never-existing record: "not found" outcome distinct from a storage failure.
- Clock changes or time-zone differences: stored times remain unambiguous and comparable across applications and restarts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The store MUST be the only component that opens, owns, and manages the project's database; applications and libraries MUST NOT open connections or issue queries outside it.
- **FR-002**: The store MUST create the database and all declared structures automatically on first use and MUST be repeatable on every start with no manual setup step.
- **FR-003**: All project data structures and the operations over them MUST be declared in the shared store and exposed to consumers as typed operations; consumers MUST NOT need to write queries or know the storage engine.
- **FR-004**: The store MUST let each feature add its data structures and operations incrementally (structural evolution is governed by FR-008), without affecting existing data or the behavior of features already present.
- **FR-005**: The store MUST distinguish, for every operation, between success, "no matching record", "data-rule violation", and "storage failure", and MUST never partially apply a failed operation.
- **FR-006**: The store MUST let an application group multiple operations into one atomic unit; on failure or interruption, none of the unit's changes are visible.
- **FR-007**: The store MUST persist every successful change across application restarts.
- **FR-008**: The store MUST own one authoritative definition of every structure it declares and apply its declared structures automatically at startup, retaining all existing data; structural evolution is additive and idempotent.
- **FR-009**: The store MUST NOT alter or remove structures it did not declare; data contributed by other applications or versions MUST be left untouched so mixed versions coexist.
- **FR-010**: The store MUST support concurrent use by multiple application processes over one shared database: committed changes are visible to all, and conflicts never corrupt data.
- **FR-011**: The store MUST fail clearly and safely when the database is unavailable, locked beyond a bounded wait, unwritable, or corrupt, and MUST NOT silently discard or overwrite existing data.
- **FR-012**: The store MUST enforce referential integrity between declared structures and keep the database in a mode that allows concurrent readers with a single writer.
- **FR-013**: The store MUST accept its database location from the consuming application, expose explicit open and close operations, and own all other database concerns.
- **FR-014**: The store MUST be reusable by every application in the project without depending on any specific application, feature, route, or user interface.
- **FR-015**: The store MUST round-trip stored values faithfully, including non-ASCII text, numeric, boolean, and time values, with times stored unambiguously for comparison across applications and restarts.
- **FR-016**: List-style reads contributed by features (operations returning many records) MUST return results in a deterministic, documented order; the v1 module ships no such operation, so the SQL conventions contract enforces this for future contributions.
- **FR-017**: Every schema file and query file in the store MUST have a conformant OKF concept document in the store's knowledge bundle, linked to its source file and listed in the bundle index.
- **FR-018**: The project MUST provide a reusable OKF documentation skill containing the format description, a conformance checklist, and links to the authoritative OKF specification; schema and query documentation MUST follow it.
- **FR-019**: The project MUST provide a reusable persistence skill that takes a feature from a data need to working typed operations: create schema and query files, document them with the OKF skill, generate the typed operations, and consume them.

### Key Entities *(include if feature involves data)*

- **Database**: the single persistent data source for the whole project, shared by all applications; its lifecycle and structures are owned by the store.
- **Data definition**: a structure a feature declares in the shared store, together with the operations allowed over it; the unit by which the store is extended incrementally.
- **Store operation**: a typed, domain-oriented read or write contributed by a feature and exposed to consumers (for example, create a session, find records by a key) — the only way applications touch data.
- **Unit of work**: an atomic group of store operations that either all take effect or none do.
- **Knowledge concept**: an OKF document (markdown with YAML frontmatter) that documents one schema file or query file, links to the source file, and relates it to the structures it belongs to.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All project applications obtain persistence exclusively through the store — zero direct database or query code outside it, verified by inspection of every module.
- **SC-002**: A developer can integrate the store into a new application and perform the first persisted write and read in under 15 minutes, without writing any query or connection code.
- **SC-003**: 100% of successfully written records remain available, unchanged, after application restarts.
- **SC-004**: A new feature can add its data structures and operations to the shared store and use them from any application without affecting existing data or features, as verified by adding a new data domain next to an existing one.
- **SC-005**: With two or more processes performing mixed reads and writes against one database, no committed data is lost and no corruption is observed over a sustained run.
- **SC-006**: 100% of pre-existing records survive structural updates, and upgrading requires no manual steps; an older application version and a newer one operate against the same database without error.
- **SC-007**: Every failure mode (missing, locked, unwritable, or corrupt database; data-rule violation; missing record) produces a distinct, actionable outcome with zero silent data loss.
- **SC-008**: 100% of schema and query files have a conformant OKF concept listed in the knowledge bundle index, verified by the conformance check.
- **SC-009**: A contributor can add a new persisted structure and its operations from a clean checkout by following only the persistence skill, with no undocumented files and no ad-hoc database code.

## Assumptions

- One embedded, file-based database is shared by every application in a deployment; there is no separate database server process to operate (the project already declares an embedded database as its persistence choice).
- The store defines no domain data of its own. Every feature that persists data adds its structures and operations to the shared store as part of its implementation, and all applications see them.
- The concrete toolchain used to declare structures and produce typed operations is a planning decision; this specification fixes only the behavior.
- Structures evolve additively through idempotent declarations. Incompatible changes to existing structures require a future explicit migration capability and are out of scope here.
- Documentation uses Open Knowledge Format (OKF) v0.2 and lives as a knowledge bundle inside the store module, next to the schema and query files it documents; the two authoring skills live with the project's agent skills.
- Only server-side applications and libraries consume the store directly; browser clients keep reaching data through application endpoints.
- Domain business rules, credential handling, and authorization stay with the consuming feature; the store persists what it is given and never interprets secrets.
- Test and development environments may point the store at a disposable or in-memory location; production points at the shared data file.
- Multiple applications run on the same host sharing a filesystem. Distributed or replicated databases, and remote database servers, are out of scope.
- The stale database artifacts in the repository contain no data that must be preserved.
- In scope: database lifecycle, the shared home for all data structures and operations, incremental extension by features, additive structural updates, atomic units of work, error semantics, concurrency safety, the OKF knowledge bundle, and the two reusable authoring skills.
- Out of scope: the domain data definitions themselves (each is owned by the feature that persists it), incompatible structural migrations, endpoints and user interfaces, background or reporting jobs, and database replication or failover.

## Dependencies & Scope Boundaries

- **Depends on**: a file-based embedded database available to the deployment; the features that contribute their data structures and operations to the shared store; the Open Knowledge Format specification for documentation.
- **Consumed by**: every application requiring persistence (CMS first; game and housekeeping later) and library packages that need data access (session authentication first, once its persistence feature is implemented).
- **Boundary**: the store owns connection lifecycle, the authoritative home and evolution of every declared structure, atomic units of work, typed-operation infrastructure, and error semantics. Each feature owns the data structures and operations it contributes and its own business rules. Applications own configuration (database location), endpoints, and user interfaces. Documentation and skills define how contributions are made; they do not add runtime behavior.