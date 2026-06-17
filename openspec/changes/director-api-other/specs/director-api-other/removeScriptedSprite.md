## removeScriptedSprite()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26101-26126

### Usage
```lingo
spriteChannelObjRef.removeScriptedSprite()
spriteChannelObjRef.removeScriptedSprite();
```

### Description
Sprite Channel method; switches control of a sprite channel from script back to the Score.

### Parameters
None.

### Example
```lingo
The following statement removes the scripted sprite from sprite channel 5:
-- Lingo syntax
channel(5).removeScriptedSprite()
// JavaScript syntax
channel(5).removeScriptedSprite();
```

### See also
makeScriptedSprite(), Sprite Channel

removeScriptedSprite()

505

### Implementation
- **File**: `apps/client/src/director/api/removeScriptedSprite.js`
- **Test**: `apps/client/src/director/api/__tests__/removeScriptedSprite.test.js`
- **Dependencies**: Various (depends on function)

