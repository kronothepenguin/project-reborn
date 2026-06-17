## number (Cast)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 44752-44777

### Usage
```lingo
castObjRef.number
castObjRef.number;
```

### Description
Cast library property; returns the number of a specified cast library. Read-only.

### Parameters
None.

### Example
```lingo
This repeat loop uses the Message window to display the number of cast members that are in each
of the movie’s casts:
-- Lingo syntax
repeat with n = 1 to _movie.castLib.count
put(castLib(n).name && "contains" && castLib(n).member.count \
&& "cast members.")
end repeat
// JavaScript syntax
for (var n=1; n<=_movie.castLib.count; n++) {
put(castLib(n).name + " contains " + castLib(n).member.count
+ " cast members.")
}
```

### See also
Cast Library

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

