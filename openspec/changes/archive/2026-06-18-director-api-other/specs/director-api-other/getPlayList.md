## getPlayList()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17531-17610

### Usage
```lingo
soundChannelObjRef.getPlayList()
soundChannelObjRef.getPlayList();
```

### Description
Sound Channel method; returns a copy of the list of queued sounds for a sound channel.
The returned list does not include the currently playing sound, nor may it be edited directly. You
must use setPlayList().
The playlist is a linear list of property lists. Each property list corresponds to one queued sound
cast member. Each queued sound may specify these properties:
Property


#member

The sound cast member to queue. This property must be provided; all others are
optional.

#startTime

The time within the sound at which playback begins, in milliseconds. The default is
the beginning of the sound. See startTime.

#endTime

The time within the sound at which playback ends, in milliseconds. The default is
the end of the sound. See endTime.

#loopCount

The number of times to play a loop defined with #loopStartTime and #loopEndTime.
The default is 1. See loopCount.

#loopStartTime The time within the sound to begin a loop, in milliseconds. See loopStartTime.
#loopEndTime

The time within the sound to end a loop, in milliseconds. See loopEndTime.

#preloadTime

The amount of the sound to buffer before playback, in milliseconds. See
preloadTime.

### Parameters
None.

### Example
```lingo
The following handler queues two sounds in sound channel 2, starts playing them, and then
displays the playList in the message window. The playlist includes only the second sound queued,
because the first sound is already playing.
-- Lingo syntax
on playMusic
sound(2).queue(member("Chimes"))
sound(2).queue([#member:member("introMusic"), #startTime:3000, \
#endTime:10000, #loopCount:5, #loopStartTime:8000, #loopEndTime:8900])
put(sound(2).getPlayList())
sound(2).play()
end playMusic

340

Chapter 12: Methods

// JavaScript syntax
function playMusic() {
sound(2).queue(member("Chimes"));
sound(2).queue(propList("member",member("introMusic"), "startTime",3000,
"endTime",10000, "loopCount",5, "loopStartTime",8000, "loopEndTime",8900));
put(sound(2).getPlayList());
sound(2).play();
}
```

### See also
endTime, loopCount, loopEndTime, loopStartTime, Member, member, preLoadTime,
queue(), setPlayList(), Sound Channel, startTime

### Implementation
- **File**: `apps/client/src/director/api/getPlayList.js`
- **Test**: `apps/client/src/director/api/__tests__/getPlayList.test.js`
- **Dependencies**: Various (depends on function)

