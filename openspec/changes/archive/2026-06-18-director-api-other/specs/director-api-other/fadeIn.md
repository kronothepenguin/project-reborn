## fadeIn()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16033-16065

### Usage
```lingo
soundChannelObjRef.fadeIn({intMilliseconds})
soundChannelObjRef.fadeIn({intMilliseconds});
```

### Description
Sound Channel method; immediately sets the volume of a sound channel to zero and then brings
it back to the current volume over a given number of milliseconds.
The current pan setting is retained for the entire fade.

### Parameters
intMilliseconds Optional. An integer that specifies the number of milliseconds over which the
volume is increased back to its original value. The default is 1000 milliseconds (1 second) if no
value is given.

fadeIn()

309

### Example
```lingo
This Lingo fades in sound channel 3 over a period of 3 seconds from the beginning of cast
member introMusic2:
-- Lingo syntax
sound(3).play(member("introMusic2"))
sound(3).fadeIn(3000)
// JavaScript syntax
sound(3).play(member("introMusic2"));
sound(3).fadeIn(3000);
```

### See also
fadeOut(), fadeTo(), pan, Sound Channel, volume (Windows Media)

### Implementation
- **File**: `apps/client/src/director/api/fadeIn.js`
- **Test**: `apps/client/src/director/api/__tests__/fadeIn.test.js`
- **Dependencies**: Various (depends on function)

