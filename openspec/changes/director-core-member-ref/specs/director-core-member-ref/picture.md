## picture (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 46189-46220

### Usage
```lingo
memberObjRef.picture
memberObjRef.picture;
```

### Description
Cast member property; determines which image is associated with a bitmap, text, or PICT cast
member. To update changes to a cast member’s registration point or update changes to an image
after relinking it using the fileName property, use the following statement:
member(whichCastMember).picture = member(whichCastMember).picture

where you replace whichCastMember with the name or number of the affected cast member.
Because changes to cast members are stored in RAM, this property is best used during authoring.
Avoid setting it in projectors.
The property can be tested and set.

### Parameters
None.

### Example
```lingo
This statement sets the variable named pictHolder to the image in the cast member
named Sunset:
-- Lingo syntax
pictHolder = member("Sunset").picture
// JavaScript syntax
var pictHolder = member("Sunset").picture;
```

### See also
type (sprite)

922

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

