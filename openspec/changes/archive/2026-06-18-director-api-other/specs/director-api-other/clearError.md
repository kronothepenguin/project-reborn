## clearError()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13427-13481

### Usage
```lingo
memberObjRef.clearError()
memberObjRef.clearError();
```

### Description
Flash command; resets the error state of a streaming Flash cast member to 0.
When an error occurs while a cast member is streaming into memory, Director sets the cast
member’s state property to -1 to indicate that an error occurred. When this happens, you can
use the getError function to determine what type of error occurred and then use the
clearError command to reset the cast member’s error state to 0. After you clear the member’s
error state, Director tries to open the cast member if it is needed again in the Director movie.
Setting a cast member’s pathName, linked, and preload properties also automatically clears the
error condition.

### Parameters
None.

### Example
```lingo
This handler checks to see if an out-of-memory error occurred for a Flash cast member named
Dali, which was streaming into memory. If a memory error occurred, the script uses the
unloadCast command to try to free some memory; it then branches the playhead to a frame in
the Director movie named Artists, where the Flash movie sprite first appears, so Director can
again try to play the Flash movie. If something other than an out-of-memory error occurred, the
script goes to a frame named Sorry, which explains that the requested Flash movie can’t be played.
-- Lingo syntax
on CheckFlashStatus
if (member("Dali").getError() = #memory) then
member("Dali").clearError()
member("Dali").unload()
unloadCast
else
_movie.go("Sorry")
end if
end
// JavaScript syntax
function CheckFlashStatus() {
var ge = member("Dali").getError();
if (ge = "memory") {
member("Dali").clearError();
unloadCast;
_movie.go("Artists");
} else {
_movie.go("Sorry");
}
}
```

### See also
state (Flash, SWA), getError() (Flash, SWA)

262

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/clearError.js`
- **Test**: `apps/client/src/director/api/__tests__/clearError.test.js`
- **Dependencies**: Various (depends on function)

