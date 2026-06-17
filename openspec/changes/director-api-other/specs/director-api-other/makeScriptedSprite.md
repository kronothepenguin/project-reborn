## makeScriptedSprite()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20151-20181

### Usage
```lingo
spriteChannelObjRef.makeScriptedSprite({memberObjRef, loc})
spriteChannelObjRef.makeScriptedSprite({memberObjRef, loc});
```

### Description
Sprite Channel method; switches control of a sprite channel from the Score to script, and
optionally places a sprite from a specified cast member at a specified location on the Stage.
Call removeScriptedSprite() to switch control of the sprite channel back to the Score.

### Parameters
memberObjRef Optional. A reference to the cast member from which a scripted sprite is created.
Providing only this parameter places the sprite in the center of the Stage.
loc Optional. A point that specifies the location on the Stage at which the scripted sprite
is placed.

### Example
```lingo
The following statement creates a scripted sprite in sprite channel 5 from the cast member named
kite, and places it at a specific point on the Stage:
-- Lingo syntax
channel(5).makeScriptedSprite(member("kite"), point(35, 70))
// JavaScript syntax
channel(5).makeScriptedSprite(member("kite"), point(35, 70));
```

### See also
removeScriptedSprite(), Sprite Channel

388

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/makeScriptedSprite.js`
- **Test**: `apps/client/src/director/api/__tests__/makeScriptedSprite.test.js`
- **Dependencies**: Various (depends on function)

