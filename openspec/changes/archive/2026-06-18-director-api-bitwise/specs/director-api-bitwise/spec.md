## ADDED Requirements

### Requirement: Bitwise functions SHALL be implemented in api/ directory

The Director MX 2004 bitwise functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/bitAnd.js`
- `apps/client/src/director/api/bitNot.js`
- `apps/client/src/director/api/bitOr.js`
- `apps/client/src/director/api/bitXor.js`

**Tests**:
- `apps/client/src/director/api/__tests__/bitAnd.test.js`
- `apps/client/src/director/api/__tests__/bitNot.test.js`
- `apps/client/src/director/api/__tests__/bitOr.test.js`
- `apps/client/src/director/api/__tests__/bitXor.test.js`

#### Scenario: Bitwise functions are importable
- **WHEN** code imports `import { bitAnd, bitOr, bitXor, bitNot } from "../../director/api"`
- **THEN** all bitwise functions are available

#### Scenario: Bitwise functions are pure
- **WHEN** bitwise functions are called multiple times with same arguments
- **THEN** they return the same result without side effects

### Requirement: bitAnd() SHALL perform bitwise AND

The `bitAnd()` function SHALL perform bitwise AND on two integers.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 12498-12539

#### Scenario: bitAnd performs AND
- **WHEN** `bitAnd(5, 3)` is called
- **THEN** returns `1` (101 & 011 = 001)

#### Scenario: bitAnd with zero
- **WHEN** `bitAnd(5, 0)` is called
- **THEN** returns `0`

### Requirement: bitNot() SHALL perform bitwise NOT

The `bitNot()` function SHALL perform bitwise NOT on an integer.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 12540-12573

#### Scenario: bitNot performs NOT
- **WHEN** `bitNot(5)` is called
- **THEN** returns `-6` (~101 = ...111010)

#### Scenario: bitNot with zero
- **WHEN** `bitNot(0)` is called
- **THEN** returns `-1`

### Requirement: bitOr() SHALL perform bitwise OR

The `bitOr()` function SHALL perform bitwise OR on two integers.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 12574-12615

#### Scenario: bitOr performs OR
- **WHEN** `bitOr(5, 3)` is called
- **THEN** returns `7` (101 | 011 = 111)

#### Scenario: bitOr with zero
- **WHEN** `bitOr(5, 0)` is called
- **THEN** returns `5`

### Requirement: bitXor() SHALL perform bitwise XOR

The `bitXor()` function SHALL perform bitwise XOR on two integers.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 12616-12657

#### Scenario: bitXor performs XOR
- **WHEN** `bitXor(5, 3)` is called
- **THEN** returns `6` (101 ^ 011 = 110)

#### Scenario: bitXor with same value
- **WHEN** `bitXor(5, 5)` is called
- **THEN** returns `0`

### Requirement: All bitwise functions SHALL match Director MX 2004 exactly

Each bitwise function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `bitAnd.md` - Bitwise AND
- `bitNot.md` - Bitwise NOT
- `bitOr.md` - Bitwise OR
- `bitXor.md` - Bitwise XOR

#### Scenario: All functions implemented
- **WHEN** any bitwise function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
