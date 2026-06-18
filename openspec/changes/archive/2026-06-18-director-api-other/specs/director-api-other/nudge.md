## nudge()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22296-22341

### Usage
```lingo
spriteObjRef.nudge(#direction)
spriteObjRef.nudge(#direction);
```

### Description
QuickTime VR command; nudges the view perspective of the specified QuickTime VR sprite in
a specified direction.
Nudging to the right causes the image of the sprite to move to the left. The nudge command has
no return value.

### Parameters
direction Required. Specifies the direction to nudge the view perspective. Valid values include

the following:

• #down
• #downLeft
• #downRight
• #left
• #right
• #up
• #upLeft
• #upRight

### Example
```lingo
This handler causes the perspective of the QTVR sprite to move to the left as long as the mouse
button is held down on the sprite:
-- Lingo syntax
on mouseDown me
repeat while the stillDown
sprite(1).nudge(#left)
end repeat
end
// JavaScript syntax
function mouseDown() {
do {
sprite(1).nudge(#left);
} while _mouse.stillDown;
}

nudge()

431
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/nudge.js`
- **Test**: `apps/client/src/director/api/__tests__/nudge.test.js`
- **Dependencies**: Various (depends on function)

