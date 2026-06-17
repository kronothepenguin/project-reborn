## playFile()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23383-23425

### Usage
```lingo
soundChannelObjRef.playFile(stringFilePath)
soundChannelObjRef.playFile(stringFilePath);
```

### Description
Sound Channel method; plays the AIFF, SWA, AU, or WAV sound in a sound channel.
For the sound to be played properly, the correct MIX Xtra must be available to the movie, usually
in the Xtras folder of the application.
When the sound file is in a different folder than the movie, stringFilePath must specify the full
path to the file.
To play sounds obtained from a URL, it’s usually a good idea to use downloadNetThing() or
preloadNetThing() to download the file to a local disk first. This approach can minimize
problems that may occur while the file is downloading.
The playFile() method streams files from disk rather than playing them from RAM. As
a result, using playFile() when playing digital video or when loading cast members into
memory can cause conflicts when the computer tries to read the disk in two places at once.

### Parameters
stringFilePath Required. A string that specifies the name of the file to play. When the sound
file is in a different folder than the currently playing movie, stringFilePath must also specify
the full path to the file.

### Example
```lingo
This statement plays the file named Thunder in channel 1:
-- Lingo syntax
sound(1).playFile("Thunder.wav")
// JavaScript syntax
sound(1).playFile("Thunder.wav");

This statement plays the file named Thunder in channel 3:
-- Lingo syntax
sound(3).playFile(_movie.path & "Thunder.wav")
// JavaScript syntax
sound(3).playFile(_movie.path + "Thunder.wav");
```

### See also
play() (Sound Channel), Sound Channel, stop() (Sound Channel)

playFile()

453

### Implementation
- **File**: `apps/client/src/director/api/playFile.js`
- **Test**: `apps/client/src/director/api/__tests__/playFile.test.js`
- **Dependencies**: Various (depends on function)

