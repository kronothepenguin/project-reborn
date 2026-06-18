## abort

**Source**: `docs/drmx2004_scripting_ref.txt` lines 11737-11766

### Usage
```lingo
abort
abort();
```

### Description
Command; tells Lingo to exit the current handler and any handler that called it without
executing any of the remaining statements in the handler. This differs from the exit keyword,
which returns to the handler from which the current handler was called.
The abort command does not quit Director.

### Parameters
None.

### Example
```lingo
This statement instructs Lingo to exit the handler and any handler that called it when the amount
of free memory is less than 50K:
-- Lingo syntax
if the freeBytes < 50*1024 then abort
// JavaScript syntax
if (_player.freeBytes < 50*1024) {
abort()
}
```

### See also
exit, halt(), quit()

227

### Implementation
- **File**: `apps/client/src/director/api/abort.js`
- **Test**: `apps/client/src/director/api/__tests__/abort.test.js`
- **Dependencies**: director-core-movie-ref

