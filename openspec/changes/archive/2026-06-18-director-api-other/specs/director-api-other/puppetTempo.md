## puppetTempo()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24662-24700

### Usage
```lingo
_movie.puppetTempo(intTempo)
_movie.puppetTempo(intTempo);
```

### Description
Movie method; causes the tempo channel to act as a puppet and sets the tempo to a specified
number of frames.
When the tempo channel is a puppet, script can override the tempo setting in the Score and
change the tempo assigned to the movie.
It’s unnecessary to turn off the puppet tempo condition to make subsequent tempo changes in the
Score take effect.
Note: Although it is theoretically possible to achieve frame rates up to 30,000 frames per second
(fps) with the puppetTempo() method, you could do this only with little animation and a very powerful
machine.

### Parameters
intTempo Required. An integer that specifies the tempo.

### Example
```lingo
This statement sets the movie’s tempo to 30 fps:
-- Lingo syntax
_movie.puppetTempo(30)
// JavaScript syntax
_movie.puppetTempo(30);

This statement increases the movie’s old tempo by 10 fps:
-- Lingo syntax
_movie.puppetTempo(oldTempo + 10)
// JavaScript syntax
_movie.puppetTempo(oldTempo + 10);
```

### See also
Movie

480

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/puppetTempo.js`
- **Test**: `apps/client/src/director/api/__tests__/puppetTempo.test.js`
- **Dependencies**: Various (depends on function)

