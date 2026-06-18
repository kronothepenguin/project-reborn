## map()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20208-20240

### Usage
```lingo

```

### Description
Function; positions and sizes a rectangle or point based on the relationship of a source rectangle
to a target rectangle.
The relationship of the targetRect to the sourceRect governs the relationship of the result of
the function to the destinationRect.

### Parameters
targetRect Required. The target rectangle in the relationship.
targetPoint Required. The target point in the relationship.
sourceRect Required. The source rectangle in the relationship.
destinationRect Required. The destination rectangle.

map()

389

### Example
```lingo
In this behavior, all of the sprites have already been set to draggable. Sprite 2b contains a small
bitmap. Sprite 1s is a rectangular shape sprite large enough to easily contain sprite 2b. Sprite 4b is
a larger version of the bitmap in sprite 2b. Sprite 3s is a larger version of the shape in sprite 1s.
Moving sprite 2b or sprite 1s will cause sprite 4b to move. When you drag sprite 2b, its
movements are mirrored by sprite 4b. When you drag sprite 1s, sprite 4b moves in the opposite
direction. Resizing sprite 2b or sprite 1s will also produce interesting results.
on exitFrame
sprite(4b).rect = map(sprite(2b).rect, sprite(1s).rect, sprite(3s).rect)
go the frame
end
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/map.js`
- **Test**: `apps/client/src/director/api/__tests__/map.test.js`
- **Dependencies**: Various (depends on function)

