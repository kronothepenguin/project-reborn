## REMOVED Requirements

### Requirement: All tests SHALL verify Director MX 2004 reference compliance

**Reason**: Tests are now co-located with implementation files in `__tests__/` subfolders within each module (api/__tests__/, core/__tests__/, runtime/__tests__/, syntax/__tests__/). The centralized test organization is no longer needed.

**Migration**: Tests have been moved to co-located locations:
- `api/__tests__/abs.test.js` for `api/abs.js`
- `core/__tests__/list.test.js` for `core/list.js`
- etc.
