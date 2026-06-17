## trace()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29063-29088

### Usage
```lingo
trace(value)
trace(value);
```

### Description
Top level function; evaluates an expression and displays the result in the Message window.
The functionality of this method is identical to the top level put() method, which is also
available to both Lingo and JavaScript syntax.
This method can be used as a debugging tool by tracking the values of variables as a movie plays.

### Parameters
value Required. The expression to evaluate.

### Example
```lingo
The following statement outputs the value of the variable counter to the Message window.
-- Lingo syntax
counter = (_system.milliseconds / 1000)
trace(counter)
// JavaScript syntax
var counter = (_system.milliseconds / 1000);
trace(counter);
```

### See also
put()

### Implementation
- **File**: `apps/client/src/director/api/trace.js`
- **Test**: `apps/client/src/director/api/__tests__/trace.test.js`
- **Dependencies**: Various (depends on function)

