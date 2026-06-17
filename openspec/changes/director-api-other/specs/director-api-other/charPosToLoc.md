## charPosToLoc()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13241-13265

### Usage
```lingo
memberObjRef.charPosToLoc(nthCharacter)
memberObjRef.charPosToLoc(nthCharacter);
```

### Description
Field function; returns the point in the entire field cast member (not just the part that appears on
the Stage) that is closest to a specified character. This is useful for determining the location of
individual characters.
Values for charPosToLoc are in pixels from the top left corner of the field cast member. The
nthCharacter parameter is 1 for the first character in the field, 2 for the second character, and
so on.

### Parameters
nthCharacter Required. The character to test.

### Example
```lingo
The following statement determines the point where the fiftieth character in the field cast
member Headline appears and assigns the result to the variable location:
-- Lingo syntax
location = member("Headline").charPosToLoc(50)
// JavaScript syntax
var location = member("Headline").charPosToLoc(50);
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/charPosToLoc.js`
- **Test**: `apps/client/src/director/api/__tests__/charPosToLoc.test.js`
- **Dependencies**: Various (depends on function)

