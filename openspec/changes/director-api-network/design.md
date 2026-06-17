## Context

The Director MX 2004 network functions provide HTTP operations for fetching and posting data. These functions must follow Director's specific network handling rules, which include asynchronous operations and transaction IDs.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 13 network functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions use browser's fetch API for HTTP operations

**Non-Goals:**
- Complex network protocols beyond HTTP
- Integration with Node.js network libraries (browser-only)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── downloadNetThing.js
├── getNetText.js
├── getStreamStatus.js
├── gotoNetMovie.js
├── gotoNetPage.js
├── netAbort.js
├── netDone.js
├── netError.js
├── netLastModDate.js
├── netMIME.js
├── netTextResult.js
├── postNetText.js
├── preloadNetThing.js
├── __tests__/
│   ├── downloadNetThing.test.js
│   ├── getNetText.test.js
│   └── ...
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Transaction ID system

**Choice**: Use a global registry for network transactions
```javascript
const _netTransactions = new Map();
let _nextNetId = 1;

function createTransaction() {
  const id = _nextNetId++;
  _netTransactions.set(id, {
    status: 'pending',
    result: null,
    error: null,
    lastModDate: null,
    mime: null
  });
  return id;
}
```

**Rationale**: Director's network functions return transaction IDs that can be used to check status and retrieve results. We need a registry to track these.

### Decision 3: Async operations

**Choice**: Use browser's fetch API with Promises
```javascript
export function getNetText(url) {
  const id = createTransaction();
  fetch(url)
    .then(response => {
      const trans = _netTransactions.get(id);
      trans.status = 'done';
      trans.mime = response.headers.get('content-type');
      trans.lastModDate = response.headers.get('last-modified');
      return response.text();
    })
    .then(text => {
      _netTransactions.get(id).result = text;
    })
    .catch(error => {
      const trans = _netTransactions.get(id);
      trans.status = 'error';
      trans.error = error.message;
    });
  return id;
}
```

**Rationale**: Director's network functions are asynchronous. We use fetch() for HTTP operations and track status via transaction IDs.

### Decision 4: Status checking

**Choice**: Implement netDone() to check transaction status
```javascript
export function netDone(netId) {
  const trans = _netTransactions.get(netId);
  return trans && trans.status === 'done';
}
```

**Rationale**: Director's netDone() returns true when a network operation is complete.

### Decision 5: Error handling

**Choice**: Implement netError() to return error messages
```javascript
export function netError(netId) {
  const trans = _netTransactions.get(netId);
  if (!trans) return "Invalid transaction ID";
  if (trans.status === 'error') return trans.error;
  return "OK";
}
```

**Rationale**: Director's netError() returns error messages or "OK" if no error.

### Decision 6: Result retrieval

**Choice**: Implement netTextResult() to return text results
```javascript
export function netTextResult(netId) {
  const trans = _netTransactions.get(netId);
  return trans ? trans.result : null;
}
```

**Rationale**: Director's netTextResult() returns the text result of a network operation.

### Decision 7: Navigation functions

**Choice**: Use window.location for navigation
```javascript
export function gotoNetPage(url) {
  window.location.href = url;
}

export function gotoNetMovie(url) {
  window.location.href = url;
}
```

**Rationale**: Director's gotoNetPage() and gotoNetMovie() navigate to URLs. In browser, we use window.location.

### Decision 8: Abort functionality

**Choice**: Use AbortController for cancellation
```javascript
const _abortControllers = new Map();

export function getNetText(url) {
  const id = createTransaction();
  const controller = new AbortController();
  _abortControllers.set(id, controller);
  
  fetch(url, { signal: controller.signal })
    // ...
}

export function netAbort(netId) {
  const controller = _abortControllers.get(netId);
  if (controller) {
    controller.abort();
    _abortControllers.delete(netId);
  }
}
```

**Rationale**: Director's netAbort() cancels network operations. We use AbortController for this.

### Decision 9: Export strategy

**Choice**: Each file exports a single named function
```javascript
// getNetText.js
export function getNetText(url) {
  // ...
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Network operations may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Browser fetch API may not support all Director features
→ **Mitigation**: Implement what's possible, document limitations

**Risk**: Transaction ID management may have race conditions
→ **Mitigation**: Use Map for thread-safe operations

**Trade-off**: One file per function vs. grouping in network.js
→ **Acceptable**: Atomic structure is more important than file count for this project
