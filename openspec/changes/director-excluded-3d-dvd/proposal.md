## Why

The Director MX 2004 API includes 3D and DVD methods that are out of scope for this implementation. This change documents these excluded methods for future reference, ensuring we have a complete inventory of what's not being implemented and why.

## What Changes

- Document all 3D methods (76 methods) as excluded
- Document all DVD methods (15 methods) as excluded
- Create a single spec file listing all excluded methods with reasons

## Capabilities

### New Capabilities
- `director-excluded-3d-dvd`: Documentation of excluded 3D and DVD methods

### Modified Capabilities
None

## Impact

- **Code**: No implementation (documentation only)
- **Tests**: No tests (documentation only)
- **Dependencies**: None

## Excluded Methods

### 3D Methods (76 total)
- addBackdrop, addCamera, addChild, addModifier, addOverlay
- deleteCamera, deleteGroup, deleteLight, deleteModel, etc.
- All 3D-specific methods from Director MX 2004

### DVD Methods (15 total)
- activateAtLoc, activateButton, dvdTimeCodeToMS, etc.
- All DVD-specific methods from Director MX 2004

## Reason for Exclusion

- **3D**: Requires WebGL/3D rendering engine (out of scope for 2D browser implementation)
- **DVD**: Requires DVD playback support (not applicable to browser environment)
