## unLoad() (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29208-29250

### Usage
```lingo
memberObjRef.unLoad({toMemberObjRef})
memberObjRef.unLoad({toMemberObjRef});
```

### Description
Member method; forces Director to clear the specified cast members from memory.
Director automatically unloads the least recently used cast members to accommodate preLoad()
methods or normal cast library loading.

• When used without a parameter, unLoad() clears from memory the cast members in all the
frames of a movie.
• When used with the toMemberObjRef parameter, unLoad() clears from memory all the cast
members in the range specified.
When used in a new movie with no loaded cast members, this method returns an error.
Cast members that you have modified during authoring or by setting picture,
pasteClipBoadInto(), and so on, cannot be unloaded.

### Parameters
toMemberObjRef Optional. A reference to the last cast member in the range to clear

from memory.

### Example
```lingo
This statement clears the cast member named Ships from memory:
-- Lingo syntax
member("Ships").unLoad()
// JavaScript syntax
member("Ships").unLoad();

This statement clears from memory cast members 10 through 15:
-- Lingo syntax
member(10).unLoad(15)
// JavaScript syntax
member(10).unLoad(15);
```

### See also
Member

570

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/unLoad-Member.js`
- **Test**: `apps/client/src/director/api/__tests__/unLoad-Member.test.js`
- **Dependencies**: Various (depends on function)

