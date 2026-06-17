## ptToHotSpotID()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24543-24559

### Usage
```lingo
spriteObjRef.ptToHotSpotID(point)
spriteObjRef.ptToHotSpotID(point);
```

### Description
QuickTime VR function; returns the ID of the hotspot, if any, that is at the specified point. If
there is no hotspot, the function returns 0.

### Parameters
point Required. Specifies the point to test.

ptToHotSpotID()

477

### Example
```lingo

```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/ptToHotSpotID.js`
- **Test**: `apps/client/src/director/api/__tests__/ptToHotSpotID.test.js`
- **Dependencies**: Various (depends on function)

