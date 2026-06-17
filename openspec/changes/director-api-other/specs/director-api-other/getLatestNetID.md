## getLatestNetID

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17255-17290

### Usage
```lingo

```

### Description
This function returns an identifier for the last network operation that started.
The identifier returned by getLatestNetID can be used as a parameter in the netDone,
netError, and netAbort functions to identify the last network operation.
Note: This function is included for backward compatibility. It is recommended that you use the
network ID returned from a net lingo function rather than getLatestNetID. However, if you use
getLatestNetID, use it immediately after issuing the netLingo command.

### Parameters
None.

### Example
```lingo
This script assigns the network ID of a getNetText operation to the field cast member Result so
results of that operation can be accessed later:
on startOperation
global gNetID
getNetText("url")
set gNetID = getLatestNetID()
end
on checkOperation
global gNetID
if netDone(gNetID) then
put netTextResult into member "Result"
end if
end
```

### See also
netAbort, netDone(), netError()

334

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/getLatestNetID.js`
- **Test**: `apps/client/src/director/api/__tests__/getLatestNetID.test.js`
- **Dependencies**: Various (depends on function)

