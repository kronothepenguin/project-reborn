## getError() (Flash, SWA)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16876-16992

### Usage
```lingo
memberObjRef.getError()
memberObjRef.getError();
```

### Description
Function; for Shockwave Audio (SWA) or Flash cast members, indicates whether an error
occurred as the cast member streamed into memory and returns a value.
Shockwave Audio cast members have the following possible getError() integer values and
corresponding getErrorString() messages:
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

Flash movie cast members have the following possible getError values:

• FALSE—No error occurred.
• #memory—There is not enough memory to load the cast member.
• #fileNotFound—The file containing the cast member’s assets could not be found.
• #network—A network error prevented the cast member from loading.
• #fileFormat—The file was found, but it appears to be of the wrong type, or an error occurred
while reading the file.

• #other—Some other error occurred.
When an error occurs as a cast member streams into memory, Director sets the cast member’s
state property to -1. Use the getError function to determine what type of error occurred.

getError() (Flash, SWA)

327

### Parameters
None.

### Example
```lingo
This handler uses getError to determine whether an error involving the Shockwave Audio cast
member Norma Desmond Speaks occurred and displays the appropriate error string in a field if
it did:
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

The following handler checks to see whether an error occurred for a Flash cast member named
Dali, which was streaming into memory. If an error occurred, and it was a memory error, the
script uses the unloadCast command to try to free some memory; it then branches the playhead
to a frame in the Director movie named Artists, where the Flash movie sprite first appears, so
Director can again try to load and play the Flash movie. If something other than an out-ofmemory error occurred, the script goes to a frame named Sorry, which explains that the requested
Flash movie can’t be played.
-- Lingo syntax
on CheckFlashStatus
errorCheck = member("Dali").getError()
if errorCheck <> 0 then
if errorCheck = #memory then
member("Dali").clearError()
unloadCast()
_movie.go("Artists")
else
_movie.go("Sorry")
end if
end if
end

328

Chapter 12: Methods

// JavaScript syntax
function CheckFlashStatus() {
var errorCheck = member("Dali").getError();
if (errorCheck != 0) {
if (errorCheck = "memory") {
member("Dali").clearError();
unloadCast();
_movie.go("Artists");
} else {
_movie.go("Sorry");
}
}
}
```

### See also
clearError(), getErrorString(), state (Flash, SWA)

### Implementation
- **File**: `apps/client/src/director/api/getError-Flash,-SWA.js`
- **Test**: `apps/client/src/director/api/__tests__/getError-Flash,-SWA.test.js`
- **Dependencies**: Various (depends on function)

