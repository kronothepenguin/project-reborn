## member()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20436-20482

### Usage
```lingo
member(memberNameOrNum {, castNameOrNum})
member(memberNameOrNum {, castNameOrNum});
```

### Description
Top level function; creates a reference to a cast member, and optionally specifies the cast library
that contains the member.
The member() method is a specific reference to both a cast library and a member within it if used
with both the memberNameOrNum and castNameOrNum parameters:
trace(sprite(1).member);
// (member 1 of castLib 1)

This method differs from the spriteNum property of a sprite, which is always an integer
designating position in a cast library, but does not specify the cast library:
trace(sprite(2).spriteNum);
// 2

The number of a member is also an absolute reference to a particular member in a particular cast
library:
trace(sprite(3).member.number)
// 3

### Parameters
memberNameOrNum Required. A string that specifies the name of the cast member to reference, or
an integer that specifies the index position of the cast member to reference.

394

Chapter 12: Methods

castNameOrNum Optional. A string that specifies the cast library name to which the member

belongs, or an integer that specifies the index position of the cast library to which the member
belongs. If omitted, member() searches all cast libraries until a match is found.

### Example
```lingo
This statements sets the variable memWings to the cast member named Planes, which is in the cast
library named Transportation.
-- Lingo syntax
memWings = member("Planes", "Transportation")
// JavaScript syntax
var memWings = member("Planes", "Transportation");
```

### See also
Member, Sprite, spriteNum

### Implementation
- **File**: `apps/client/src/director/api/member.js`
- **Test**: `apps/client/src/director/api/__tests__/member.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

