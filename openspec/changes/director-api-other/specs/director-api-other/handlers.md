## handlers()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18309-18337

### Usage
```lingo

```

### Description
This function returns a linear list of the handlers in the given scriptObject. Each handler name
is presented as a symbol in the list. This function is useful for debugging movies.
You cannot get the handlers of a script cast member directly. You have to get them via the script
property of the member.

### Parameters
None.

### Example
```lingo
This statement displays the list of handlers in the child object RedCar in the Message window:
put RedCar.handlers()
-- [#accelerate, #turn, #stop]

This statement displays the list of handlers in the parent script member CarParentScript in the
Message window:
put member(“CarParentScript”).script.handlers()
-- [#accelerate, #turn, #stop]
```

### See also
handler(), script()

handlers()

355

### Implementation
- **File**: `apps/client/src/director/api/handlers.js`
- **Test**: `apps/client/src/director/api/__tests__/handlers.test.js`
- **Dependencies**: Various (depends on function)

