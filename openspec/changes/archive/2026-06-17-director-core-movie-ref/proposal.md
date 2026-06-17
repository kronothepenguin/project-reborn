## Why

The `MovieRef` class represents the movie object in Director MX 2004, accessible as `_movie`. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `MovieRef` class with all properties documented in the Director MX 2004 reference, with each property having its own spec file containing full documentation.

## What Changes

- Implement `MovieRef` class in `apps/client/src/director/core/movie-ref.js`
- Implement all MovieRef properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/movie-ref.test.js`
- Each property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-movie-ref`: Complete MovieRef class implementation with all properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/movie-ref.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: `director-core-cast-library-ref`, `director-core-sprite-ref` (for castLib and sprite properties)

## Properties to Implement

| Property | Lines | Description |
|----------|-------|-------------|
| _movie | 31497-31528 | Top-level movie reference |
| actorList | - | List of active behavior scripts |
| castLib | - | Cast libraries (indexed registry) |
| copyrightInfo | 35747-35760 | Copyright information |
| editShortCutsEnabled | - | Edit shortcuts flag |
| exitLock | - | Exit lock flag |
| frame | - | Current frame number |
| frameTempo | - | Current tempo (frames/sec) |
| keyboardFocusSprite | - | Keyboard focus sprite |
| lastChannel | - | Last sound channel |
| member | 42949-42973 | Member access |
| movie | 44262-44282 | Movie reference |
| moviePath | - | Full movie path |
| name | - | Movie name |
| path | 45754-45789 | Movie path |
| sprite | 50123-50143 | Sprite access |
| stage | - | Stage dimensions |
| timeoutList | - | Active timeouts |
| traceScript | - | Script trace flag |
| xtraList | 54617-54647 | Loaded Xtras |

## Methods to Implement

| Method | Description |
|--------|-------------|
| go(frame) | Go to frame |
| halt() | Stop movie |
| puppetSprite(channel, flag) | Puppet a sprite |
| puppetTempo(tempo) | Set tempo |
| rollOver(sprite) | Check rollover |
| stopEvent() | Stop current event |
| updateStage() | Update stage display |
