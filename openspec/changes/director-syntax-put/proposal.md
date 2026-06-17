## Why

The Director `put` statement provides ways to insert text into containers. The current implementation in `syntax.js` is incomplete and needs to be split into atomic files with full documentation. This change implements the complete put statement helpers with all functionality documented in Director MX 2004.

## What Changes

- Implement put helpers in `apps/client/src/director/syntax/` directory
- Each helper gets its own file: `put-into.js`, `put-before.js`, `put-after.js`
- Create co-located tests in `apps/client/src/director/syntax/__tests__/`
- Each helper gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-syntax-put`: Complete put statement helper implementations

### Modified Capabilities
None

## Impact

- **Code**: 3 new files in `apps/client/src/director/syntax/`
- **Tests**: 3 new test files in `apps/client/src/director/syntax/__tests__/`
- **Dependencies**: Chunk helpers (char, item, line, word)

## Helpers to Implement

| Helper | Description |
|--------|-------------|
| putInto | Insert text into container (replace) |
| putBefore | Insert text before chunk |
| putAfter | Insert text after chunk |
