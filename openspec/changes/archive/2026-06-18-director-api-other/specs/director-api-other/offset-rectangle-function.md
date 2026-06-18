## offset() (rectangle function)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22502-22529

### Usage
```lingo

```

### Description
Function; yields a rectangle that is offset from the rectangle specified by rectangle.

### Parameters
horizontalChange Required. Specifies the horizontal offset, in pixels. When
horizontalChange is greater than 0, the offset is toward the right of the Stage; when
horizontalChange is less than 0, the offset is toward the left of the Stage.
verticalChange Required. Specifies the vertical offset, in pixels. When verticalChange is
greater than 0, the offset is toward the top of the Stage; when verticalChange is less than 0, the
offset is toward the bottom of the Stage.

### Example
```lingo
This handler moves sprite 1 five pixels to the right and five pixels down:
-- Lingo syntax
on diagonalMove
newRect=sprite(1).rect.offset(5, 5)
sprite(1).rect=newRect
end
// JavaScript syntax
function diagonalMove() {
newRect = sprite(1).rect.offset(5,5);
sprite(1).rect = newRect;
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/offset-rectangle-function.js`
- **Test**: `apps/client/src/director/api/__tests__/offset-rectangle-function.test.js`
- **Dependencies**: Various (depends on function)

