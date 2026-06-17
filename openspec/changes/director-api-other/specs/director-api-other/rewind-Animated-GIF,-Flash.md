## rewind() (Animated GIF, Flash)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26390-26434

### Usage
```lingo
animGifSpriteRef.rewind()
animGifSpriteRef.rewind();
```

### Description
Command; returns a Flash or animated GIF movie sprite to frame 1 when the sprite is stopped or
when it is playing.

### Parameters
None.

rewind() (Animated GIF, Flash)

511

### Example
```lingo
The following frame script checks whether the Flash movie sprite in the sprite the behavior was
placed in is playing and, if so, continues to loop in the current frame. When the movie is finished,
the sprite rewinds the movie (so the first frame of the movie appears on the Stage) and lets the
playhead continue to the next frame.
-- Lingo syntax
property spriteNum
on exitFrame
if sprite(spriteNum).playing then
_movie.go(_movie.frame)
else
sprite(spriteNum).rewind()
_movie.updatestage()
end if
end
// JavaScript syntax
function exitFrame() {
var plg = sprite(this.spriteNum).playing;
if (plg = 1) {
_movie.go(_movie.frame);
} else {
sprite(this.spriteNum).rewind();
_movie.updatestage();
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/rewind-Animated-GIF,-Flash.js`
- **Test**: `apps/client/src/director/api/__tests__/rewind-Animated-GIF,-Flash.test.js`
- **Dependencies**: Various (depends on function)

