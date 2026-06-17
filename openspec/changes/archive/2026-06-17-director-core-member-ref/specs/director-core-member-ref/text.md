## text

**Source**: `docs/drmx2004_scripting_ref.txt` lines 51200-51243

### Usage
```lingo
memberObjRef.text
memberObjRef.text;
```

### Description
Text cast member property; determines the character string in the field cast member specified by
whichCastMember.
The text cast member property is useful for displaying messages and recording what the
user types.
This property can be tested and set.
When you use Lingo to change the entire text of a cast member you remove any special
formatting you have applied to individual words or lines. Altering the text cast member
property reapplies global formatting. To change particular portions of the text, refer to lines,
words, or items in the text.
When the movie plays back as an applet, this property’s value is "" (an empty string) for a field
cast member whose text has not yet streamed in.
To see an example of text used in a completed movie, see the Forms and Post, and Text movies
in the Learning/Lingo Examples folder inside the Director application folder.

text 1027

### Parameters
None.

### Example
```lingo
This statement places the phrase “Thank you.” in the empty cast member Response:
--Lingo syntax
if (member("Response").text = EMPTY) then
member("Response").text = "Thank You."
end if
// JavaScript syntax
if (member("Response").text = " ") {
member("Response").text = "Thank You.";
}

This statement sets the content of cast member Notice to “You have made the right decision!”
--Lingo syntax
member("Notice").text = "You have made the right decision!"
// JavaScript syntax
member("Notice").text = "You have made the right decision!";
```

### See also
selEnd, selStart

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

