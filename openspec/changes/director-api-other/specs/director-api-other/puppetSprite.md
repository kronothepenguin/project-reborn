## puppetSprite()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24608-24661

### Usage
```lingo
_movie.puppetSprite(intSpriteNum, bool)
_movie.puppetSprite(intSpriteNum, bool);
```

### Description
Movie method; determines whether a sprite channel is a puppet and under script control (TRUE)
or not a puppet and under the control of the Score (FALSE).
While the playhead is in the same sprite, turning off the sprite channel’s puppetting using the
syntax puppetSprite(intSpriteNum, FALSE) resets the sprite’s properties to those in the Score.
The sprite channel’s initial properties are whatever the channel’s settings are when the
puppetSprite() method is executed. You can use script to change sprite properties as follows:

• If a sprite channel is a puppet, any changes that script makes to the channel’s sprite properties
remain in effect after the playhead exits the sprite.

• If a sprite channel is not a puppet, any changes that script makes to a sprite last for the life of
the current sprite only.
The channel must contain a sprite when you use the puppetSprite() method.
Making the sprite channel a puppet lets you control many sprite properties—such as member,
locH, and width—from script after the playhead exits the sprite.

Use the syntax puppetSprite(intSpriteNum, FALSE) to return control to the Score when you
finish controlling a sprite channel from script and to avoid unpredictable results that may occur
when the playhead is in frames that aren’t intended to be puppets.
Note: Version 6 of Director introduced autopuppetting, which made it unnecessary to explicitly
puppet a sprite under most circumstances. Explicit control is still useful if you want to retain complete
control over a channel’s contents even after a sprite span has finished playing.

### Parameters
intSpriteNum Required. An integer that specifies the sprite channel to test.
bool Required. A boolean value that specifies whether a sprite channel is under script control
(TRUE) or under the control of the Score (FALSE).

### Example
```lingo
This statement makes the sprite in channel 15 a puppet:
-- Lingo syntax
_movie.puppetSprite(15, TRUE)
// JavaScript syntax
_movie.puppetSprite(15, true);

puppetSprite()

479

This statement removes the puppet condition from the sprite in the channel numbered i + 1:
-- Lingo syntax
_movie.puppetSprite(i + 1, FALSE)
// JavaScript syntax
_movie.puppetSprite(i + 1, false);
```

### See also
makeScriptedSprite(), Movie, Sprite Channel

### Implementation
- **File**: `apps/client/src/director/api/puppetSprite.js`
- **Test**: `apps/client/src/director/api/__tests__/puppetSprite.test.js`
- **Dependencies**: Various (depends on function)

