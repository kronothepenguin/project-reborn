## flashToStage()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16339-16383

### Usage
```lingo
spriteObjRef.flashToStage(pointInFlashMovie)
spriteObjRef.flashToStage(pointInFlashMovie);
```

### Description
Function; returns the coordinate on the Director Stage that corresponds to a specified coordinate
in a Flash movie sprite. The function accepts both the Flash channel and movie coordinate and
returns the Director Stage coordinate as Director point values: for example, point(300,300).
Flash movie coordinates are measured in Flash movie pixels, which are determined by a movie’s
original size when it was created in Flash. For the purpose of calculating Flash movie coordinates,
point(0,0) of a Flash movie is always at its upper left corner. (The cast member’s originPoint
property is used only for rotation and scaling, not to calculate movie coordinates.)
The flashToStage and the corresponding stageToFlash functions are helpful for determining
which Flash movie coordinate is directly over a Director Stage coordinate. For both Flash and
Director, point(0,0) is the upper left corner of the Flash Stage or Director Stage. These
coordinates may not match on the Director Stage if a Flash sprite is stretched, scaled, or rotated.

### Parameters
pointInFlashMovie Required. The point in the Flash movie sprite whose coordinates

are returned.

### Example
```lingo
This handler accepts a point value and a sprite reference as a parameter, and it then sets the
upper left coordinate of the specified sprite to the specified point within a Flash movie sprite in
channel 10:
-- Lingo syntax
on snapSprite(whichFlashPoint, whichSprite)
sprite(whichSprite).loc = sprite(1).FlashToStage(whichFlashPoint)
_movie.updatestage()
end
// JavaScript syntax
function snapSprite(whichFlashPoint, whichSprite) {
sprite(whichSprite).loc = sprite(1).FlashToStage(whichFlashPoint);
_movie.updateStage();
}
```

### See also
stageToFlash()

316

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/flashToStage.js`
- **Test**: `apps/client/src/director/api/__tests__/flashToStage.test.js`
- **Dependencies**: Various (depends on function)

