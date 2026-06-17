## fontSize

**Source**: `docs/drmx2004_scripting_ref.txt` lines 39411-39441

### Usage
```lingo
memberObjRef.fontSize
memberObjRef.fontSize;
```

### Description
Field cast member property; determines the size of the font used to display the specified field cast
member and requires that the cast member contain characters, if only a space. The parameter
whichCastMember can be either a cast member name or number.
This property can be tested and set. When tested, it returns the height of the first line in the field.
When set, it affects every line in the field.
To see an example of fontSize used in a completed movie, see the Text movie in the Learning/
Lingo Examples folder inside the Director application folder.

### Parameters
None.

### Example
```lingo
This statement sets the variable named oldSize to the current fontSize of member setting for
the field cast member Rokujo Speaks:
--Lingo syntax
oldSize = member("Rokujo Speaks").fontSize
// JavaScript syntax
var oldSize = member("Rokujo Speaks").fontSize;

This statement sets the third line of the text cast member myMenu to 24 points:
member("myMenu").fontSize = 12
// JavaScript syntax
member("myMenu").fontSize = 12;
```

### See also
text, alignment, font, fontStyle, lineHeight

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

