## newMember()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21837-21900

### Usage
```lingo
_movie.newMember(symbol)
_movie.newMember(stringMemberType)
_movie.newMember(stringMemberType);
```

### Description
Movie method; creates a new cast member and allows you to assign individual property values to
child objects.
For new cast members, the symbol or stringMemberType parameter sets the cast member’s type.
Possible predefined values correspond to the existing cast member types: #bitmap, #field, and so
on. The newMember() method can also create Xtra cast member types, which can be identified by
any name that the author chooses.
It’s also possible to create a new color cursor cast member using the Custom Cursor Xtra. Use
newMember(#cursor) and set the properties of the resulting cast member to make them available
for use.
After newMember() is called, the new cast member is placed in the first empty cast library slot.

newMember()

421

When the argument for the new() function is a parent script, the new function creates a
child object. The parent script should include an on new handler that sets the child object’s initial
state or property values and returns the me reference to the child object.
The child object has all the handlers of the parent script. The child object also has the same
property variable names that are declared in the parent script, but each child object has its own
values for these properties.
Because a child object is a value, it can be assigned to variables, placed in lists, and passed
as a parameter.
As with other variables, you can use the put() method to display information about a child
object in the Message window.
When new() is used to create a timeout object, the timeoutPeriod sets the number of milliseconds
between timeout events sent by the timeout object. The #timeoutHandler is a symbol that
identifies the handler that will be called when each timeout event occurs. The targetObject
identifies the name of the child object that contains the #timeoutHandler. If no targetObject
is given, the #timeoutHandler is assumed to be in a movie script.
When a timeout object is created, it enables its targetObject to receive the system events
prepareMovie, startMovie, stopMovie, prepareFrame, and exitFrame. To take advantage of
this, the targetObject must contain handlers for these events. The events do not need to be
passed in order for the rest of the movie to have access to them.
To see an example of newMember() used in a completed movie, see the Parent Scripts, and Read
and Write Text movies in the Learning/Lingo folder inside the Director application folder.

### Parameters
symbol (Lingo only) Required. A symbol that specifies the type of the new cast member.
stringMemberType Required. A string that specifies the type of the new cast member.

### Example
```lingo
The following statements create a new bitmap cast member and assign it to the variable
newBitmap.
-- Lingo syntax
newBitmap = _movie.newMember(#bitmap) -- using a symbol
newBitmap = _movie.newMember("bitmap") -- using a string
// JavaScript syntax
var newBitmap = _movie.newMember("bitmap");
```

### See also
Movie, type (Member)

422

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/newMember.js`
- **Test**: `apps/client/src/director/api/__tests__/newMember.test.js`
- **Dependencies**: Various (depends on function)

