## ADDED Requirements

### Requirement: Control functions SHALL be implemented in api/ directory

The Director MX 2004 control functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/abort.js`
- `apps/client/src/director/api/go.js`
- `apps/client/src/director/api/halt.js`
- `apps/client/src/director/api/quit.js`
- `apps/client/src/director/api/stopEvent.js`

**Tests**:
- `apps/client/src/director/api/__tests__/abort.test.js`
- `apps/client/src/director/api/__tests__/go.test.js`
- `apps/client/src/director/api/__tests__/halt.test.js`
- `apps/client/src/director/api/__tests__/quit.test.js`
- `apps/client/src/director/api/__tests__/stopEvent.test.js`

#### Scenario: Control functions are importable
- **WHEN** code imports `import { abort, go, halt, quit, stopEvent } from "../../director/api"`
- **THEN** all control functions are available

#### Scenario: Control functions integrate with MovieRef
- **WHEN** control functions are called
- **THEN** they delegate to MovieRef methods

### Requirement: abort() SHALL abort current handler

The `abort()` function SHALL abort the current handler by throwing an error.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 11737-11766

#### Scenario: abort throws error
- **WHEN** `abort()` is called
- **THEN** throws an error to abort handler

### Requirement: go() SHALL navigate to frame

The `go()` function SHALL navigate to a specified frame.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 17971-18040

#### Scenario: go navigates to frame number
- **WHEN** `go(5)` is called
- **THEN** playhead moves to frame 5

#### Scenario: go navigates to frame marker
- **WHEN** `go("intro")` is called
- **THEN** playhead moves to "intro" marker

### Requirement: halt() SHALL stop movie playback

The `halt()` function SHALL stop movie playback.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 18259-18290

#### Scenario: halt stops playback
- **WHEN** `halt()` is called
- **THEN** movie playback stops

### Requirement: quit() SHALL exit application

The `quit()` function SHALL exit the application.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 25227-25258

#### Scenario: quit exits application
- **WHEN** `quit()` is called
- **THEN** application exits

### Requirement: stopEvent() SHALL stop event propagation

The `stopEvent()` function SHALL stop event propagation.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28419-28470

#### Scenario: stopEvent stops propagation
- **WHEN** `stopEvent()` is called in event handler
- **THEN** event propagation stops

### Requirement: All control functions SHALL match Director MX 2004 exactly

Each control function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `abort.md` - Abort current handler
- `go.md` - Go to frame
- `halt.md` - Halt movie playback
- `quit.md` - Quit application
- `stopEvent.md` - Stop event propagation

#### Scenario: All functions implemented
- **WHEN** any control function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
