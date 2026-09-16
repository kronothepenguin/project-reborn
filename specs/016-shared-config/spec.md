# Feature Specification: Shared Configuration Layer

**Feature Branch**: `016-shared-config`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "a shared configuration layer over a single config.json"

## Background

Project Reborn needs one predictable way to configure its software. This feature specifies the project's base configuration layer: a shared library that owns a single `config.json` for the whole project, provides setting values to its consumers, and guarantees a working value for every declared setting when the file is absent or incomplete. The layer is the foundation every application builds on: it starts empty and grows one declared section or shared setting at a time as applications and features are built. This specification defines the layer itself; it adds no application settings and changes no existing application. Configuration is never taken from environment variables.

## Clarifications

### Session 2026-09-15 (resolved — user decisions recorded)

- **C1 — environment variables are never used.** `config.json` is the only configuration source; the layer must not read environment variables for configuration. (User: "Environment variables are bullshit. We are not using them anytime.")
- **C2 — scope is the base layer only.** This feature specifies the shared configuration layer; existing applications are not changed and no application settings are introduced now. Each application implements its slice in this library as it is built. (User decision recorded 2026-09-15.)
- **C3 — fail-safe defaults.** Every setting always has a default. If `config.json` does not exist, the layer creates it with the default values. If a key is missing, the layer uses the default value and does not modify the existing `config.json`. (User decision recorded 2026-09-15.)
- **C4 — a wrong configuration must not run.** Configuration is the very first thing loaded; when a present value is wrong, or the file cannot be read, the program stops before it runs. There is no fallback for a wrongly filled key. (User: "panic, config.json is the very first thing to be loaded, if config wrong just don't run".)
- **C5 — the file is `config.json` in the working directory.** The layer reads `config.json` directly from the process's current working directory and searches nowhere else; the working directory is the project base in normal operation. (User: "just read config.json, I suppose the PWD is always the root. For go, it does not matter if your .go is on /app1/cmd/main.go or /app2/cmd/main.go when you execute from /, so /config.json exists and read just config.json is the way to go.")
- **C6 — the configuration is composed, section by section.** The root configuration starts empty. A component that needs settings adds its own named section; each section lives in its own place in the layer and carries its own shape, defaults, and validation rules. A project-wide setting is added directly to the root, again with its own default and validation. Nothing is declared until a component or feature is built. (User decision recorded 2026-09-15.)
- **C7 — unrecognized keys are ignored.** A key that no declared setting recognizes is ignored; consumers read only their declared settings, and the key is left untouched in the file. (User: "Ignore unrecognized keys".)
- **C8 — `config.json` is deployment data and is not committed.** The repository root `.gitignore` excludes it. (User decision recorded 2026-09-15.)
- **C9 — configuration loads once, at program initialization.** Programs are run one by one; cross-process contention over a missing file is out of scope. (User decision recorded 2026-09-15.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One shared layer serves configuration from a single file (Priority: P1)

As a developer building an application on the project, I declare the application's settings through the shared configuration layer, and any consumer reads those settings from the project's single `config.json`; nothing reads environment variables and no consumer invents its own file parsing.

**Why this priority**: The layer is the feature; every application slice built later depends on it.

**Independent Test**: Declare a setting through the layer, consume it as an application would, and assert the value comes from the single `config.json`; assert no environment variable is required or consulted. No existing application needs to change.

**Acceptance Scenarios**:

1. **Given** the layer and a setting declared through it, **When** a consumer reads the setting, **Then** the value comes from the project's single `config.json`.
2. **Given** the layer, **When** a consumer reads any setting, **Then** no environment variable is consulted.
3. **Given** a new application slice, **When** it needs settings, **Then** it declares them through the layer and no separate configuration mechanism is created.
4. **Given** this release, **When** it is delivered, **Then** no application setting has been added and no existing application has been modified.

---

### User Story 2 - Missing configuration never blocks (Priority: P1)

As a developer or operator, when `config.json` is absent the layer creates it from the declared defaults, and when a key is missing the layer returns that setting's default; an existing file is never rewritten to add missing defaults.

**Why this priority**: Fail-safe startup is an explicit requirement; a missing file or key must never stop the software or alter the file.

**Independent Test**: Consume configuration with no `config.json` and assert the file is created with the declared default values and those defaults are returned; remove a key from an existing file and assert the default is returned and the file is otherwise byte-for-byte unchanged.

**Acceptance Scenarios**:

1. **Given** no `config.json`, **When** configuration is requested, **Then** the file is created containing the declared default values and consumers receive those defaults.
2. **Given** a `config.json` that lacks a declared key, **When** that setting is read, **Then** the declared default is returned.
3. **Given** a `config.json` that lacks a declared key, **When** the default is returned, **Then** the existing file is not modified.
4. **Given** a `config.json` with explicit values, **When** settings are read, **Then** the file's values are returned and defaults are not substituted.

---

### User Story 3 - A wrong configuration stops the program (Priority: P1)

As a developer or operator, when `config.json` holds a value that is wrong for its setting, or the file cannot be read as configuration at all, the program stops before it runs, with a report naming the file and the offending key; the program never starts with an invalid configuration.

**Why this priority**: The user requires configuration to be the first thing loaded and a wrong configuration to never run.

**Independent Test**: Place wrong-typed, out-of-range, and unreadable content in `config.json`, attempt to run a consumer, and assert it stops before running and reports the file and key; correct the file and assert it runs.

**Acceptance Scenarios**:

1. **Given** a present value with the wrong form, **When** the program loads configuration, **Then** it stops before running and reports the file and the offending key with the expected form.
2. **Given** a value outside its declared range, **When** the program loads configuration, **Then** it stops before running and reports the key and the allowed range.
3. **Given** a file that cannot be read as configuration, **When** the program loads configuration, **Then** it stops before running and reports that the file cannot be read.
4. **Given** a corrected file, **When** the program loads configuration, **Then** it runs.

---

### User Story 4 - The configuration grows one declared section at a time (Priority: P2)

As a developer, when a component needs settings I add its named section to the layer with its own defaults and validation, and when a value belongs to the whole project I add it directly to the root the same way; no other declaration changes, and the file stays the single source.

**Why this priority**: Composition is how the layer stays maintainable as applications are built; it refines the core behavior without which the layer still delivers value.

**Independent Test**: Add one section and one root-level shared setting through the layer; assert each brings its own default and validation, that no other declaration changes, and that consumers read the new values from the same single file.

**Acceptance Scenarios**:

1. **Given** the base layer with no settings, **When** a component declares a section, **Then** the section carries its own shape, defaults, and validation and appears under its own name in the single file.
2. **Given** the base layer, **When** a project-wide setting is declared, **Then** it belongs to the root configuration with its own default and validation.
3. **Given** a newly declared section or shared setting, **When** it is added, **Then** no other section's or setting's declaration, defaults, or validation change.
4. **Given** the base layer before any component declares settings, **When** the file is created, **Then** it is a valid empty configuration and the program runs.

---

### Edge Cases

- `config.json` is absent.
- `config.json` exists but is empty or is not readable as configuration.
- A declared key is missing from the file.
- A value has the wrong form or is blank.
- A value is outside its declared range.
- A key appears in the file that no declared setting recognizes.
- The file contains formatting and ordering different from what the layer would write.
- The file has been edited by hand; explicit values are respected as written.
- A consumer is started from a directory other than the project base; the file is read from that directory's working directory.
- A component or feature is not built yet; its settings do not exist and the file remains valid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST have exactly one shared configuration file named `config.json`, and it MUST be the only place configuration values are stored.
- **FR-002**: The layer MUST NOT read configuration from environment variables or from any source other than `config.json`.
- **FR-003**: A shared configuration layer MUST provide configuration values to every consumer; no consumer may parse the file itself.
- **FR-004**: Every setting MUST always have a default; the absence of the file or of a key MUST never prevent a consumer from obtaining a value.
- **FR-005**: When `config.json` does not exist at the moment configuration is requested, the layer MUST create it populated with the declared default values.
- **FR-006**: When a declared key is missing from an existing file, the layer MUST return the declared default for that setting.
- **FR-007**: When a key is present in the file, the layer MUST return the value as written, taking precedence over the default.
- **FR-008**: A present value that does not match its setting's declared form or range MUST stop the program before it runs; a wrongly filled key MUST NOT fall back to its default.
- **FR-009**: Every report MUST name the file and the offending key and state the expected form, so the file can be fixed without reading code.
- **FR-010**: The layer MUST load the configuration once per process and return the same configuration to every caller.
- **FR-011**: An existing `config.json` MUST NOT be rewritten by the layer — not to insert missing defaults, not to normalize formatting, and not to remove unrecognized keys.
- **FR-013**: This release MUST define no application settings and MUST NOT modify existing applications; each application adds its slice through the layer when it is built.
- **FR-014**: The layer MUST read `config.json` from the process's current working directory and MUST NOT search any other location.
- **FR-015**: Keys in the file that no declared setting recognizes MUST be ignored: consumers read only their declared settings, and unrecognized keys MUST be left untouched in the file.
- **FR-016**: `packages/config/README.md` MUST identify `config.json` and the layer as the single place configuration is defined, and MUST describe how a component declares a section or a shared setting with its default.
- **FR-017**: The root configuration MUST start empty and contain only settings declared by components and features that have been built; no placeholder or speculative setting may be added.
- **FR-018**: Each component's settings MUST be declared as one named section that owns its shape, defaults, and validation; a project-wide setting MUST be declared directly in the root with its own default and validation.
- **FR-019**: A setting's declaration MUST include its default and its validation rule, and every consumer of that setting MUST use the same declaration.
- **FR-020**: Loading configuration MUST be the first thing a program does; no other component may start before configuration has been loaded successfully.

### Key Entities *(include if feature involves data)*

- **Configuration file**: the single `config.json`; the project's only configuration source.
- **Root configuration**: the top-level configuration; starts empty, holds shared project-wide settings and the named sections declared by components.
- **Section**: the named settings of one component or feature, owning its shape, defaults, and validation.
- **Shared setting**: a project-wide value declared directly in the root, with its own default and validation.
- **Default**: the value used and returned when the file or the key is absent, and the value used to populate a newly created file.
- **Validation rule**: the declared form and range of a setting; a present value violating it stops the program.
- **Consumer**: an application or library entry point that obtains settings from the layer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of declared settings are obtainable from the single `config.json`; no configuration value comes from any other source.
- **SC-002**: With no `config.json`, first use creates the file populated with declared defaults and returns those defaults in 100% of tested cases.
- **SC-003**: With a key missing from an existing file, the layer returns its default and the file remains byte-for-byte unchanged in 100% of tested cases.
- **SC-004**: 100% of tested wrong values (wrong form, out of range, unreadable document) stop the program before it runs, with the file and key identified; no program runs with an invalid configuration.
- **SC-005**: 0 environment variables are required or consulted for configuration, in 100% of tested cases.
- **SC-006**: Adding a section or a shared setting uses only that declaration's shape, defaults, and validation and changes no other declaration; no component parses the file itself.
- **SC-007**: Loading happens once per process and every caller receives the same configuration, in 100% of tested cases.
- **SC-008**: A consumer can obtain every declared setting with the file absent, partially filled, or fully explicit, in 100% of tested cases.
- **SC-009**: Every consumer reads exactly `config.json` from its working directory; no other location is consulted, in 100% of tested cases.
- **SC-010**: Before any component declares settings, the created file is a valid empty configuration and the program runs in 100% of tested cases.

## Assumptions

- The consumers of the layer are the project's Go applications and libraries; non-Go consumers are out of scope.
- The working directory is the project base in normal operation, so every consumer resolves the same file.
- Configuration is loaded first, at startup; live reloading while running is out of scope.
- Consumers are responsible for obtaining all configuration through the layer and for loading it before starting any other component; the layer cannot enforce call order.
- The file is plain JSON without comments; explanations live in the project documentation.
- This release introduces no configurable value; a file created from the base layer alone is a valid empty configuration.
- The exact wording and channel of a failure report are not fixed here; the requirement is that the report names the file and the offending key with the expected form.
- Sensitive values are out of scope for this release; how a future sensitive setting is supplied will be defined by the spec that needs it.
