## zoomBox

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30332-30369

### Usage
```lingo
zoomBox startSprite, endSprite {,delayTicks}
zoomBox(startSprite, endSprite {,delayTicks}); // not yet documented
```

### Description
Command; creates a zooming effect, like the expanding windows in the Macintosh Finder. The
zoom effect starts at a bounding rectangle of a specified starting sprite and finishes at the
bounding rectangle of a specified ending sprite. The zoomBox command uses the following logic
when executing:
1 Look for endSprite in the current frame: otherwise,
2 Look for endSprite in the next frame.

Note, however, that the zoomBox command does not work for endSprite if it is in the same
channel as startSprite.

### Parameters
startSprite Required. Specifies the starting sprite.
endSprite Required. Specifies the ending sprite.
delayTicks Optional. Specifies the delay in ticks between each movement of the zoom
rectangles. If delayTicks is not specified, the delay is 1.

### Example
```lingo
This statement creates a zoom effect between sprites 7 and 3:
-- Lingo syntax
zoomBox 7, 3
// JavaScript syntax
zoomBox(7, 3); // not yet documented

zoomBox

593

594

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/zoomBox.js`
- **Test**: `apps/client/src/director/api/__tests__/zoomBox.test.js`
- **Dependencies**: Various (depends on function)

