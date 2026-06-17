## duration (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 37776-37821

### Usage
```lingo
memberObjRef.duration
memberObjRef.duration;
```

### Description
Cast member property; determines the duration of the specified Shockwave Audio (SWA),
transition, Windows Media, and QuickTime cast members.

• When whichCastMember is a streaming sound file, this property indicates the duration of the
sound. The duration property returns 0 until streaming begins. Setting preLoadTime to 1
second allows the bit rate to return the actual duration.
• When whichCastMember is a digital video cast member, this property indicates the digital
video’s duration. The value is in ticks.
• When whichCastMember is a transition cast member, this property indicates the transition’s
duration. The value for the transition is in milliseconds. During playback, this setting has the
same effect as the Duration setting in the Frame Transition dialog box.
This property can be tested for all cast members that support it, but only set for transitions.
To see an example of duration used in a completed movie, see the QT and Flash movie in the
Learning/Lingo Examples folder inside the Director application folder.

746

Chapter 14: Properties

### Parameters
None.

### Example
```lingo
If the SWA cast member Louie Prima has been preloaded, this statement displays the sound’s
duration in the field cast member Duration Displayer:
-- Lingo syntax
on exitFrame
if member("Louie Prima").state = 2 then
member("Duration Displayer").text = \
string(member("Louie Prima").duration)
end if
end
// JavaScript syntax
function exitFrame() {
if (member("Louie Prima").state == 2) {
member("Duration Displayer").text =
member("Louie Prima").duration.toString()
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

