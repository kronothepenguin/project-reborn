## externalParamValue()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15895-16018

### Usage
```lingo
_player.externalParamValue(paramNameOrNum)
_player.externalParamValue(paramNameOrNum);
```

### Description
Returns the value of a specified parameter in the list of external parameters from an HTML
<EMBED> or <OBJECT> tag.
If specifying a parameter value by name, this method returns the value of the first parameter
whose name matches paramNameOrNum. The match is not case sensitive. If no matching
parameter value is found, this method returns VOID (Lingo) or null (JavaScript syntax).
If specifying a parameter value by index, this method returns the value of the parameter at the
paramNameOrNum position in the parameter list. If no matching parameter position is found, this
method returns VOID or null.

externalParamValue()

307

This method is valid only for movies with Shockwave content that are running in a browser. It
cannot be used with Director movies or projectors.
The following list describes the pre-defined external parameters that can be used.
Parameter

Definition

swAudio

A string that specifies the location of a Shockwave Audio file to be played with the
movie. The value is a fully qualified URL.

swBackColor

A color value intended to modify the movie's Stage color property. The value is any
integer value from 0 to 255. Use 0 to 255 for movies in 8-bit color, and 0 to 15 for
movies in 4-bit color.

swBanner

A string that specifies the text to be used as a banner in the movie.

swColor

A color value for use in modifying the color of a specific object. The value is any
integer from 0 to 255. Use 0 to 255 for movies in 8-bit color, and 0 to 15 for
movies in 4-bit color.

swForeColor

A new foreground color value. Text written into field cast members is rendered in
the currently active foreground color. The value is any integer value from 0 to 255.
Use 0 to 255 for movies in 8-bit color, and 0 to 15 for movies in 4-bit color.

swFrame

A string value that is the name assigned to a given frame in the movie.

swList

A comma-delimited list of items that can be parsed with script. List values may be
key/value pairs, Boolean items, integers, or strings.

swName

A name, such as a user name, to be displayed or used within the movie.

swPassword

A password, perhaps for use it conjunction with the swName property, to be used
within the movie.

swPreloadTime

An integer value which specifies the number of seconds of an audio file sound that
should be preloaded before the sound begins to play. Used with Shockwave Audio
to improve playback performance by increasing the amount of audio already
downloaded before playback begins.

swSound

A string value which may specify the name of a sound in the Director movie to be
played, or whether or not a sound should be played at all.

swText

A string value that specifies text to be used in the movie.

swURL

A string URL that may specify the location of another Shockwave movie or
Shockwave Audio file.

swVolume

An integer value (0 to 10 is recommended) that is used to control the volume level
of the sound output from the movie. 0 is off (no sound), 10 is maximum volume.

sw1 through sw9 Nine additional properties for author-defined parameters.

### Parameters
paramNameOrNum Required. A string that specifies the name of the parameter value to return, or

an integer that specifies the index location of the parameter value to return.

308

Chapter 12: Methods

### Example
```lingo
This statement places the value of an external parameter in the variable myVariable:
-- Lingo syntax
if (_player.externalParamName("swURL") = "swURL") then
myVariable = _player.externalParamValue("swURL")
end if
// JavaScript syntax
if (_player.externalParamName("swURL") == "swURL") {
var myVariable = _player.externalParamValue("swURL");
}
```

### See also
externalParamName(), Movie

### Implementation
- **File**: `apps/client/src/director/api/externalParamValue.js`
- **Test**: `apps/client/src/director/api/__tests__/externalParamValue.test.js`
- **Dependencies**: Various (depends on function)

