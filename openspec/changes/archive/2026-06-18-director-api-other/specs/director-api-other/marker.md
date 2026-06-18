## marker()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20302-20349

### Usage
```lingo
_movie.marker(markerNameOrNum)
_movie.marker(markerNameOrNum);
```

### Description
Movie method; returns the frame number of markers before or after the current frame.
This method is useful for implementing a Next or Previous button or for setting up an
animation loop.
If the parameter markerNameOrNum is an integer, it can evaluate to any positive or negative integer
or 0. For example:

• marker(2)—Returns the frame number of the second marker after the current frame.
• marker(1)—Returns the frame number of the first marker after the current frame.
• marker(0)—Returns the frame number of the current frame if the current frame is marked, or
the frame number of the previous marker if the current frame is not marked.

marker()

391

• marker(-1)—Returns the frame number of the first marker before the marker(0).
• marker(-2)—Returns the frame number of the second marker before the marker(0).
If the parameter markerNameOrNum is a string, marker() returns the frame number of the first
frame whose marker label matches the string.

### Parameters
markerNameOrNum Required. A string that specifies a marker label, or an integer that specifies a

marker number.

### Example
```lingo
The following statement sends the playhead to the beginning of the current frame if the current
frame has a marker; otherwise, it sends the playhead to the previous marker.
-- Lingo syntax
_movie.go(_movie.marker(0))
// JavaScript syntax
_movie.go(_movie.marker(0));

This statement sets the variable nextMarker equal to the next marker in the Score:
-- Lingo syntax
nextMarker = _movie.marker(1)
// JavaScript syntax
nextMarker = _movie.marker(1);
```

### See also
frame, frameLabel, go(), label(), markerList, Movie

### Implementation
- **File**: `apps/client/src/director/api/marker.js`
- **Test**: `apps/client/src/director/api/__tests__/marker.test.js`
- **Dependencies**: Various (depends on function)

