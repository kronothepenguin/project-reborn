## fadeTo()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16094-16124

### Usage
```lingo
soundChannelObjRef.fadeTo(intVolume {, intMilliseconds})
soundChannelObjRef.fadeTo(intVolume {, intMilliseconds});
```

### Description
Sound Channel method; gradually changes the volume of a sound channel to a specified volume
over a given number of milliseconds.
The current pan setting is retained for the entire fade.
To see an example of fadeTo() used in a completed movie, see the Sound Control movie in the
Learning/Lingo folder inside the Director application folder.

### Parameters
intVolume Required. An integer that specifies the volume level to change to. The range of values
for intVolume volume is 0 to 255.
intMilliseconds Optional. An integer that specifies the number of milliseconds over which the
volume is changed to intVolume. The default value is 1000 milliseconds (1 second) if no value
is given.

### Example
```lingo
The following statement changes the volume of sound channel 4 to 150 over a period of 2
seconds. It can be a fade up or a fade down, depending on the original volume of sound channel 4
when the fade begins.
-- Lingo syntax
sound(4).fadeTo(150, 2000)
// JavaScript syntax
sound(4).fadeTo(150, 2000);
```

### See also
fadeIn(), fadeOut(), pan, Sound Channel, volume (Windows Media)

### Implementation
- **File**: `apps/client/src/director/api/fadeTo.js`
- **Test**: `apps/client/src/director/api/__tests__/fadeTo.test.js`
- **Dependencies**: Various (depends on function)

