## findLabel()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16215-16229

### Usage
```lingo
spriteObjRef.findLabel(whichLabelName)
spriteObjRef.findLabel(whichLabelName);
```

### Description
Function: this function returns the frame number (within the Flash movie) that is associated with
the label name requested.
A 0 is returned if the label doesn’t exist, or if that portion of the Flash movie has not yet been
streamed in.

### Parameters
whichLabelName Required. Specifies the frame label to find.

### Example
```lingo

```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/findLabel.js`
- **Test**: `apps/client/src/director/api/__tests__/findLabel.test.js`
- **Dependencies**: Various (depends on function)

