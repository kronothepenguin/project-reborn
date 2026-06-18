## HMStoFrames()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18415-18481

### Usage
```lingo

```

### Description
Function; converts movies measured in hours, minutes, and seconds to the equivalent number of
frames or converts a number of hours, minutes, and seconds into time if you set the tempo
argument to 1 (1 frame = 1 second).

### Parameters
hms Required. A string expression that specifies the time in the form sHH:MM:SS.FFD, where:
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

Indicates a fraction of a second if fractionalSeconds is TRUE or frames if
fractionalSeconds is FALSE.

D

A d is used if dropFrame is TRUE, or a space if dropFrame is FALSE.

tempo Required. Specifies the tempo in frames per second.

HMStoFrames()

357

dropFrame Required. Logical expression that determines whether the frame is a drop frame
(TRUE) or not (FALSE). If the string hms ends in a d, the time is treated as a drop frame, regardless
of the value of dropFrame.
fractionalSeconds Required. Logical expression that determines the meaning of the numbers

after the seconds; they can be either fractional seconds rounded to the nearest hundredth of a
second (TRUE) or the number of residual frames (FALSE).

### Example
```lingo
This statement determines the number of frames in a 1-minute, 30.1-second movie when the
tempo is 30 frames per second. Neither the dropFrame nor fractionalSeconds arguments
is used.
put HMStoFrames(" 00:01:30.10 ", 30, FALSE, FALSE)
-- 2710

This statement converts 600 seconds into minutes:
>> put framesToHMS(600, 1,0,0)
>> -- " 00:10:00.00 "

This statement converts an hour and a half into seconds:
>> put HMStoFrames("1:30:00", 1,0,0)
>> -- 5400
```

### See also
framesToHMS()

### Implementation
- **File**: `apps/client/src/director/api/HMStoFrames.js`
- **Test**: `apps/client/src/director/api/__tests__/HMStoFrames.test.js`
- **Dependencies**: Various (depends on function)

