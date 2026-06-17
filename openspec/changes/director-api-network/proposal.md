## Why

The Director MX 2004 API includes network functions that need to be implemented in the new atomic file structure. The current implementation in `api.js` is incomplete and may contain AI-hallucinated behavior. This change implements all network functions with full Director MX 2004 documentation, each in its own file with co-located tests.

## What Changes

- Implement network functions in `apps/client/src/director/api/` directory
- Each function gets its own file: `downloadNetThing.js`, `getNetText.js`, `getStreamStatus.js`, `gotoNetMovie.js`, `gotoNetPage.js`, `netAbort.js`, `netDone.js`, `netError.js`, `netLastModDate.js`, `netMIME.js`, `netTextResult.js`, `postNetText.js`, `preloadNetThing.js`
- Create co-located tests in `apps/client/src/director/api/__tests__/`
- Each function gets its own spec file with full documentation from the Director MX 2004 reference

## Capabilities

### New Capabilities
- `director-api-network`: Complete network function implementations with full Director MX 2004 documentation

### Modified Capabilities
None

## Impact

- **Code**: 13 new files in `apps/client/src/director/api/`
- **Tests**: 13 new test files in `apps/client/src/director/api/__tests__/`
- **Dependencies**: None (pure functions)

## Functions to Implement

| Function | Lines | Description |
|----------|-------|-------------|
| downloadNetThing | 15301-15333 | Download file from URL |
| getNetText() | 17308-17368 | Get text from URL |
| getStreamStatus() | 17817-17872 | Get stream status |
| gotoNetMovie | 18162-18195 | Navigate to movie URL |
| gotoNetPage | 18196-18239 | Navigate to page URL |
| netAbort | 21212-21240 | Abort network operation |
| netDone() | 21241-21304 | Check if network operation complete |
| netError() | 21305-21422 | Get network error |
| netLastModDate() | 21423-21465 | Get last modified date |
| netMIME() | 21466-21529 | Get MIME type |
| netTextResult() | 21552-21596 | Get text result |
| postNetText | 23877-23943 | Post text to URL |
| preloadNetThing() | 24153-24190 | Preload network resource |
