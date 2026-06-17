## framesToHMS()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16535-16590

### Usage
```lingo

```

### Description
Function; converts the specified number of frames to their equivalent length in hours, minutes,
and seconds. This function is useful for predicting the actual playtime of a movie or controlling a
video playback device.
The resulting string uses the form sHH:MM:SS.FFD, where:
s

A character is used if the time is less than zero, or a space if the time is greater than or equal
to zero.

HH

Hours.

MM

Minutes.

SS

Seconds.

FF

Indicates a fraction of a second if fractionalSeconds is TRUE or frames if fractionalSeconds
is FALSE.

D

A "d" is used if dropFrame is TRUE, or a space if dropFrame is FALSE.

### Parameters
frames Required. An integer expression that specifies the number of frames.
tempo Required. An integer expression that specifies the tempo in frames per second.
dropFrame Required. Compensates for the color NTSC frame rate, which is not exactly 30
frames per second and is meaningful only if FPS is set to 30 frames per second. Normally, this
parameter is set to FALSE.
fractionalSeconds Required. Determines whether the residual frames are converted to the
nearest hundredth of a second (TRUE) or returned as an integer number of frames (FALSE).

### Example
```lingo
The following statement converts a 2710-frame, 30 frame-per-second movie. The dropFrame and
fractionalSeconds arguments are both turned off:
put framesToHMS(2710, 30, FALSE, FALSE)
-- " 00:01:30.10 "
```

### See also
HMStoFrames()

320

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/framesToHMS.js`
- **Test**: `apps/client/src/director/api/__tests__/framesToHMS.test.js`
- **Dependencies**: Various (depends on function)

