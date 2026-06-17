## findEmpty()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16230-16258

### Usage
```lingo
castObjRef.findEmpty({memberObjRef})
castObjRef.findEmpty({memberObjRef});
```

### Description
Cast library method; displays the next empty cast member position or the position after a
specified cast member.
This method is available only on the current cast library.

### Parameters
memberObjRef Optional. A reference to the cast member after which the next empty cast member
position is displayed. If omitted, the next empty cast member position is displayed.

findEmpty()

313

### Example
```lingo
This statement finds the first empty cast member on or after cast member 100:
-- Lingo syntax
trace(castLib(1).findEmpty(member(100)))
// JavaScript syntax
trace(castLib(1).findEmpty(member(100)));
```

### See also
Cast Library, Member

### Implementation
- **File**: `apps/client/src/director/api/findEmpty.js`
- **Test**: `apps/client/src/director/api/__tests__/findEmpty.test.js`
- **Dependencies**: Various (depends on function)

