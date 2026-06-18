## realPlayerNativeAudio()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25539-25589

### Usage
```lingo
realPlayerNativeAudio()
realPlayerNativeAudio();
```

### Description
RealMedia function; allows you to get or set the global flag that determines whether the audio
portion of the RealMedia cast member is processed by RealPlayer (TRUE) or by Director (FALSE).
This function returns the previous value of the flag.
To be effective, this flag must be set before RealPlayer is first loaded (when the first RealMedia
cast member is encountered in the Score or with the first Lingo reference to a RealMedia cast
member); any changes to this flag after RealPlayer is loaded are ignored. This flag should be
executed in a prepareMovie event handler in a movie script. This flag is set for the entire session
(from the time the Shockwave Player is launched until it is closed and relaunched), not just for
the duration of the current movie.
By default, this flag is set to FALSE and audio is processed by Director, which allows you to set the
soundChannel property and use the standard Lingo sound methods and properties to manipulate
the audio stream of a RealMedia sprite, including mixing RealAudio with other Director audio. If
this flag is set to TRUE, Lingo control of the sound channel is not processed, and the sound is
handled by RealPlayer.

### Parameters
None.

494

Chapter 12: Methods

### Example
```lingo
The following code shows that the realPlayerNativeAudio() function is set to FALSE, which
means that audio in the RealMedia cast member will be processed by Director:
-- Lingo syntax
put(realPlayerNativeAudio())
-- 0
// JavaScript syntax
trace(realPlayerNativeAudio());
// 0

The following code sets the realPlayerNativeAudio() function to TRUE, which means that
audio in the RealMedia stream will be processed by RealPlayer and all Lingo control of the sound
channel will be ignored:
-- Lingo syntax
realPlayerNativeAudio(TRUE)
// JavaScript syntax
realPlayerNativeAudio(1);
```

### See also
soundChannel (RealMedia)

### Implementation
- **File**: `apps/client/src/director/api/realPlayerNativeAudio.js`
- **Test**: `apps/client/src/director/api/__tests__/realPlayerNativeAudio.test.js`
- **Dependencies**: Various (depends on function)

