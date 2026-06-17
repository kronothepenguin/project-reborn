## type (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52957-53053

### Usage
```lingo
memberObjRef.type
memberObjRef.type;
```

### Description
Member property; indicates a cast member’s type. Read-only.
The type property can be one of the following values:
#animgif

#ole

#bitmap

#palette

#button

#picture

#cursor

#QuickTimeMedia

#digitalVideo

#realMedia

#DVD

#script

#empty

#shape

#field

#shockwave3D

#filmLoop

#sound

#flash

#swa

#flashcomponent

#text

#font

#transition

#havok

#vectorShape

#movie

#windowsMedia

This list includes those types of cast members that are available in Director and the Xtra
extensions that come with it. You can also define custom cast member types for custom
cast members.
For movies created in Director 5 and 6, the type property returns #field for field cast members
and #richText for text cast members. However, field cast members originally created in Director
4 return #text for the member type, providing backward compatibility for movies that were
created in Director 4.

### Parameters
None.

### Example
```lingo
The following handler checks whether the cast member Today’s News is a field cast member and
displays an alert if it is not:
-- Lingo syntax
on checkFormat
if (member("Today’s News").type <> #field) then
_player.alert("Sorry, this cast member must be a field.")
end if
end

1064

Chapter 14: Properties

// JavaScript syntax
function checkFormat() {
if (member("Today’s News").type != "field") {
_player.alert("Sorry, this cast member must be a field.");
}
}
```

### See also
Member

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

