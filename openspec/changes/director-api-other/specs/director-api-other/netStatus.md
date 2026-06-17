## netStatus

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21530-21551

### Usage
```lingo

```

### Description
Command; displays the specified string in the status area of the browser window.
The netStatus command doesn’t work in projectors.

### Parameters
msgString Required. Specifies the string to display.

### Example
```lingo
This statement would place the string “This is a test” in the status area of the browser the movie
is running in:
-- Lingo syntax
on exitFrame
netStatus "This is a test"
end
// JavaScript syntax
function exitFrame() {
_movie.netStatus("This is a test");
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/netStatus.js`
- **Test**: `apps/client/src/director/api/__tests__/netStatus.test.js`
- **Dependencies**: Various (depends on function)

