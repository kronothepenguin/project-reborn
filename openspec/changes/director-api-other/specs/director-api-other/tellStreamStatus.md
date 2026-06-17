## tellStreamStatus()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28771-28811

### Usage
```lingo

```

### Description
Function; turns the stream status handler on (TRUE) or off (FALSE).
The form tellStreamStatus() determines the status of the handler.
When the streamStatusHandler is TRUE, Internet streaming activity causes periodic calls to the
movie script, triggering streamStatusHandler. The handler is executed, with Director
automatically filling in the parameters with information regarding the progress of the downloads.

### Parameters
onOrOffBoolean Optional. Specifies the status of the handler.

560

Chapter 12: Methods

### Example
```lingo
This on prepareMovie handler turns the on streamStatus handler on when the movie starts:
-- Lingo syntax
on prepareMovie
tellStreamStatus(TRUE)
end
// JavaScript syntax
function prepareMovie() {
tellStreamStatus(TRUE);
}

This statement determines the status of the stream status handler:
-- Lingo syntax
on mouseDown
put tellStreamStatus()
end
// JavaScript syntax
function mouseDown() {
put(tellStreamStatus());
}
```

### See also
on streamStatus

### Implementation
- **File**: `apps/client/src/director/api/tellStreamStatus.js`
- **Test**: `apps/client/src/director/api/__tests__/tellStreamStatus.test.js`
- **Dependencies**: Various (depends on function)

