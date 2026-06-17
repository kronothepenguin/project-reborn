## locToCharPos()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20024-20053

### Usage
```lingo
memberObjRef.locToCharPos(location)
memberObjRef.locToCharPos(location);
locToCharPos()
385
```

### Description
Function; returns a number that identifies which character in a specified field cast member is
closest to a point within the field.
The value 1 corresponds to the first character in the string, the value 2 corresponds to the second
character in the string, and so on.

### Parameters
location Required. A point within the field cast member. The value for location is a point
relative to the upper left corner of the field cast member.

### Example
```lingo
The following statement determines which character is closest to the point 100 pixels to the right
and 100 pixels below the upper left corner of the field cast member Today’s News. The statement
then assigns the result to the variable PageDesign.
--Lingo syntax
pageDesign = member("Today's News").locToCharPos(point(100, 100))
// JavaScript syntax
var pageDesign = member("Today's News").locToCharPos(point(100, 100));
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/locToCharPos.js`
- **Test**: `apps/client/src/director/api/__tests__/locToCharPos.test.js`
- **Dependencies**: Various (depends on function)

