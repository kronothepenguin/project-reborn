## timeout()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28943-28974

### Usage
```lingo
timeout(timeoutObjName)
timeout(timeoutObjName);
```

### Description
Top level function; returns a given timeout object.
Use the new() method to create a new timeout object and add it to the timeoutList.

### Parameters
timeoutObjName Required. A string that specifies the name of the timeout object to return.

564

Chapter 12: Methods

### Example
```lingo
This handler deletes the timeout object named Random Lightning:
-- Lingo syntax
on exitFrame
timeout("Random Lightning").forget()
end
// JavaScript syntax
function exitFrame() {
timeout("Random Lightning").forget();
}
```

### See also
new(), timeoutList, timeoutHandler, time (timeout object), name (timeout),
period, persistent, target

### Implementation
- **File**: `apps/client/src/director/api/timeout.js`
- **Test**: `apps/client/src/director/api/__tests__/timeout.test.js`
- **Dependencies**: Various (depends on function)

