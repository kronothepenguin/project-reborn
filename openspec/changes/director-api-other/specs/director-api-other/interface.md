## interface()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19360-19380

### Usage
```lingo

```

### Description
Function; returns a Return-delimited string that describes the Xtra and lists its methods. This
function replaces the now obsolete mMessageList function.

### Parameters
None.

### Example
```lingo
This statement displays the output from the function used in the QuickTime Asset Xtra in the
Message window:
put Xtra("QuickTimeSupport").interface()

interface()

371
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/interface.js`
- **Test**: `apps/client/src/director/api/__tests__/interface.test.js`
- **Dependencies**: Various (depends on function)

