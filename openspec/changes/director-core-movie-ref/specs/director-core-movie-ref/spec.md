## ADDED Requirements

### Requirement: MovieRef class SHALL be implemented in core/movie-ref.js

The `MovieRef` class SHALL be implemented in `apps/client/src/director/core/movie-ref.js` with all properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/movie-ref.js`
**Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`

#### Scenario: MovieRef class is importable
- **WHEN** code imports `import { MovieRef } from "../../director/core"`
- **THEN** MovieRef class is available

#### Scenario: MovieRef is accessible as _movie
- **WHEN** code accesses `_movie`
- **THEN** returns MovieRef instance

### Requirement: MovieRef SHALL have read-only properties

The following MovieRef properties SHALL be read-only:
- `frame` - Current frame number
- `castLib` - Cast libraries (indexed registry)
- `sprite` - Sprites (indexed registry)
- `stage` - Stage dimensions
- `xtraList` - Loaded Xtras

#### Scenario: frame is read-only
- **WHEN** `_movie.frame` is accessed
- **THEN** returns the current frame number
- **WHEN** `_movie.frame = 5` is attempted
- **THEN** operation is ignored or throws error

### Requirement: MovieRef SHALL have read-write properties

The following MovieRef properties SHALL be read-write:
- `frameTempo` - Current tempo (frames/sec)
- `exitLock` - Exit lock flag
- `editShortCutsEnabled` - Edit shortcuts flag
- `keyboardFocusSprite` - Keyboard focus sprite
- `traceScript` - Script trace flag

#### Scenario: frameTempo can be set
- **WHEN** `_movie.frameTempo = 60` is executed
- **THEN** movie tempo is updated to 60 fps

### Requirement: MovieRef SHALL support movie information properties

MovieRef SHALL provide properties for movie information.

#### Scenario: name returns movie name
- **WHEN** `_movie.name` is accessed
- **THEN** returns the movie name string

#### Scenario: path returns movie path
- **WHEN** `_movie.path` is accessed
- **THEN** returns the movie path string

### Requirement: MovieRef SHALL support playback control methods

MovieRef SHALL provide methods for controlling movie playback.

#### Scenario: go navigates to frame
- **WHEN** `_movie.go(5)` is called
- **THEN** playhead moves to frame 5

#### Scenario: halt stops playback
- **WHEN** `_movie.halt()` is called
- **THEN** movie playback stops

#### Scenario: puppetSprite puppets a sprite
- **WHEN** `_movie.puppetSprite(1, true)` is called
- **THEN** sprite 1 becomes a puppet

### Requirement: MovieRef properties SHALL match Director MX 2004 exactly

Each MovieRef property SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `_movie.md` - Top-level movie reference
- `actorList.md` - List of active behavior scripts
- `castLib.md` - Cast libraries
- `copyrightInfo.md` - Copyright information
- `editShortCutsEnabled.md` - Edit shortcuts flag
- `exitLock.md` - Exit lock flag
- `frame.md` - Current frame number
- `frameTempo.md` - Current tempo
- `keyboardFocusSprite.md` - Keyboard focus sprite
- `lastChannel.md` - Last sound channel
- `member.md` - Member access
- `movie.md` - Movie reference
- `moviePath.md` - Full movie path
- `name.md` - Movie name
- `path.md` - Movie path
- `sprite.md` - Sprite access
- `stage.md` - Stage dimensions
- `timeoutList.md` - Active timeouts
- `traceScript.md` - Script trace flag
- `xtraList.md` - Loaded Xtras

#### Scenario: All properties implemented
- **WHEN** any MovieRef property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
