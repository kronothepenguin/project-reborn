## puppetPalette()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24560-24607

### Usage
```lingo
_movie.puppetPalette(palette {, speed} {, frames})
_movie.puppetPalette(palette {, speed} {, frames});
```

### Description
Movie method; causes the palette channel to act as a puppet and lets script override the palette
setting in the palette channel of the Score and assign palettes to the movie.
The puppetPalette() method sets the current palette to the palette cast member specified by
palette. If palette evaluates to a string, it specifies the cast library name of the palette. If
palette evaluates to an integer, it specifies the member number of the palette.
For best results, use the puppetPalette() method before navigating to the frame on which the
effect will occur so that Director can map to the desired palette before drawing the next frame.
You can fade in the palette by replacing speed with an integer from 1 (slowest) to 60 (fastest). You
can also fade in the palette over several frames by replacing frames with an integer for the
number of frames.
A puppet palette remains in effect until you turn it off using the syntax
_movie.puppetPalette(0). No subsequent palette changes in the Score are obeyed when the
puppet palette is in effect.
Note: The browser controls the palette for the entire Web page. Thus, Shockwave Player always
uses the browser’s palette.

### Parameters
palette Required. A string or integer that specifies the name or number of the new palette.
speed Optional. An integer that specifies the speed of a fade. Valid values range from 1 to 60.
frames Optional. An integer that specifies the number of frames over which a fade takes place.

### Example
```lingo
This statement makes Rainbow the movie’s palette:
-- Lingo syntax
_movie.puppetPalette("Rainbow")
// JavaScript syntax
_movie.puppetPalette("Rainbow");

The following statement makes Grayscale the movie’s palette. The transition to the Grayscale
palette occurs over a time setting of 15, and over 20 frames.
-- Lingo syntax
_movie.puppetPalette("Rainbow", 15, 20)
// JavaScript syntax
_movie.puppetPalette("Rainbow", 15, 20);
```

### See also
Movie

478

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/puppetPalette.js`
- **Test**: `apps/client/src/director/api/__tests__/puppetPalette.test.js`
- **Dependencies**: Various (depends on function)

