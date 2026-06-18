## updateStage()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29476-29511

### Usage
```lingo
_movie.updateStage()
_movie.updateStage();
```

### Description
Movie method; redraws the Stage immediately instead of only between frames.
The updateStage() method redraws sprites, performs transitions, plays sounds, sends a
prepareFrame message (affecting movie and behavior scripts), and sends a stepFrame message
(which affects actorList).

### Parameters
None.

### Example
```lingo
This handler changes the sprite’s horizontal and vertical locations and redraws the Stage so that
the sprite appears in the new location without having to wait for the playhead to move:
-- Lingo syntax
on moveRight(whichSprite, howFar)
sprite(whichSprite).locH = sprite(whichSprite).locH + howFar
_movie.updateStage()
end moveRight
// JavaScript syntax
function moveRight(whichSprite, howFar) {
sprite(whichSprite).locH = sprite(whichSprite).locH + howFar;
_movie.updateStage();
}
```

### See also
actorList, Movie, on prepareFrame, on stepFrame

updateStage()

575

### Implementation
- **File**: `apps/client/src/director/api/updateStage.js`
- **Test**: `apps/client/src/director/api/__tests__/updateStage.test.js`
- **Dependencies**: Various (depends on function)

