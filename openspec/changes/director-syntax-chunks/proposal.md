## Why

The Director chunk expressions (`char`, `item`, `line`, `word`) provide access to parts of strings. The current implementation in `syntax.js` is incomplete and needs to be split into atomic files with full documentation. This change implements the complete chunk expression helpers with all functionality documented in Director MX 2004.

## What Changes

- Implement chunk helpers in `apps/client/src/director/syntax/` directory
- Each helper gets its own file: `char.js`, `item.js`, `line.js`, `word.js`
- Create co-located tests in `apps/client/src/director/syntax/__tests__/`
- Each helper gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-syntax-chunks`: Complete chunk expression helper implementations

### Modified Capabilities
None

## Impact

- **Code**: 4 new files in `apps/client/src/director/syntax/`
- **Tests**: 4 new test files in `apps/client/src/director/syntax/__tests__/`
- **Dependencies**: None (pure functions)

## Helpers to Implement

| Helper | Description |
|--------|-------------|
| char | Access characters in strings |
| item | Access items in delimited strings |
| line | Access lines in strings |
| word | Access words in strings |
