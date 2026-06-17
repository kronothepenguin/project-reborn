## ADDED Requirements

### Requirement: Remaining general functions SHALL be implemented in api/ directory

The Director MX 2004 remaining general functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Scope**: This change covers all functions in the `general` category that haven't been covered by other API changes (math, typechecks, conversions, strings, lists, members, network, bitwise, control, sound).

**Total Functions**: ~311 functions

#### Scenario: Remaining functions are importable
- **WHEN** code imports functions from `../../director/api`
- **THEN** all remaining functions are available

#### Scenario: Each function has its own file
- **WHEN** looking for a specific function
- **THEN** it exists in its own file in `apps/client/src/director/api/`

#### Scenario: Each function has co-located tests
- **WHEN** looking for tests for a specific function
- **THEN** they exist in `apps/client/src/director/api/__tests__/`

### Requirement: All remaining functions SHALL match Director MX 2004 exactly

Each remaining function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation.

**Function Categories**:
- Alert/dialog functions
- Application control functions
- Browser functions
- Cache functions
- Call functions
- Camera functions
- Recording functions
- And many more...

#### Scenario: All functions implemented
- **WHEN** any remaining function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
