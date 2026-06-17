## 1. Control Function Implementations

- [ ] 1.1 Implement `abort()` function in `apps/client/src/director/api/abort.js` per `specs/director-api-control/abort.md`
- [ ] 1.2 Implement `go()` function in `apps/client/src/director/api/go.js` per `specs/director-api-control/go.md`
- [ ] 1.3 Implement `halt()` function in `apps/client/src/director/api/halt.js` per `specs/director-api-control/halt.md`
- [ ] 1.4 Implement `quit()` function in `apps/client/src/director/api/quit.js` per `specs/director-api-control/quit.md`
- [ ] 1.5 Implement `stopEvent()` function in `apps/client/src/director/api/stopEvent.js` per `specs/director-api-control/stopEvent.md`

## 2. Control Function Tests

- [ ] 2.1 Write tests for `abort()` in `apps/client/src/director/api/__tests__/abort.test.js`
- [ ] 2.2 Write tests for `go()` in `apps/client/src/director/api/__tests__/go.test.js`
- [ ] 2.3 Write tests for `halt()` in `apps/client/src/director/api/__tests__/halt.test.js`
- [ ] 2.4 Write tests for `quit()` in `apps/client/src/director/api/__tests__/quit.test.js`
- [ ] 2.5 Write tests for `stopEvent()` in `apps/client/src/director/api/__tests__/stopEvent.test.js`

## 3. Export and Integration

- [ ] 3.1 Export all control functions from `apps/client/src/director/api/index.js`
- [ ] 3.2 Verify all control functions are accessible via `import { abort, go, halt, quit, stopEvent } from "../../director/api"`
- [ ] 3.3 Run all tests to ensure implementation matches Director MX 2004 behavior
