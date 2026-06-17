## Why

The Director runtime API was recently refactored and expanded with 160+ new functions, properties, and `the` proxy entries. Without automated tests, regressions can slip through undetected. Adding a comprehensive test suite with vitest ensures the API behaves correctly as we continue translating LingoScript to JavaScript.

Additionally, the plugin API (runtime.js) handles browser integration through custom elements (`<x-object>`, `<x-param>`), canvas management, and event dispatching. These interactions update global state like `_mouse.mouseH`, `_key.keyCode`, and other runtime properties that need verification.

## What Changes

- Add vitest as a dev dependency to the client project
- Create test configuration for the director module
- Implement unit tests for all Director API functions (math, type checks, list operations, string operations, etc.) based on Director MX 2004 reference
- Implement unit tests for all `the` proxy properties
- Implement integration tests for the plugin API (custom elements, event handling, global state updates)
- Verify all tests match Director MX 2004 reference documentation examples and behavior
- Document testing conventions and patterns

## Capabilities

### New Capabilities
- `director-api-tests`: Unit tests for all Director API functions including math operations, type checking, list/property list operations, string operations, conversion functions, and instance creation
- `director-proxy-tests`: Unit tests for all 56 `the` proxy properties ensuring correct mapping to underlying objects (_movie, _player, _mouse, _key, _system)
- `plugin-integration-tests`: Integration tests for the browser plugin replacement API including custom element lifecycle, event dispatching, canvas management, and global state updates (mouse position, key codes, etc.)

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Dependencies**: Add vitest and @vitest/coverage-v8 to devDependencies
- **Code structure**: New `tests/` directory under `apps/client/src/director/`
- **Build**: Test files excluded from production build
- **CI/CD**: Tests can be run via `npm test` or `vitest` command
- **Developer workflow**: Tests run on file changes during development
- **Documentation**: Testing patterns documented for future contributors, with references to Director MX 2004 spec
