## 1. Update Existing Specs

- [ ] 1.1 Update `openspec/specs/director-architecture/spec.md` with new folder structure requirements
- [ ] 1.2 Add spec template convention requirement to director-architecture spec

## 2. Remove Obsolete Specs

- [ ] 2.1 Delete `openspec/specs/director-api-tests/` (tests now co-located)
- [ ] 2.2 Delete `openspec/specs/director-proxy-tests/` (tests now co-located)
- [ ] 2.3 Delete `openspec/specs/director-constants/` (moved to director-api)
- [ ] 2.4 Delete `openspec/specs/director-methods/` (split into individual files)
- [ ] 2.5 Delete `openspec/specs/director-properties/` (split into class files)
- [ ] 2.6 Delete `openspec/specs/plugin-integration-tests/` (moved to director-runtime)

## 3. Remove Old Implementation Files

- [ ] 3.1 Delete `apps/client/src/director/api.js`
- [ ] 3.2 Delete `apps/client/src/director/core.js`
- [ ] 3.3 Delete `apps/client/src/director/runtime.js`
- [ ] 3.4 Delete `apps/client/src/director/syntax.js`
- [ ] 3.5 Delete `apps/client/src/director/__tests__/` directory (all test files)

## 4. Create New Folder Structure

- [ ] 4.1 Create `apps/client/src/director/core/` directory
- [ ] 4.2 Create `apps/client/src/director/core/__tests__/` directory
- [ ] 4.3 Create `apps/client/src/director/api/` directory
- [ ] 4.4 Create `apps/client/src/director/api/__tests__/` directory
- [ ] 4.5 Create `apps/client/src/director/runtime/` directory
- [ ] 4.6 Create `apps/client/src/director/runtime/__tests__/` directory
- [ ] 4.7 Create `apps/client/src/director/syntax/` directory
- [ ] 4.8 Create `apps/client/src/director/syntax/__tests__/` directory

## 5. Create Barrel Exports

- [ ] 5.1 Create `apps/client/src/director/core/index.js` (empty, to be populated by core changes)
- [ ] 5.2 Create `apps/client/src/director/api/index.js` (empty, to be populated by api changes)
- [ ] 5.3 Create `apps/client/src/director/runtime/index.js` (empty, to be populated by runtime changes)
- [ ] 5.4 Create `apps/client/src/director/syntax/index.js` (empty, to be populated by syntax changes)
- [ ] 5.5 Update `apps/client/src/director/index.js` to export from new folders

## 6. Verify Architecture

- [ ] 6.1 Verify all imports still work after restructuring
- [ ] 6.2 Verify no references to old file paths remain
- [ ] 6.3 Run any existing tests to ensure nothing is broken
