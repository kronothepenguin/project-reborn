## color()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13750-13791

### Usage
```lingo
color(intPaletteIndex)
color(intRed, intGreen, intBlue)
color(intPaletteIndex);
color(intRed, intGreen, intBlue);
```

### Description
Top level function and data type. Returns a Color data object using either RGB or 8-bit palette
index values.
The resulting color object can be applied to cast members, sprites, and the Stage where
appropriate.

268

Chapter 12: Methods

### Parameters
intPaletteIndex Required if using 8-bit palette values. An integer that specifies the 8-bit palette
value to use. Valid values range from 0 to 255. All other values are truncated.
intRed Required if using RGB values. An integer that specifies the red color component in the
current palette. Valid values range from 0 to 255. All other values are truncated.
intGreen Required if using RGB values. An integer that specifies the green color component in

the current palette. Valid values range from 0 to 255. All other values are truncated.
intBlue Required if using RGB values. An integer that specifies the blue color component in the
current palette. Valid values range from 0 to 255. All other values are truncated.

### Example
```lingo
These statements display the color of sprite 6 in the Message window, and then set the color of
sprite 6 to a new value:
-- Lingo syntax
put(sprite(6).color) -- paletteIndex(255)
sprite(6).color = color(137)
put(sprite(6).color) -- paletteIndex(137)
// JavaScript syntax
put(sprite(6).color) // paletteIndex(255);
sprite(6).color = color(137);
put(sprite(6).color) // paletteIndex(137);
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/color.js`
- **Test**: `apps/client/src/director/api/__tests__/color.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

