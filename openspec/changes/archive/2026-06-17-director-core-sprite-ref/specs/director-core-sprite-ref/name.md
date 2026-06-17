## name (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 44407-44436

### Usage
```lingo
spriteObjRef.name
spriteObjRef.name;
```

### Description
Sprite property; identifies the name of a sprite. Read/write during a Score recording session only.
Unlike sprite display properties such as backColor and blend, a sprite name cannot be a scripted
sprite. This means that the name can only be set during a Score recording session—between calls
to the Movie object’s beginRecording() and endRecording() methods. You can only set the
name if beginRecording() is called on or before a frame in the Score that contains the sprite.
Note: Starting a Score recording session using beginRecording() resets the properties of all scripted
sprites and sprite channels.

If you use script to create a new sprite during a Score recording session and you use
updateFrame() to apply the sprite data to the session, you cannot set the sprite’s name until you
go back to the frame in which the sprite was created. Use a method such as go() to go back to a
specific frame.

### Parameters
None.

### Example
```lingo
This statement sets the name of sprite 5 to Background Sound:
-- Lingo syntax
sprite(5).name = "Background Sound"
// JavaScript syntax
sprite(5).name = "Background Sound";
```

### See also
beginRecording(), endRecording(), go(), Sprite, updateFrame()

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

