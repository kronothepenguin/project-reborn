## fadeOut()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16066-16093

### Usage
```lingo
soundChannelObjRef.fadeOut({intMilliseconds})
soundChannelObjRef.fadeOut({intMilliseconds});
```

### Description
Sound Channel method; gradually reduces the volume of a sound channel to zero over a given
number of milliseconds.
The current pan setting is retained for the entire fade.

### Parameters
intMilliseconds Optional. An integer that specifies the number of milliseconds over which the
volume is reduced to zero. The default is 1000 milliseconds (1 second) if no value is given.

### Example
```lingo
This statement fades out sound channel 3 over a period of 5 seconds:
-- Lingo syntax
sound(3).fadeOut(5000)
// JavaScript syntax
sound(3).fadeOut(5000);
```

### See also
fadeIn(), fadeTo(), pan, Sound Channel, volume (Windows Media)

310

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/fadeOut.js`
- **Test**: `apps/client/src/director/api/__tests__/fadeOut.test.js`
- **Dependencies**: Various (depends on function)

