## ADDED Requirements

### Requirement: the proxy SHALL be implemented in syntax/the-proxy.js

The Director `the` proxy SHALL be implemented in `apps/client/src/director/syntax/the-proxy.js` with all system properties.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 14: Properties

**File**: `apps/client/src/director/syntax/the-proxy.js`
**Test**: `apps/client/src/director/syntax/__tests__/the-proxy.test.js`

#### Scenario: the proxy is importable
- **WHEN** code imports `import { the } from "../../director/syntax"`
- **THEN** the proxy is available

### Requirement: the proxy SHALL provide access to system properties

The `the` proxy SHALL provide access to all system properties documented in Director MX 2004.

#### Scenario: the.frame returns current frame
- **WHEN** `the.frame` is accessed
- **THEN** returns current frame number from _movie.frame

#### Scenario: the.mouseH returns mouse X coordinate
- **WHEN** `the.mouseH` is accessed
- **THEN** returns mouse X coordinate from _mouse.mouseH

#### Scenario: the.mouseV returns mouse Y coordinate
- **WHEN** `the.mouseV` is accessed
- **THEN** returns mouse Y coordinate from _mouse.mouseV

#### Scenario: the.stage returns stage dimensions
- **WHEN** `the.stage` is accessed
- **THEN** returns stage dimensions from _movie.stage

#### Scenario: the.keyCode returns last key code
- **WHEN** `the.keyCode` is accessed
- **THEN** returns last key code from _key.keyCode

#### Scenario: the.time returns current time
- **WHEN** `the.time` is accessed
- **THEN** returns current time string

### Requirement: the proxy SHALL enforce read-only properties

The `the` proxy SHALL throw an error when attempting to set read-only properties.

#### Scenario: Setting read-only property throws error
- **WHEN** `the.frame = 5` is attempted
- **THEN** throws error "Cannot set read-only property: the frame"

### Requirement: All the.* properties SHALL match Director MX 2004 exactly

Each `the.*` property SHALL behave exactly as documented in Director MX 2004.

#### Scenario: Properties match Director behavior
- **WHEN** any `the.*` property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
