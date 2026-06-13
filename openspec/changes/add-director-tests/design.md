## Context

The Director runtime (`apps/client/src/director/`) has been refactored into four modules:
- `api.js` - Director API surface (constants, globals, 80+ functions)
- `core.js` - Private implementation (classes, loader, registries)
- `runtime.js` - Browser plugin replacement (custom elements, mount, run)
- `syntax.js` - Lingo syntax helpers (the proxy, chunk expressions)

The API includes:
- 80+ functions (math, type checks, list operations, string operations, etc.)
- 56 `the` proxy properties mapping to _movie, _player, _mouse, _key, _system
- Core object properties on Movie, Player, Mouse, Key, System, Member, Sprite classes
- Plugin API with custom elements, canvas management, event dispatching

Currently, no automated tests exist. The client project uses Vite for bundling but has no test framework configured.

## Goals / Non-Goals

**Goals:**
- Configure vitest for the client project with proper test discovery
- Write unit tests for all Director API functions based on Director MX 2004 reference documentation
- Write unit tests for all 56 `the` proxy properties
- Write integration tests for plugin API (custom elements, events, global state)
- Verify all tests match Director MX 2004 reference examples and expected behavior
- Document testing patterns and conventions with reference citations
- Enable watch mode for development workflow

**Non-Goals:**
- Test the translated LingoScript game code (fuse_client)
- Test browser-specific APIs that require full DOM (use mocks instead)
- Achieve specific coverage metrics (focus on correctness against reference)
- Set up CI/CD pipeline (out of scope for this change)
- Performance testing or benchmarking

## Decisions

### 1. Use vitest as the test framework

**Decision**: Use vitest instead of Jest or other test frameworks.

**Rationale**: 
- Native ESM support (project uses `"type": "module"`)
- Vite integration (already using Vite for bundling)
- Fast watch mode with HMR
- Built-in coverage with @vitest/coverage-v8
- Compatible with existing Vite config

**Alternatives considered**:
- Jest: Requires Babel/TS transformation, slower, ESM support is experimental
- Mocha + Chai: More setup required, no native Vite integration

### 2. Test file location: co-located with source

**Decision**: Place test files in `apps/client/src/director/__tests__/` directory.

**Rationale**:
- Keeps tests close to source code
- Easy to find related tests
- Clear separation from production code
- Vite can exclude `__tests__/` from production builds

**Alternatives considered**:
- `tests/` at project root: Harder to find related tests, more complex config
- Co-located `.test.js` files: Clutters source directory, harder to exclude from build

### 3. Mock browser APIs for plugin tests

**Decision**: Use vitest's built-in mocking for DOM APIs (CustomEvent, HTMLElement, etc.).

**Rationale**:
- Plugin API tests need to verify event dispatching and custom element lifecycle
- jsdom environment provides DOM APIs without a real browser
- Vitest's `vi.mock()` allows precise control over mock behavior
- Tests remain fast and deterministic

**Alternatives considered**:
- Real browser testing (Playwright/Cypress): Overkill for unit/integration tests, slower
- Manual DOM setup: More boilerplate, harder to maintain

### 4. Test structure: describe blocks by module/function

**Decision**: Organize tests with `describe()` blocks matching the module structure.

**Rationale**:
- `describe('api.js', ...)` groups all API tests
- Nested `describe('math functions', ...)` groups related tests
- Clear test hierarchy matches code organization
- Easy to run specific test suites

**Alternatives considered**:
- Flat test structure: Harder to navigate, no grouping
- Group by test type (unit/integration): Separates related functionality

### 5. Test verification based on Director MX 2004 reference

**Decision**: Verify tests match Director MX 2004 reference documentation examples and expected behavior.

**Rationale**:
- Director MX 2004 reference provides authoritative behavior specifications
- Reference includes examples that serve as test cases
- Ensures compatibility with original Director runtime
- Tests serve as living documentation of Director behavior

**Alternatives considered**:
- Coverage-based verification: Doesn't guarantee correctness
- Ad-hoc testing: Inconsistent, hard to maintain

## Risks / Trade-offs

- **[Mock accuracy]** Mocked browser APIs may not perfectly match real browser behavior. → Mitigation: Use jsdom environment, document known limitations, add integration tests later if needed.

- **[Test maintenance]** Tests may break when API changes. → Mitigation: Keep tests close to source, use clear naming, update tests in same PR as API changes.

- **[Coverage gaps]** Some functions are stubs with no implementation. → Mitigation: Document stubs, exclude from coverage, implement tests when functions are fully implemented.

- **[Performance]** Large test suite may slow down development. → Mitigation: Use vitest's watch mode, run only changed tests, parallelize test execution.

- **[False confidence]** Tests passing doesn't guarantee correctness. → Mitigation: Write tests based on Director MX 2004 spec, review tests in PRs, add edge cases.
