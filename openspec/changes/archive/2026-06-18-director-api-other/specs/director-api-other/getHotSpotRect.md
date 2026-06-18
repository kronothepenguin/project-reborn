## getHotSpotRect()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17218-17235

### Usage
```lingo
spriteObjRef.getHotSpotRect(hotSpotID)
spriteObjRef.getHotSpotRect(hotSpotID);
```

### Description
QuickTime VR function; returns an approximate bounding rectangle for a hot spot. If the hot
spot doesn’t exist or isn’t visible on the Stage, this function returns rect(0, 0, 0, 0). If the hot spot
is partially visible, this function returns the bounding rectangle for the visible portion.

### Parameters
hotSpotID Required. Specified the hot spot from which a bounding rectangle is returned.

getHotSpotRect()

333

### Example
```lingo

```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/getHotSpotRect.js`
- **Test**: `apps/client/src/director/api/__tests__/getHotSpotRect.test.js`
- **Dependencies**: Various (depends on function)

