## preLoadBuffer()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24058-24091

### Usage
```lingo
memberObjRef.preLoadBuffer()
memberObjRef.preLoadBuffer();
```

### Description
Command; preloads part of a specified Shockwave Audio (SWA) file into memory. The amount
preloaded is determined by the preLoadTime property. This command works only if the SWA
cast member is stopped.
When the preLoadBuffer command succeeds, the state member property equals 2.
Most SWA cast member properties can be tested only after the preLoadBuffer command has
completed successfully. These properties include: cuePointNames, cuePointTimes,
currentTime, duration, percentPlayed, percentStreamed, bitRate, sampleRate,
and numChannels.

### Parameters
None.

preLoadBuffer()

467

### Example
```lingo
This statement loads the cast member Mel Torme into memory:
-- Lingo syntax
member("Mel Torme").preLoadBuffer()
// JavaScript syntax
member("Mel Torme").preLoadBuffer();
```

### See also
preLoadTime

### Implementation
- **File**: `apps/client/src/director/api/preLoadBuffer.js`
- **Test**: `apps/client/src/director/api/__tests__/preLoadBuffer.test.js`
- **Dependencies**: Various (depends on function)

