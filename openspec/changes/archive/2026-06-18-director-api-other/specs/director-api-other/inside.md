## inside()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19251-19268

### Usage
```lingo

```

### Description
Function; indicates whether a specified point is within a specified rectangle (TRUE) or outside the
rectangle (FALSE).

### Parameters
rectangle Required. Specifies the rect that contains the point to test.

### Example
```lingo
This statement indicates whether the point Center is within the rectangle Zone and displays the
result in the Message window:
put Center.inside(Zone)
```

### See also
map(), mouseH, mouseV, point()

### Implementation
- **File**: `apps/client/src/director/api/inside.js`
- **Test**: `apps/client/src/director/api/__tests__/inside.test.js`
- **Dependencies**: Various (depends on function)

