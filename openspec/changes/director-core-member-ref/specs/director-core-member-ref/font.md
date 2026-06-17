## font

**Source**: `docs/drmx2004_scripting_ref.txt` lines 39382-39410

### Usage
```lingo
memberObjRef.font
memberObjRef.font;
```

### Description
Text and field cast member property; determines the font used to display the specified cast
member and requires that the cast member contain characters, if only a space. The parameter
whichCastMember can be either a cast member name or number.
The font member property can be tested and set.
To see an example of font used in a completed movie, see the Text movie in the Learning/Lingo
Examples folder inside the Director application folder.

### Parameters
None.

### Example
```lingo
This statement sets the variable named oldFont to the current font setting for the field cast
member Rokujo Speaks:
-- Lingo syntax
oldFont = member("Rokujo Speaks").font
// JavaScript syntax
var oldFont = member("Rokujo Speaks").font;
```

### See also
text, alignment, fontSize, fontStyle, lineHeight

780

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

