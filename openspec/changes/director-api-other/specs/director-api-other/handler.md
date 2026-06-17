## handler()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18291-18308

### Usage
```lingo

```

### Description
This function returns TRUE if the given scriptObject contains a specified handler, and FALSE if
it does not. The script object must be a parent script, a child object, or a behavior.

### Parameters
symHandler Required. Specifies the name of the handler.

### Example
```lingo
This Lingo code invokes a handler on an object only if that handler exists:
if spiderObject.handler(#pounce) = TRUE then
spiderObject.pounce()
end if
```

### See also
handlers(), new(), rawNew(), script()

### Implementation
- **File**: `apps/client/src/director/api/handler.js`
- **Test**: `apps/client/src/director/api/__tests__/handler.test.js`
- **Dependencies**: Various (depends on function)

