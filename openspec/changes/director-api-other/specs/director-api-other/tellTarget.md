## tellTarget()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28812-28872

### Usage
```lingo
spriteObjRef.tellTarget(targetName)
spriteObjRef.tellTarget(targetName);
```

### Description
Command; equivalent to the Flash beginTellTarget and endTellTarget methods. The
tellTarget() command allows the user to set a target Timeline on which subsequent sprite
commands will act. When the target is set to a Flash movie clip or a level containing a loaded
Flash movie, certain commands act on the targeted components, rather than on the main
Timeline. To switch focus back to the main Timeline, call endTellTarget().
The only valid argument for tellTarget is the target name. There is no valid argument for
endTellTarget.
The Flash sprite functions that are affected by tellTarget are stop, play, getProperty,
setProperty, gotoFrame, call(frame), and find(label). In addition, the sprite property
frame (which returns the current frame) is affected by tellTarget.

### Parameters
targetName Required. Specifies the target name.

tellTarget()

561

### Example
```lingo
This command sets the movie clip as the target:
-- Lingo syntax
sprite(1).tellTarget("\myMovieClip")
// JavaScript syntax
sprite(1).tellTarget("\myMovieClip");

This command stops the movie clip:
-- Lingo syntax
sprite(1).stop()
// JavaScript syntax
sprite(1).stop();

This command causes the movie clip to play:
-- Lingo syntax
sprite(1).play()
// JavaScript syntax
sprite(1).play();

This command switches the focus back to the main Timeline:
-- Lingo syntax
sprite(1).endTellTarget()
// JavaScript syntax
sprite(1).endTellTarget();

This command stops the main movie:
-- Lingo syntax
sprite(1).stop()
// JavaScript syntax
sprite(1).stop();

562

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/tellTarget.js`
- **Test**: `apps/client/src/director/api/__tests__/tellTarget.test.js`
- **Dependencies**: Various (depends on function)

