## xtra()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30304-30331

### Usage
```lingo
xtra(xtraNameOrNum)
xtra(xtraNameOrNum);
```

### Description
Top level function; returns an instance of a specified Xtra.
A reference to an empty object is returned if the specified Xtra is not found.
To see an example of xtra used in a completed movie, see the Read and Write Text movie in the
Learning/Lingo folder inside the Director application folder.

592

Chapter 12: Methods

### Parameters
xtraNameOrNum Required. A string that specifies the name of the Xtra to return, or an integer
that specifies the index position of the Xtra to return. String names are not case sensitive.

### Example
```lingo
This statement sets the variable myNetLingo to the NetLingo Xtra extension:
-- Lingo syntax
myNetLingo = xtra("netlingo")
// JavaScript syntax
var myNetLingo = xtra("netlingo");
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/xtra.js`
- **Test**: `apps/client/src/director/api/__tests__/xtra.test.js`
- **Dependencies**: Various (depends on function)

