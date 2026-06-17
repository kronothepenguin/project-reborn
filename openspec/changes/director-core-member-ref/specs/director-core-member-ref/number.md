## number (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 44869-44917

### Usage
```lingo
memberObjRef.number
memberObjRef.number;
```

### Description
Member property; indicates the cast library number of a specified cast member. Read-only.
The value of this property is a unique identifier for the cast member that is a single integer
describing its location in and position in the cast library.

### Parameters
None.

### Example
```lingo
This statement assigns the cast number of the cast member Power Switch to the variable
whichCastMember:
-- Lingo syntax
whichCastMember = member("Power Switch").number

number (Member)

895

// JavaScript syntax
var whichCastMember = member("Power Switch").number;

This statement assigns the cast member Red Balloon to sprite 1:
-- Lingo syntax
sprite(1).member = member("Red Balloon").number
// JavaScript syntax
sprite(1).member = member("Red Balloon").number;

This verifies that a cast member actually exists before trying to switch the cast member in
the sprite:
-- Lingo syntax
property spriteNum
on mouseUp me
if (member("Mike’s face").number > 0) then
sprite(spriteNum).member = "Mike’s face"
end if
end
// JavaScript syntax
function mouseUp() {
if (member("Mike’s face").number > 0) {
sprite(this.spriteNum).member = "Mike’s face"
}
}
```

### See also
castLib(), Member

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

