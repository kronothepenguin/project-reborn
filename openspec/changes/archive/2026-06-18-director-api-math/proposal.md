## Why

The Director MX 2004 API includes mathematical functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all math functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement 11 math functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `abs.js`, `atan.js`, `cos.js`, `log.js`, `max.js`, `min.js`, `power.js`, `random.js`, `sin.js`, `sqrt.js`, `tan.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-math`: Complete math function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 11 new files in `apps/client/src/director/api/`
- **Tests**: 11 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: None (pure functions, no dependencies on core classes)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| abs() | 11767-11797 | Absolute value |
| atan() | 12353-12395 | Arctangent |
| cos() | 14038-14056 | Cosine |
| log() | 20080-20100 | Natural logarithm |
| max() | 20350-20387 | Maximum value |
| min | 20636-20662 | Minimum value |
| power() | 23944-23957 | Exponentiation |
| random() | 25301-25358 | Random number |
| sin() | 27963-27984 | Sine |
| sqrt() | 28096-28124 | Square root |
| tan() | 28752-28770 | Tangent |
