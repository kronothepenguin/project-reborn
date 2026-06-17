## resume()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26278-26293

### Usage
```lingo
animGifSpriteRef.resume()
animGifSpriteRef.resume();
```

### Description
Animated GIF method; causes the sprite to resume playing from the frame after the current frame
if it’s been paused. This command has no effect if the animated GIF sprite has not been paused.

### Parameters
None.

### Example
```lingo

```

### See also
rewind() (Animated GIF, Flash)

### Implementation
- **File**: `apps/client/src/director/api/resume.js`
- **Test**: `apps/client/src/director/api/__tests__/resume.test.js`
- **Dependencies**: Various (depends on function)

