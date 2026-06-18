## isPastCuePoint()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19571-19635

### Usage
```lingo
spriteObjRef.isPastCuePoint(cuePointID)
spriteObjRef.isPastCuePoint(cuePointID);
```

### Description
Function; determines whether a sprite or sound channel has passed a specified cue point in its
media. This function can be used with sound (WAV, AIFF, SND, SWA, AU), QuickTime, or
Xtra files that support cue points.
Replace spriteNum or channelNum with a sprite channel or a sound channel. Shockwave Audio
(SWA) sounds can appear as sprites in sprite channels, but they play sound in a sound channel. It
is recommended that you refer to SWA sound sprites by their sprite channel number rather than
their sound channel number.
Replace cuePointID with a reference for a cue point:

• If cuePointID is an integer, isPastCuePoint returns 1 if the cue point has been passed and 0
if it hasn’t been passed.
• If cuePointID is a name, isPastCuePoint returns the number of cue points passed that have
that name.
If the value specified for cuePointID doesn’t exist in the sprite or sound, the function returns 0.
The number returned by isPastCuePoint is based on the absolute position of the sprite in its
media. For example, if a sound passes cue point Main and then loops and passes Main again,
isPastCuePoint returns 1 instead of 2.
When the result of isPastCuePoint is treated as a Boolean operator, the function returns TRUE if
any cue points identified by cuePointID have passed and FALSE if no cue points are passed.

### Parameters
cuePointID Required. A string or integer that specifies the name or number of the specified

cue point.

### Example
```lingo
This statement plays a sound until the third time the cue point Chorus End is passed:
-- Lingo syntax
if (sound(1).isPastCuePoint("Chorus End")=3) then
sound(1).stop()
end if
// JavaScript syntax
var ce = sound(1).isPastCuePoint("Chorus End");
if (ce = 3) {
sound(1).stop();
}

376

Chapter 12: Methods

The following example displays information in cast member “field 2” about the music playing in
sound channel 1. If the music is not yet past cue point “climax”, the text of “field 2” is “This is the
beginning of the piece.” Otherwise, the text reads “This is the end of the piece.”
-- Lingo syntax
if not sound(1).isPastCuePoint("climax") then
member("field 2").text = "This is the beginning of the piece."
else
member("field 2").text = "This is the end of the piece."
end if
// JavaScript syntax
var cmx = sound(1).isPastCuePoint("climax");
if (cmx != 1) {
member("field 2").text = "This is the beginning of the piece.";
} else {
member("field 2").text = "This is the end of the piece.";
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/isPastCuePoint.js`
- **Test**: `apps/client/src/director/api/__tests__/isPastCuePoint.test.js`
- **Dependencies**: Various (depends on function)

