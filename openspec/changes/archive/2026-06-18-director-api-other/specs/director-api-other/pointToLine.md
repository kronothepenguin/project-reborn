## pointToLine()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23748-23790

### Usage
```lingo
spriteObjRef.pointToLine(pointToTranslate)
spriteObjRef.pointToLine(pointToTranslate);
```

### Description
Function; returns an integer representing the line position in the text or field sprite at a specified
screen coordinate, or returns -1 if the point is not within the text. Lines are separated by carriage
returns in the text or field cast member.
This function can be used to determine the line under the cursor.

### Parameters
pointToTranslate Required. Specifies the screen coordinate to test.

### Example
```lingo
These statements display the number of the line being clicked, as well as the text of the line, in the
Message window:
-- Lingo syntax
property spriteNum
on mouseDown me
pointClicked = _mouse.mouseLoc
currentMember = sprite(spriteNum).member
lineNum = sprite(spriteNum).pointToLine(pointClicked)
lineText = currentMember.line[lineNum]
put("Clicked line" && lineNum & ", the text" && lineText)
end
// JavaScript syntax
function mouseDown() {
var pointClicked = _mouse.mouseLoc;
var currentMember = sprite(this.spriteNum).member;
var lineNum = sprite(this.spriteNum).pointToLine(pointClicked);
var lineText = currentMember.getProp("line", lineNum);
put("Clicked line " + lineNum + ", the text " + lineText);
}
```

### See also
itemDelimiter, mouseLoc, pointToChar(), pointToWord(), pointToItem(),
pointToLine(), pointToParagraph()

pointToLine()

461

### Implementation
- **File**: `apps/client/src/director/api/pointToLine.js`
- **Test**: `apps/client/src/director/api/__tests__/pointToLine.test.js`
- **Dependencies**: Various (depends on function)

