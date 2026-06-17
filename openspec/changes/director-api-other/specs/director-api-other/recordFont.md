## recordFont

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25702-25755

### Usage
```lingo

```

### Description
Command; embeds a TrueType or Type 1 font as a cast member. Once embedded, these fonts are
available to the author just like other fonts installed in the system.
You must create an empty font cast member with the new() command before using recordFont.
The command creates a Shock Font in whichCastMember using the font named in the font
parameter. The value returned from the command reports whether the operation was successful.
Zero indicates success.

### Parameters
font Required. Specifies the name of original font to be recorded.

recordFont

497

face Optional. Specifies a list of symbols indicating the face of the original font. Possible values
are #plain, #bold, #italic. If you do not provide a value for this parameter, #plain is used.
bitmapSizes Optional. Specifies a list of integers specifying the sizes for which bitmaps are to be
recorded. This parameter can be empty. If you omit this parameter, no bitmaps are generated.
These bitmaps typically look better at smaller point sizes (below 14 points) but take up
more memory.
characterSubset Optional. Specifies a string of characters to be encoded. Only the specified
characters will be available in the font. If this parameter is omitted, all characters are encoded. If
only certain characters are encoded but an unencoded character is used, that character is displayed
as an empty box.
userFontName Optional. Specifies a string to use as the name of the newly recorded font

cast member.

### Example
```lingo
This statement creates a simple Shock Font using only the two arguments for the cast member
and the font to record:
myNewFontMember = new(#font)
recordFont(myNewFontMember, "Lunar Lander")

This statement specifies the bitmap sizes to be generated and the characters for which the font
data should be created:
myNewFontMember = new(#font)
recordfont(mynewmember,"lunar lander",
High \ Score First Last Name")

[],

[14, 18, 45], "Lunar Lander Game

Note: Since recordFont resynthesizes the font data rather than using it directly, there are no legal
restrictions on Shock Font distribution.
```

### See also
newMember()

### Implementation
- **File**: `apps/client/src/director/api/recordFont.js`
- **Test**: `apps/client/src/director/api/__tests__/recordFont.test.js`
- **Dependencies**: Various (depends on function)

