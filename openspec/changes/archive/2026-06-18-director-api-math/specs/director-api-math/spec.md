## ADDED Requirements

### Requirement: Math functions SHALL be implemented in api/ directory

The Director MX 2004 math functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/abs.js`
- `apps/client/src/director/api/atan.js`
- `apps/client/src/director/api/cos.js`
- `apps/client/src/director/api/log.js`
- `apps/client/src/director/api/max.js`
- `apps/client/src/director/api/min.js`
- `apps/client/src/director/api/power.js`
- `apps/client/src/director/api/random.js`
- `apps/client/src/director/api/sin.js`
- `apps/client/src/director/api/sqrt.js`
- `apps/client/src/director/api/tan.js`

**Tests**:
- `apps/client/src/director/api/__tests__/abs.test.js`
- `apps/client/src/director/api/__tests__/atan.test.js`
- `apps/client/src/director/api/__tests__/cos.test.js`
- `apps/client/src/director/api/__tests__/log.test.js`
- `apps/client/src/director/api/__tests__/max.test.js`
- `apps/client/src/director/api/__tests__/min.test.js`
- `apps/client/src/director/api/__tests__/power.test.js`
- `apps/client/src/director/api/__tests__/random.test.js`
- `apps/client/src/director/api/__tests__/sin.test.js`
- `apps/client/src/director/api/__tests__/sqrt.test.js`
- `apps/client/src/director/api/__tests__/tan.test.js`

#### Scenario: Math functions are importable
- **WHEN** code imports `import { abs, sqrt, max } from "../../director/api"`
- **THEN** all math functions are available

#### Scenario: Math functions are pure
- **WHEN** math functions are called multiple times with same arguments
- **THEN** they return the same result without side effects

### Requirement: abs() SHALL return absolute value

The `abs()` function SHALL return the absolute value of a number.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 11767-11797

#### Scenario: abs returns absolute value for negative numbers
- **WHEN** `abs(-42)` is called
- **THEN** returns `42`

#### Scenario: abs returns same value for positive numbers
- **WHEN** `abs(42)` is called
- **THEN** returns `42`

#### Scenario: abs handles zero
- **WHEN** `abs(0)` is called
- **THEN** returns `0`

#### Scenario: abs handles floats
- **WHEN** `abs(-3.14)` is called
- **THEN** returns `3.14`

### Requirement: atan() SHALL return arctangent

The `atan()` function SHALL return the arctangent of a number in radians.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 12353-12395

#### Scenario: atan returns arctangent
- **WHEN** `atan(1)` is called
- **THEN** returns approximately `0.7854` (π/4)

#### Scenario: atan handles zero
- **WHEN** `atan(0)` is called
- **THEN** returns `0`

### Requirement: cos() SHALL return cosine

The `cos()` function SHALL return the cosine of an angle in radians.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 14038-14056

#### Scenario: cos returns cosine
- **WHEN** `cos(0)` is called
- **THEN** returns `1`

#### Scenario: cos handles π/2
- **WHEN** `cos(Math.PI / 2)` is called
- **THEN** returns approximately `0`

### Requirement: log() SHALL return natural logarithm

The `log()` function SHALL return the natural logarithm (base e) of a number.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 20080-20100

#### Scenario: log returns natural log
- **WHEN** `log(Math.E)` is called
- **THEN** returns approximately `1`

#### Scenario: log handles 1
- **WHEN** `log(1)` is called
- **THEN** returns `0`

### Requirement: max() SHALL return maximum value

The `max()` function SHALL return the maximum of two values or all values in a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 20350-20387

#### Scenario: max returns larger of two values
- **WHEN** `max(5, 10)` is called
- **THEN** returns `10`

#### Scenario: max handles negative numbers
- **WHEN** `max(-5, -10)` is called
- **THEN** returns `-5`

#### Scenario: max with list returns maximum
- **WHEN** `max(list(3, 7, 2, 9))` is called
- **THEN** returns `9`

### Requirement: min() SHALL return minimum value

The `min()` function SHALL return the minimum of two values or all values in a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 20636-20662

#### Scenario: min returns smaller of two values
- **WHEN** `min(5, 10)` is called
- **THEN** returns `5`

#### Scenario: min handles negative numbers
- **WHEN** `min(-5, -10)` is called
- **THEN** returns `-10`

#### Scenario: min with list returns minimum
- **WHEN** `min(list(3, 7, 2, 9))` is called
- **THEN** returns `2`

### Requirement: power() SHALL return exponentiation

The `power()` function SHALL return base raised to the exponent power.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 23944-23957

#### Scenario: power returns exponentiation
- **WHEN** `power(2, 8)` is called
- **THEN** returns `256`

#### Scenario: power handles zero exponent
- **WHEN** `power(5, 0)` is called
- **THEN** returns `1`

#### Scenario: power handles fractional exponent
- **WHEN** `power(9, 0.5)` is called
- **THEN** returns `3`

### Requirement: random() SHALL return random number in range

The `random()` function SHALL return a random integer from 1 to maxValue (inclusive).

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 25301-25358

#### Scenario: random returns number in range
- **WHEN** `random(10)` is called
- **THEN** returns integer between 1 and 10 (inclusive)

#### Scenario: random with 1 returns 1
- **WHEN** `random(1)` is called
- **THEN** returns `1`

### Requirement: sin() SHALL return sine

The `sin()` function SHALL return the sine of an angle in radians.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 27963-27984

#### Scenario: sin returns sine
- **WHEN** `sin(0)` is called
- **THEN** returns `0`

#### Scenario: sin handles π/2
- **WHEN** `sin(Math.PI / 2)` is called
- **THEN** returns approximately `1`

### Requirement: sqrt() SHALL return square root

The `sqrt()` function SHALL return the square root of a non-negative number.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28096-28124

#### Scenario: sqrt returns square root
- **WHEN** `sqrt(16)` is called
- **THEN** returns `4`

#### Scenario: sqrt handles zero
- **WHEN** `sqrt(0)` is called
- **THEN** returns `0`

#### Scenario: sqrt handles perfect squares
- **WHEN** `sqrt(25)` is called
- **THEN** returns `5`

### Requirement: tan() SHALL return tangent

The `tan()` function SHALL return the tangent of an angle in radians.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28752-28770

#### Scenario: tan returns tangent
- **WHEN** `tan(0)` is called
- **THEN** returns `0`

#### Scenario: tan handles π/4
- **WHEN** `tan(Math.PI / 4)` is called
- **THEN** returns approximately `1`

### Requirement: All math functions SHALL match Director MX 2004 exactly

Each math function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `abs.md` - Absolute value
- `atan.md` - Arctangent
- `cos.md` - Cosine
- `log.md` - Natural logarithm
- `max.md` - Maximum value
- `min.md` - Minimum value
- `power.md` - Exponentiation
- `random.md` - Random number
- `sin.md` - Sine
- `sqrt.md` - Square root
- `tan.md` - Tangent

#### Scenario: All functions implemented
- **WHEN** any math function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
