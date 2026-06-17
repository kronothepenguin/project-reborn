## 1. Setup

- [ ] 1.1 Create `apps/client/src/director/syntax/` directory
- [ ] 1.2 Create `apps/client/src/director/syntax/__tests__/` directory

## 2. The Proxy Implementation

- [ ] 2.1 Implement `the` proxy in `syntax/the-proxy.js`
- [ ] 2.2 Implement `the.frame` property
- [ ] 2.3 Implement `the.mouseH` property
- [ ] 2.4 Implement `the.mouseV` property
- [ ] 2.5 Implement `the.stage` property
- [ ] 2.6 Implement `the.keyCode` property
- [ ] 2.7 Implement `the.time` property
- [ ] 2.8 Implement remaining `the.*` properties (~40 total)
- [ ] 2.9 Implement read-only enforcement

## 3. Tests

- [ ] 3.1 Write tests for `the.frame` in `syntax/__tests__/the-proxy.test.js`
- [ ] 3.2 Write tests for `the.mouseH` and `the.mouseV`
- [ ] 3.3 Write tests for `the.stage`
- [ ] 3.4 Write tests for `the.keyCode`
- [ ] 3.5 Write tests for `the.time`
- [ ] 3.6 Write tests for remaining properties
- [ ] 3.7 Write tests for read-only enforcement

## 4. Export and Integration

- [ ] 4.1 Export `the` proxy from `syntax/index.js`
- [ ] 4.2 Verify `the` is accessible via `import { the } from "../../director/syntax"`
- [ ] 4.3 Run all tests to ensure implementation matches Director MX 2004 behavior
