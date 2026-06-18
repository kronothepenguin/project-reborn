## pointInHyperlink()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23643-23663

### Usage
```lingo
spriteObjRef.pointInHyperlink(point)
spriteObjRef.pointInHyperlink(point);
```

### Description
Text sprite function; returns a value (TRUE or FALSE) that indicates whether the specified point is
within a hyperlink in the text sprite. Typically, the point used is the cursor position. This is useful
for setting custom cursors.

458

Chapter 12: Methods

### Parameters
point Required. Specifies the point to test.

### Example
```lingo

```

### See also
cursor(), mouseLoc

### Implementation
- **File**: `apps/client/src/director/api/pointInHyperlink.js`
- **Test**: `apps/client/src/director/api/__tests__/pointInHyperlink.test.js`
- **Dependencies**: Various (depends on function)

