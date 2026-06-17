## ramNeeded()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25259-25300

### Usage
```lingo
_movie.ramNeeded(intFromFrame, intToFrame)
_movie.ramNeeded(intFromFrame, intToFrame);
```

### Description
Movie method; determines the memory needed, in bytes, to display a range of frames. For
example, you can test the size of frames containing 32-bit artwork: if ramNeeded() is larger than
freeBytes(), then go to frames containing 8-bit artwork and divide by 1024 to convert bytes to
kilobytes (K).

### Parameters
intFromFrame Required. An integer that specifies the number of the first frame in the range.
intToFrame Required. An integer that specifies the number of the last frame in the range.

### Example
```lingo
This statement sets the variable frameSize to the number of bytes needed to display frames 100
to 125 of the movie:
-- Lingo syntax
frameSize = _movie.ramNeeded(100, 125)
// JavaScript syntax
var frameSize = _movie.ramNeeded(100, 125);

488

Chapter 12: Methods

This statement determines whether the memory needed to display frames 100 to 125 is more
than the available memory, and, if it is, branches to the section using cast members that have
lower color depth:
-- Lingo syntax
if (_movie.ramNeeded(100, 125) > _system.freeBytes) then
_movie.go("8-bit")
end if
// JavaScript syntax
if (_movie.ramNeeded(100, 125) > _system.freeBytes) {
_movie.go("8-bit");
}
```

### See also
freeBytes(), Movie

### Implementation
- **File**: `apps/client/src/director/api/ramNeeded.js`
- **Test**: `apps/client/src/director/api/__tests__/ramNeeded.test.js`
- **Dependencies**: Various (depends on function)

