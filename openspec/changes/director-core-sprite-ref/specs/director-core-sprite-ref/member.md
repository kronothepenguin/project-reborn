## member (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 43001-43073

### Usage
```lingo
spriteObjRef.member
spriteObjRef.member;
```

### Description
Sprite property; specifies a sprite’s cast member and cast library. Read/write.
The member Sprite property differs from the spriteNum Sprite property, which specifies only the
sprite’s number to identify its location in the cast library but doesn’t specify the cast library itself.
The member property also differs from the Mouse object’s mouseMember property, which does not
specify a sprite’s cast library.
When assigning a sprite’s member property, use one of the following formats:

• Specify the full cast member and cast library description (spriteObjRef.member =
member(intMemberNum {, castLibraryNameOrNum})).

• Specify the cast member name (spriteObjRef.member = member("stringMemberName").
• Specify the unique integer that includes all cast libraries and corresponds to the mouseMember
property (spriteObjRef.member = 132) .
If you use only the cast member name, Director finds the first cast member that has that name in
all current cast libraries. If the name is duplicated in two cast libraries, only the first name is used.
To specify a cast member by number when there are multiple casts, use the memberNum Sprite
property, which changes the member’s position in its cast library without affecting the sprite’s cast
library (spriteObjRef.memberNum = 10).
The cast member assigned to a sprite channel is only one of that sprite’s properties; other
properties vary by the type of media element in that channel in the Score. For example, if you
replace a bitmap with an unfilled shape by setting the member Sprite property, the shape sprite’s
lineSize property doesn’t automatically change, and you probably won’t see the shape.
Similar sprite property mismatches can occur if you change the member of a field sprite to a
video. It’s generally more useful and predictable to replace cast members with similar cast
members. For example, replace bitmap sprites with bitmap cast members.

### Parameters
None.

### Example
```lingo
This statement assigns cast member 3 of cast number 4 to sprite 15:
-- Lingo syntax
sprite(15).member = member(3, 4)

member (Sprite)

855

// JavaScript syntax
sprite(15).member = member(3, 4);

856

Chapter 14: Properties

The following handler uses the mouseMember function with the sprite.member property to find if
the mouse is over a particular sprite:
-- Lingo syntax
on exitFrame
mm = _mouse.mouseMember
target = sprite(1).member
if (target = mm) then
put("Above the hotspot.")
_movie.go(_movie.frame)
end if
end
// JavaScript syntax
function exitFrame() {
var mm = _mouse.mouseMember;
var target = sprite(1).member;
if (target = mm) {
put("Above the hotspot.");
_movie.go(_movie.frame);
}
}
```

### See also
lineSize, mouseMember, Sprite, spriteNum

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

