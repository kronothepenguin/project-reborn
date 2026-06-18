## getErrorString()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17017-17082

### Usage
```lingo
memberObjRef.getErrorString()
memberObjRef.getErrorString();
```

### Description
Function; for Shockwave Audio (SWA) cast members, returns the error message string that
corresponds to the error value returned by the getError() function.

getErrorString()

329

Possible getError() integer values and corresponding getErrorString() messages are:
getError() value

getErrorString() message

0

OK

1

memory

2

network

3

playback device

99

other

### Parameters
None.

### Example
```lingo
This handler uses getError() to determine whether an error occurred for Shockwave Audio cast
member Norma Desmond Speaks, and if so, uses getErrorString to obtain the error message
and assign it to a field cast member:
-- Lingo syntax
on exitFrame
if member("Norma Desmond Speaks").getError() <> 0 then
member("Display Error Name").text = member("Norma Desmond \
Speaks").getErrorString()
end if
end
// JavaScript syntax
function exitFrame() {
var memNor = member("Norma Desmond Speaks").getError();
if (memNor != 0) {
member("Display Error Name").text =
member("Norma Desmond Speaks").getErrorString();
}
}
```

### See also
getError() (Flash, SWA)

### Implementation
- **File**: `apps/client/src/director/api/getErrorString.js`
- **Test**: `apps/client/src/director/api/__tests__/getErrorString.test.js`
- **Dependencies**: Various (depends on function)

