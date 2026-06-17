## sound (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 49624-49654

### Usage
```lingo
memberObjRef.sound
memberObjRef.sound;
```

### Description
Cast member property; controls whether a movie, digital video, or Flash movie’s sound is enabled
(TRUE, default) or disabled (FALSE). Read/write.
In Flash members, the new setting takes effect after the currently playing sound ends.
To see an example of sound used in a completed movie, see the Sound Control movie in the
Learning/Lingo Examples folder inside the Director application folder.

### Parameters
None.

### Example
```lingo
This handler accepts a member reference and toggles the member’s sound property on or off:
-- Lingo syntax
on ToggleSound(whichMember)
member(whichMember).sound = not(member(whichMember).sound)
end
// JavaScript syntax
function ToggleSound(whichMember) {
member(whichMember).sound = !(member(whichMember).sound);
}
```

### See also
Flash Movie

994

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

