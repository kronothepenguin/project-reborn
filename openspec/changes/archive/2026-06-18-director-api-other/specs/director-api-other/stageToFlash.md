## stageToFlash()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28204-28251

### Usage
```lingo
spriteObjRef.stageToFlash(pointOnDirectorStage)
spriteObjRef.stageToFlash(pointOnDirectorStage);
```

### Description
Function; returns the coordinate in a Flash movie sprite that corresponds to a specified coordinate
on the Director Stage. The function both accepts the Director Stage coordinate and returns the
Flash movie coordinate as Director point values: for example, point (300,300).

548

Chapter 12: Methods

Flash movie coordinates are measured in Flash movie pixels, which are determined by the original
size of the movie when it was created in Flash. Point (0,0) of a Flash movie is always at its upper
left corner. (The cast member’s originPoint property is not used to calculate movie coordinates;
it is used only for rotation and scaling.)
The stageToFlash() function and the corresponding flashToStage() function are helpful for
determining which Flash movie coordinate is directly over a Director Stage coordinate. For both
Flash and Director, point (0,0) is the upper left corner of the Flash Stage or Director Stage. These
coordinates may not match on the Director Stage if a Flash sprite is stretched, scaled, or rotated.

### Parameters
pointOnDirectorStage Required. Specifies the point on the Director stage.

### Example
```lingo
The following handler checks to see if the mouse pointer (whose location is tracked in Director
Stage coordinates) is over a specific coordinate (130,10) in a Flash movie sprite in channel 5. If
the pointer is over that Flash movie coordinate, the script stops the Flash movie.
-- Lingo syntax
on checkFlashRollover
if sprite(5).stageToFlash(point(_mouse.mouseH,_mouse.mouseV)) =
point(130,10) then
sprite(5).stop()
end if
end
// JavaScript syntax
function checkFlashRollover() {
var stf = sprite(5).stageToFlash(point(_mouse.mouseH,_mouse.mouseV));
if (stf = point(130,10)) {
sprite(5).stop();
}
}
```

### See also
flashToStage()

### Implementation
- **File**: `apps/client/src/director/api/stageToFlash.js`
- **Test**: `apps/client/src/director/api/__tests__/stageToFlash.test.js`
- **Dependencies**: Various (depends on function)

