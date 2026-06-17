## REMOVED Requirements

### Requirement: All tests SHALL verify Director MX 2004 reference compliance

**Reason**: Plugin integration tests are now part of the director-runtime capability, with tests co-located in `runtime/__tests__/`.

**Migration**: See `director-runtime` capability for:
- Custom element tests in `runtime/__tests__/custom-elements.test.js`
- Canvas tests in `runtime/__tests__/canvas.test.js`
- Cast loading tests in `runtime/__tests__/cast-loader.test.js`
- Script lifecycle tests in `runtime/__tests__/script-lifecycle.test.js`

### Requirement: Custom element lifecycle SHALL be tested

**Reason**: Moved to director-runtime capability.

**Migration**: See `director-runtime` capability for custom element implementation and tests.

### Requirement: setCanvas SHALL update canvas reference

**Reason**: Moved to director-runtime capability.

**Migration**: See `director-runtime` capability for setCanvas implementation and tests.
