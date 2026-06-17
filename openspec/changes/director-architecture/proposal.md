## Why

The Director runtime implementation needs to be reorganized to follow a clear, atomic structure where each method and class has its own file with co-located tests. The current monolithic files (api.js, core.js) make it difficult to track implementation progress against the Director MX 2004 reference documentation. 

**Critical issue**: Previous implementation may contain AI-hallucinated behavior not matching Director MX 2004. Each spec file must contain the **full documentation** from the official reference to ensure correctness.

This change establishes the architectural foundation for implementing the full Director API systematically.

## What Changes

- **BREAKING**: Reorganize `apps/client/src/director/` from monolithic files to atomic folder structure
- **BREAKING**: Rename classes that represent API-returned objects to use `Ref` suffix (Member → MemberRef, Sound → SoundRef, Sprite → SpriteRef, etc.)
- **BREAKING**: Move tests from `__tests__/` to co-located `__tests__/` folders within each module (api/__tests__/, core/__tests__/, runtime/__tests__/)
- Delete existing specs that don't follow the new atomic structure
- Establish clear separation: core (private API) → api (public API) → runtime (browser glue) → syntax (Lingo helpers)
- **Each spec file contains full Director MX 2004 documentation** (Usage, Description, Parameters, Example)

## Capabilities

### New Capabilities
- `director-core`: Private API implementation - all Director system classes (List, PropList, Point, Rect, Color, MemberRef, SpriteRef, MovieRef, PlayerRef, SoundRef, CastLibraryRef, etc.) with their properties and methods
- `director-api`: Public API implementation - all top-level Director functions (abort, abs, atan, beep, call, chars, etc.) that use core classes internally
- `director-runtime`: Browser integration - DOM mounting, custom elements, event loop, cast loading, script lifecycle
- `director-syntax`: Lingo syntax helpers - `the` proxy, chunk expressions (char, item, line, word), put operations

### Modified Capabilities
- `director-architecture`: Update to reflect new atomic folder structure, Ref naming convention, and full documentation requirement
- `director-constants`: Move into director-api capability as constants are part of public API
- `director-methods`: Split into individual method specs under director-api
- `director-properties`: Split into individual property specs under director-core classes
- `director-syntax`: Update to reflect new folder location and test organization
- `director-api-tests`: Delete - tests will be co-located with implementations
- `director-proxy-tests`: Delete - tests will be co-located with syntax implementation
- `plugin-integration-tests`: Move into director-runtime capability

## Impact

- **Code**: Complete restructure of `apps/client/src/director/` directory
- **Tests**: Relocate all test files to co-located `__tests__/` folders
- **Specs**: Major reorganization of `openspec/specs/` to follow atomic structure
- **Imports**: All imports from director module will need updating
- **Dependencies**: None - this is internal reorganization only

## Inventory

**Source**: `docs/drmx2004_scripting_ref.txt` (57,648 lines)
**Inventory**: `docs/director-inventory.json`

| Category | Count | Status |
|----------|-------|--------|
| Methods | 486 | 395 to implement, 91 excluded (3D/DVD) |
| Properties | 763 | All to implement |
| **Total** | **1,249** | **1,158 to implement** |

### Excluded (Do Not Implement)
- **3D Methods**: 76 methods (addBackdrop, addCamera, meshDeform, etc.)
- **DVD Methods**: 15 methods (activateAtLoc, activateButton, etc.)
