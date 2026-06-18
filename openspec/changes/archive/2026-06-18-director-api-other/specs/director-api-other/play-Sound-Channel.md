## play() (Sound Channel)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23251-23348

### Usage
```lingo
soundChannelObjRef.play()
soundChannelObjRef.play(memberObjRef)
soundChannelObjRef.play(propList)
soundChannelObjRef.play();
soundChannelObjRef.play(memberObjRef);
soundChannelObjRef.play(propList);
```

### Description
Sound Channel method; begins playing any sounds queued in a sound channel, or queues and
begins playing a given cast member.
Sound cast members take some time to load into RAM before they can begin playback. It’s
recommended that you queue sounds with queue() before you want to begin playing them and
then use the first form of this method. The second two forms do not take advantage of the preloading accomplished with the queue() command.
By using an optional property list, you can specify exact playback settings for a sound.
To see an example of play() used in a completed movie, see the Sound Control movie in the
Learning/Lingo folder inside the Director application folder.

### Parameters
memberObjRef Required if playing a specific cast member. A reference to the cast member object
to queue and play.
propList Required if specifying playback settings for a sound. A property list that specifies the

exact playback settings for the sound. These properties may be optionally set:

450

Property

### Example
```lingo
This statement plays cast member introMusic in sound channel 1:
-- Lingo syntax
sound(1).play(member("introMusic"))
// JavaScript syntax
sound(1).play(member("introMusic"));

The following statement plays cast member creditsMusic in sound channel 2. Playback begins 4
seconds into the sound and ends 15 seconds into the sound. The section from 10.5 seconds to 14
seconds loops 6 times.
-- Lingo syntax
sound(2).play([#member:member("creditsMusic"), #startTime:4000, \
#endTime:15000, #loopCount:6, #loopStartTime:10500, #loopEndTime:14000])
// JavaScript syntax
sound(2).play(propList("member",member("creditsMusic"), "startTime",4000,
"endTime",15000, "loopCount",6, "loopStartTime",10500,
"loopEndTime",14000));
```

### See also
endTime, loopCount, loopEndTime, loopStartTime, pause() (Sound Channel),
preLoadTime, queue(), Sound Channel, startTime, stop() (Sound Channel)

play() (Sound Channel)

451

### Implementation
- **File**: `apps/client/src/director/api/play-Sound-Channel.js`
- **Test**: `apps/client/src/director/api/__tests__/play-Sound-Channel.test.js`
- **Dependencies**: Various (depends on function)

