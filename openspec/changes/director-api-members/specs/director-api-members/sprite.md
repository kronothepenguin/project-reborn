## sprite()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28039-28063

### Usage
```lingo
sprite(nameOrNum)
sprite(nameOrNum);
```

### Description
Top level function; returns a reference to a given sprite in the Score.
If the movie scriptExecutionStyle property is set to a value of 9, calling sprite("foo")
where no sprite with that name exists returns a reference to sprite 1. If the movie
scriptExecutionStyle property is set to a value of 10, calling sprite("foo") where no sprite
with that name exists returns VOID if called from Lingo or undefined if called from JavaScript.

### Parameters
nameOrNum Required. A string or integer that specifies the name or index position of the sprite.

### Example
```lingo
This statement sets the variable thisSprite to the sprite named Cave:
-- Lingo syntax
thisSprite = sprite("Cave")
// JavaScript syntax
var thisSprite = sprite("Cave");
```

### See also
Sprite Channel

### Implementation
- **File**: `apps/client/src/director/api/sprite.js`
- **Test**: `apps/client/src/director/api/__tests__/sprite.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

