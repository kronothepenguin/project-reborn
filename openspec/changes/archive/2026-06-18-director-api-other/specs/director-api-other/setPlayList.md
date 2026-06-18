## setPlayList()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27455-27531

### Usage
```lingo
soundChannelObjRef.setPlayList(linearListOfPropLists)
soundChannelObjRef.setPlayList(linearListOfPropLists);
```

### Description
Sound Channel method; sets or resets the playlist of a sound channel.
This method is useful for queueing several sounds at once.
To see an example of setPlaylist() used in a completed movie, see the Sound Control movie
in the Learning/Lingo folder inside the Director application folder.

### Parameters
linearListOfPropLists Required. A linear list of property lists that specifies parameters of a
playlist. You can specify these parameters for each sound to be queued:
Property

### Example
```lingo
This handler queues and plays the cast member introMusic, starting at its 3-second point, with a
loop repeated 5 times from the 8-second point to the 8.9-second point, and stopping at the 10second point.
-- Lingo syntax
on playMusic
sound(2).queue([#member:member("introMusic"), #startTime:3000, \
#endTime:10000, #loopCount:5, #loopStartTime:8000, #loopEndTime:8900])
sound(2).play()
end playMusic
// JavaScript syntax
function playMusic() {
sound(2).queue(propList("member",member("introMusic"),
"startTime",3000, "endTime",10000, "loopCount",5, "loopStartTime",8000,
"loopEndTime",8900));
sound(2).play();
}
```

### See also
endTime, getPlayList(), loopCount, loopEndTime, loopStartTime, Member, member,
preLoadTime, queue(), Sound Channel, startTime

### Implementation
- **File**: `apps/client/src/director/api/setPlayList.js`
- **Test**: `apps/client/src/director/api/__tests__/setPlayList.test.js`
- **Dependencies**: Various (depends on function)

