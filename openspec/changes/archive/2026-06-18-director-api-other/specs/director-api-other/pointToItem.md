## pointToItem()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23705-23747

### Usage
```lingo
spriteObjRef.pointToItem(pointToTranslate)
spriteObjRef.pointToItem(pointToTranslate);
```

### Description
Function; returns an integer representing the item position in the text or field sprite at a specified
screen coordinate, or returns -1 if the point is not within the text. Items are separated by the
itemDelimiter property, which is set to a comma by default.
This function can be used to determine the item under the cursor.

### Parameters
pointToTranslate Required. Specifies the screen coordinate to test.

### Example
```lingo
These statements display the number of the item being clicked, as well as the text of the item, in
the Message window:
--Lingo syntax
property spriteNum
on mouseDown me
pointClicked = _mouse.mouseLoc
currentMember = sprite(spriteNum).member
itemNum = sprite(spriteNum).pointToItem(pointClicked)
itemText = currentMember.item[itemNum]
put("Clicked item" && itemNum & ", the text" && itemText)
end
// JavaScript syntax
function mouseDown() {
var pointClicked = _mouse.mouseLoc;
var currentMember = sprite(this.spriteNum).member;
var itemNum = sprite(this.spriteNum).pointToItem(pointClicked);
var itemText = currentMember.getProp("item",itemNum);
trace( "Clicked item " + itemNum + ", the text " + itemText);
}
```

### See also
itemDelimiter, mouseLoc, pointToChar(), pointToWord(), pointToItem(),
pointToLine(), pointToParagraph()

460

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/pointToItem.js`
- **Test**: `apps/client/src/director/api/__tests__/pointToItem.test.js`
- **Dependencies**: Various (depends on function)

