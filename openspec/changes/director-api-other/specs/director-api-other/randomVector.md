## randomVector()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25359-25393

### Usage
```lingo
randomVector()
randomVector();
```

### Description
Top level function; returns a unit vector describing a randomly chosen point on the surface of a
unit sphere.
This function differs from vector(random(10)/10.0, random(10)/10.0, random(10)/
10.0,) in that the resulting vector using randomVector() is guaranteed to be a unit vector.
A unit vector always has a length of one.

### Parameters
None.

490

Chapter 12: Methods

### Example
```lingo
These statements create and display two randomly defined unit vectors in the Message window:
-- Lingo syntax
vec1 = randomVector()
vec2 = randomVector()
put(vec1 & RETURN & vec2)
// JavaScript syntax
var vec1 = randomVector();
var vec2 = randomVector();
put(vec1 + "\n" + vec2);
```

### See also
vector()

### Implementation
- **File**: `apps/client/src/director/api/randomVector.js`
- **Test**: `apps/client/src/director/api/__tests__/randomVector.test.js`
- **Dependencies**: Various (depends on function)

