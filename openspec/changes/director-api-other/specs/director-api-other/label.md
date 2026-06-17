## label()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19700-19729

### Usage
```lingo
_movie.label(stringMarkerName)
_movie.label(stringMarkerName);
```

### Description
Movie method; indicates the frame associated with a marker label.
The parameter stringMarkerName should be a label in the current movie; if it’s not, this method
returns 0.

378

Chapter 12: Methods

### Parameters
stringMarkerName Required. A string that specifies the name of the marker label associated with

a frame.

### Example
```lingo
This statement sends the playhead to the tenth frame after the frame labeled Start:
-- Lingo syntax
_movie.go(_movie.label("Start") + 10)
// JavaScript syntax
_movie.go(_movie.label("Start") + 10);
```

### See also
frameLabel, go(), labelList, Movie

### Implementation
- **File**: `apps/client/src/director/api/label.js`
- **Test**: `apps/client/src/director/api/__tests__/label.test.js`
- **Dependencies**: Various (depends on function)

