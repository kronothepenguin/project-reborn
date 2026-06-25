## ADDED Requirements

### Requirement: Excluded methods SHALL be documented

The Director MX 2004 3D and DVD methods SHALL be documented as excluded from implementation.

**Source**: `docs/director-inventory.json`

**File**: `openspec/changes/director-excluded-3d-dvd/specs/director-excluded-3d-dvd/spec.md`

#### Scenario: Documentation exists
- **WHEN** looking for excluded methods
- **THEN** documentation lists all 91 excluded methods (76 3D + 15 DVD)

### Requirement: 3D methods SHALL be listed with reasons

All 3D methods SHALL be listed with line numbers and exclusion reasons.

#### Scenario: 3D methods documented
- **WHEN** reviewing excluded methods
- **THEN** 76 3D methods are listed with line numbers and "Requires 3D rendering engine" reason

### Requirement: DVD methods SHALL be listed with reasons

All DVD methods SHALL be listed with line numbers and exclusion reasons.

#### Scenario: DVD methods documented
- **WHEN** reviewing excluded methods
- **THEN** 15 DVD methods are listed with line numbers and "Requires DVD playback support" reason

### Requirement: Excluded methods SHALL NOT be implemented

The excluded 3D and DVD methods SHALL NOT be implemented in the current scope.

#### Scenario: No implementation
- **WHEN** checking codebase
- **THEN** no 3D or DVD methods are implemented
