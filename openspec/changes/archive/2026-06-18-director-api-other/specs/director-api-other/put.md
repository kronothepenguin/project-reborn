## put()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24990-25025

### Usage
```lingo
put(value)
put(value);
```

### Description
Top level function; evaluates an expression and displays the result in the Message window.
The functionality of this method is identical to the top level trace() method, which is available
to both Lingo and JavaScript syntax.
This method can be used as a debugging tool by tracking the values of variables as a movie plays.

### Parameters
value Required. The expression to evaluate.

### Example
```lingo
This statement displays the time in the Message window:
-- Lingo syntax
put(_system.time())
// JavaScript syntax
put(_system.time());

This statement displays the value assigned to the variable bid in the Message window:
-- Lingo syntax
bid = "Johnson"
put(bid) -- "Johnson"
// JavaScript syntax
var bid = "Johnson";
put(bid); // Johnson
```

### See also
trace()

put()

483

### Implementation
- **File**: `apps/client/src/director/api/put.js`
- **Test**: `apps/client/src/director/api/__tests__/put.test.js`
- **Dependencies**: Various (depends on function)

