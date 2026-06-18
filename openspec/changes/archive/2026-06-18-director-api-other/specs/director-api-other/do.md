## do

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15190-15215

### Usage
```lingo

```

### Description
Command; evaluates a string and executes the result as a script statement. This command is
useful for evaluating expressions that the user has typed and for executing commands stored in
string variables, fields, arrays, and files.
Using uninitialized local variables within a do command creates a compile error. Initialize any
local variables in advance.
Note: This command does not allow global variables to be declared; these variables must be
declared in advance.

The do command works with multiple-line strings as well as single lines.

### Parameters
stringExpression Required. The string to be evaluated.

### Example
```lingo
This statement performs the statement contained within quotation marks:
do "beep 2"
do commandList[3]

294

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/do.js`
- **Test**: `apps/client/src/director/api/__tests__/do.test.js`
- **Dependencies**: Various (depends on function)

