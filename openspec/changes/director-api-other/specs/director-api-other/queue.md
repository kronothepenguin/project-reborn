## queue()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25056-25148

### Usage
```lingo
soundChannelObjRef.queue(memberObjRef)
soundChannelObjRef.queue(propList)
soundChannelObjRef.queue(memberObjRef);
soundChannelObjRef.queue(propList);
```

### Description
Sound Channel method; adds a sound cast member to the queue of a sound channel.

484

Chapter 12: Methods

Once a sound has been queued, it can be played immediately with the play() method. This is
because Director preloads a certain amount of each sound that is queued, preventing any delay
between the play() method and the start of playback. The default amount of sound that is
preloaded is 1500 milliseconds. This parameter can be modified by passing a property list
containing one or more parameters with the queue() method. These parameters can also be
passed with the setPlayList() method.
To see an example of queue() used in a completed movie, see the Sound Control movie in the
Learning/Lingo folder inside the Director application folder.

### Parameters
memberObjRef Required if specifying a sound cast member. A reference to the sound cast
member to queue.
propList Required if passing a property list as parameters. A property list that applies to the
sound cast member to queue. These properties include:
Property

### Example
```lingo
The following handler queues and plays two sounds. The first sound, cast member Chimes,
is played in its entirety. The second sound, cast member introMusic, is played starting at its
3-second point, with a loop repeated 5 times from the 8-second point to the 8.9 second point,
and stopping at the 10-second point.
-- Lingo syntax
on playMusic
sound(2).queue(member("Chimes"))
sound(2).queue([#member:member("introMusic"), #startTime:3000, \
#endTime:10000, #loopCount:5, #loopStartTime:8000, #loopEndTime:8900])
sound(2).play()
end playMusic
// JavaScript syntax
function playMusic() {
sound(2).queue(member("Chimes"))
sound(2).queue(propList("member",member("introMusic"), "startTime",3000,
"endTime",10000, "loopCount",5, "loopStartTime",8000, "loopEndTime",8900));
sound(2).play();
}

queue()

485
```

### See also
endTime, loopCount, loopEndTime, loopStartTime, pause() (Sound Channel),
play() (Sound Channel), preLoadTime, setPlayList(), Sound Channel, startTime,
stop() (Sound Channel)

### Implementation
- **File**: `apps/client/src/director/api/queue.js`
- **Test**: `apps/client/src/director/api/__tests__/queue.test.js`
- **Dependencies**: Various (depends on function)

