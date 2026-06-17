## 1. Update Existing Specs

- [x] 1.1 Update `openspec/specs/director-architecture/spec.md` with new folder structure requirements
- [x] 1.2 Add spec template convention requirement to director-architecture spec

## 2. Remove Obsolete Specs

- [x] 2.1 Delete `openspec/specs/director-api-tests/` (tests now co-located)
- [x] 2.2 Delete `openspec/specs/director-proxy-tests/` (tests now co-located)
- [x] 2.3 Delete `openspec/specs/director-constants/` (moved to director-api)
- [x] 2.4 Delete `openspec/specs/director-methods/` (split into individual files)
- [x] 2.5 Delete `openspec/specs/director-properties/` (split into class files)
- [x] 2.6 Delete `openspec/specs/plugin-integration-tests/` (moved to director-runtime)

## 3. Remove Old Implementation Files

- [x] 3.1 Delete `apps/client/src/director/api.js`
- [x] 3.2 Delete `apps/client/src/director/core.js`
- [x] 3.3 Delete `apps/client/src/director/runtime.js`
- [x] 3.4 Delete `apps/client/src/director/syntax.js`
- [x] 3.5 Delete `apps/client/src/director/__tests__/` directory (all test files)

## 4. Create New Folder Structure

- [x] 4.1 Create `apps/client/src/director/core/` directory
- [x] 4.2 Create `apps/client/src/director/core/__tests__/` directory
- [x] 4.3 Create `apps/client/src/director/api/` directory
- [x] 4.4 Create `apps/client/src/director/api/__tests__/` directory
- [x] 4.5 Create `apps/client/src/director/runtime/` directory
- [x] 4.6 Create `apps/client/src/director/runtime/__tests__/` directory
- [x] 4.7 Create `apps/client/src/director/syntax/` directory
- [x] 4.8 Create `apps/client/src/director/syntax/__tests__/` directory

## 5. Create Barrel Exports

- [x] 5.1 Create `apps/client/src/director/core/index.js` (empty, to be populated by core changes)
- [x] 5.2 Create `apps/client/src/director/api/index.js` (empty, to be populated by api changes)
- [x] 5.3 Create `apps/client/src/director/runtime/index.js` (empty, to be populated by runtime changes)
- [x] 5.4 Create `apps/client/src/director/syntax/index.js` (empty, to be populated by syntax changes)
- [x] 5.5 Update `apps/client/src/director/index.js` to export from new folders

## 6. Verify Architecture

- [x] 6.1 Verify all imports still work after restructuring
- [x] 6.2 Verify no references to old file paths remain
- [x] 6.3 Run any existing tests to ensure nothing is broken
