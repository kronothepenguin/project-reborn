## erase()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15616-15658

### Usage
```lingo
memberObjRef.erase()
memberObjRef.erase();
```

### Description
Member method; deletes a specified cast member and leaves its slot in the Cast window empty.
For best results, use this method during authoring and not in projectors. Using this method in
projectors may cause memory problems.

302

Chapter 12: Methods

### Parameters
None.

### Example
```lingo
This statement deletes the cast member named Gear in the Hardware cast:
-- Lingo syntax
member("Gear", "Hardware").erase()
// JavaScript syntax
member("Gear", "Hardware").erase();

This handler deletes cast members numbered from start through finish:
-- Lingo syntax
on deleteMember start, finish
repeat with i = start to finish
member(i).erase()
end repeat
end deleteMember
// JavaScript syntax
function deleteMember(start, finish) {
for (var i=start; i<=finish; i++) {
member(i).erase();
}
}
```

### See also
Member, new()

### Implementation
- **File**: `apps/client/src/director/api/erase.js`
- **Test**: `apps/client/src/director/api/__tests__/erase.test.js`
- **Dependencies**: Various (depends on function)

