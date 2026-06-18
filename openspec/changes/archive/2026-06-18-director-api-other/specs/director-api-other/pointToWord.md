## pointToWord()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23834-23876

### Usage
```lingo
spriteObjRef.pointToWord(pointToTranslate)
spriteObjRef.pointToWord(pointToTranslate);
```

### Description
Function; returns an integer representing the number of a word located within the text or field
sprite at a specified screen coordinate, or returns -1 if the point is not within the text. Words are
separated by spaces in a block of text.
This function can be used to determine the word under the cursor.

### Parameters
pointToTranslate Required. Specifies the screen coordinate to test.

### Example
```lingo
These statements display the number of the word being clicked, as well as the text of the word, in
the Message window:
-- Lingo syntax
property spriteNum
on mouseDown me
pointClicked = _mouse.mouseLoc
currentMember = sprite(spriteNum).member
wordNum = sprite(spriteNum).pointToWord(pointClicked)
wordText = currentMember.word[wordNum]
put("Clicked word" && wordNum & ", the text" && wordText)
end
// JavaScript syntax
function mouseDown(me) {
var pointClicked = _mouse.mouseLoc;
var currentMember = sprite(this.spriteNum).member;
var wordNum = sprite(this.spriteNum).pointToWord(pointClicked);
var wordText = currentMember.getProp("word", wordNum);
trace("Clicked word " + wordNum + ", the text " + wordText);
}
```

### See also
itemDelimiter, mouseLoc, pointToChar(), pointToItem(), pointToLine(),
pointToParagraph()

pointToWord()

463

### Implementation
- **File**: `apps/client/src/director/api/pointToWord.js`
- **Test**: `apps/client/src/director/api/__tests__/pointToWord.test.js`
- **Dependencies**: Various (depends on function)

