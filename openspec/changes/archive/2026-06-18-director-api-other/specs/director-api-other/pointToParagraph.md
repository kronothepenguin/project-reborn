## pointToParagraph()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23791-23833

### Usage
```lingo
spriteObjRef.pointToParagraph(pointToTranslate)
spriteObjRef.pointToParagraph(pointToTranslate);
```

### Description
Function; returns an integer representing the paragraph number located within the text or field
sprite at a specified at screen coordinate, or returns -1 if the point is not within the text.
Paragraphs are separated by carriage returns in a block of text.
This function can be used to determine the paragraph under the cursor.

### Parameters
pointToTranslate Required. Specifies the screen coordinate to test.

### Example
```lingo
These statements display the number of the paragraph being clicked, as well as the text of the
paragraph, in the message window:
-- Lingo syntax
property spriteNum
on mouseDown me
pointClicked = _mouse.mouseLoc
currentMember = sprite(spriteNum).member
paragraphNum = sprite(spriteNum).pointToParagraph(pointClicked)
paragraphText = currentMember.paragraph[paragraphNum]
put("Clicked paragraph" && paragraphNum & ", the text" && paragraphText)
end
// JavaScript syntax
function mouseDown() {
var pointClicked = _mouse.mouseLoc;
var currentMember = sprite(this.spriteNum).member;
var paragraphNum = sprite(this.spriteNum).pointToParagraph(pointClicked);
var paragraphText = currentMember.getProp("paragraph", paragraphNum);
trace("Clicked paragraph " + paragraphNum + ", the text " + paragraphText);
}
```

### See also
itemDelimiter, mouseLoc, pointToChar(), pointToWord(), pointToItem(),
pointToLine()

462

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/pointToParagraph.js`
- **Test**: `apps/client/src/director/api/__tests__/pointToParagraph.test.js`
- **Dependencies**: Various (depends on function)

