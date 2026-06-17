## forget() (Timeout)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16512-16534

### Usage
```lingo

```

### Description
This timeout object function removes a timeout object from the timeoutList, and prevents it
from sending further timeout events.

### Parameters
None.

forget() (Timeout)

319

### Example
```lingo
This statement deletes the timeout object named AlarmClock from the timeoutList:
timeout("AlarmClock").forget()
```

### See also
timeout(), timeoutHandler, timeoutList, new()

### Implementation
- **File**: `apps/client/src/director/api/forget-Timeout.js`
- **Test**: `apps/client/src/director/api/__tests__/forget-Timeout.test.js`
- **Dependencies**: Various (depends on function)

