## 1. Setup

- [x] 1.1 Create `apps/client/src/director/syntax/` directory
- [x] 1.2 Create `apps/client/src/director/syntax/__tests__/` directory

## 2. The Proxy Implementation

- [x] 2.1 Implement `the` proxy in `syntax/the-proxy.js`
- [x] 2.2 Implement `the.frame` property
- [x] 2.3 Implement `the.mouseH` property
- [x] 2.4 Implement `the.mouseV` property
- [x] 2.5 Implement `the.stage` property
- [x] 2.6 Implement `the.keyCode` property
- [x] 2.7 Implement `the.time` property
- [x] 2.8 Implement remaining `the.*` properties (~40 total)
- [x] 2.9 Implement read-only enforcement

## 3. Tests

- [x] 3.1 Write tests for `the.frame` in `syntax/__tests__/the-proxy.test.js`
- [x] 3.2 Write tests for `the.mouseH` and `the.mouseV`
- [x] 3.3 Write tests for `the.stage`
- [x] 3.4 Write tests for `the.keyCode`
- [x] 3.5 Write tests for `the.time`
- [x] 3.6 Write tests for remaining properties
- [x] 3.7 Write tests for read-only enforcement

## 4. Export and Integration

- [x] 4.1 Export `the` proxy from `syntax/index.js`
- [x] 4.2 Verify `the` is accessible via `import { the } from "../../director/syntax"`
- [x] 4.3 Run all tests to ensure implementation matches Director MX 2004 behavior
