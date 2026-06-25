## Why

The Director runtime needs browser integration to replace the Shockwave Player plugin. The current implementation in `runtime.js` is incomplete and needs to be split into atomic files with full documentation. This change implements the runtime layer that mounts Director movies in the DOM, handles custom elements, manages the event loop, loads cast libraries, and manages script lifecycle.

## What Changes

- Split `apps/client/src/director/runtime.js` into atomic files in `apps/client/src/director/runtime/`
- Implement custom elements (`<x-object>`, `<x-param>`) for embedding Director movies
- Implement event loop for frame-based playback
- Implement cast library loading from URLs
- Implement script lifecycle (prepareMovie, startMovie, stopMovie, etc.)
- Create co-located tests in `apps/client/src/director/runtime/__tests__/`

## Capabilities

### New Capabilities
- `director-runtime`: Complete browser integration layer with custom elements, event loop, cast loading, and script lifecycle

### Modified Capabilities
None

## Impact

- **Code**: New directory `apps/client/src/director/runtime/` with multiple files
- **Tests**: New test directory `apps/client/src/director/runtime/__tests__/`
- **Dependencies**: All core classes (MovieRef, PlayerRef, CastLibraryRef, etc.)

## Components to Implement

| Component | Description |
|-----------|-------------|
| Custom Elements | `<x-object>` and `<x-param>` for embedding movies |
| Event Loop | Frame-based playback at specified tempo |
| Cast Loading | Load cast libraries from URLs |
| Script Lifecycle | prepareMovie, startMovie, stopMovie, prepareFrame, enterFrame, exitFrame |
| Canvas Management | Stage rendering and updates |
