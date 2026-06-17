## pointToChar()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23664-23704

### Usage
```lingo
spriteObjRef.pointToChar(pointToTranslate)
spriteObjRef.pointToChar(pointToTranslate);
```

### Description
Function; returns an integer representing the character position located within the text or field
sprite at a specified screen coordinate, or returns -1 if the point is not within the text.
This function can be used to determine the character under the cursor.

### Parameters
pointToTranslate Required. Specifies the screen coordinate to test.

### Example
```lingo
These statements display the number of the character being clicked, as well as the letter, in the
Message window:
--Lingo syntax
property spriteNum
on mouseDown me
pointClicked = _mouse.mouseLoc
currentMember = sprite(spriteNum).member
charNum = sprite(spriteNum).pointToChar(pointClicked)
actualChar = currentMember.char[charNum]
put("Clicked character" && charNum & ", the letter" && actualChar)
end
// JavaScript syntax
function mouseDown() {
var pointClicked = _mouse.mouseLoc;
var currentMember = sprite(this.spriteNum).member;
var charNum = sprite(this.spriteNum).pointToChar(pointClicked);
var actualChar = currentMember.getProp("char", charNum);
put("Clicked character " + charNum +", the letter " + actualChar);
}
```

### See also
mouseLoc, pointToWord(), pointToItem(), pointToLine(), pointToParagraph()

pointToChar()

459

### Implementation
- **File**: `apps/client/src/director/api/pointToChar.js`
- **Test**: `apps/client/src/director/api/__tests__/pointToChar.test.js`
- **Dependencies**: Various (depends on function)

