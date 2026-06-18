## new()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21597-21747

### Usage
```lingo

```

### Description
Function; creates a new cast member, child object, timeout object, or Xtra instance and allows
you to assign of individual property values to child objects.

416

Chapter 12: Methods

For cast members, the type parameter sets the cast member’s type. Possible predefined values
correspond to the existing cast member types: #bitmap, #field, and so on. The new function can
also create Xtra cast member types, which can be identified by any name that the author chooses.
It’s also possible to create a new color cursor cast member using the Custom Cursor Xtra. Use
new(#cursor) and set the properties of the resulting cast member to make them available for use.
The optional whichCastMember and whichCast parameters specify the cast member slot and
Cast window where the new cast member is stored. When no cast member slot is specified, the
first empty slot is used. The new function returns the cast member slot.
When the argument for the new function is a parent script, the new function creates a
child object. The parent script should include an on new handler that sets the child object’s initial
state or property values and returns the me reference to the child object.
The child object has all the handlers of the parent script. The child object also has the same
property variable names that are declared in the parent script, but each child object has its own
values for these properties.
Because a child object is a value, it can be assigned to variables, placed in lists, and passed
as a parameter.
As with other variables, you can use the put command to display information about a child object
in the Message window.
When new() is used to create a timeout object, the timeoutPeriod sets the number of milliseconds
between timeout events sent by the timeout object. The #timeoutHandler is a symbol that
identifies the handler that will be called when each timeout event occurs. The targetObject
identifies the name of the child object that contains the #timeoutHandler. If no targetObject
is given, the #timeoutHandler is assumed to be in a movie script. The timeout creation syntax
might vary depending on the scriptExecutionStyle setting.
-- Lingo syntax when scriptExecutionStyle is set to 9
x = timeout(name).new(period,handler,targetData)
-- Lingo syntax when scriptExecutionStyle is set to 10
x = timeout().new(name, period, handler, targetData)
y = new timeout(name, period, handler, targetData)
// JavaScript syntax
x = new timeout(name, period, function, targetData)

When a timeout object is created, it enables its targetObject to receive the system events
prepareMovie, startMovie, stopMovie, prepareFrame, and exitFrame. To take advantage of
this, the targetObject must contain handlers for these events. The events do not need to be
passed in order for the rest of the movie to have access to them.
Note: A Lingo-created timeout object can call a JavaScript syntax function, and vice versa.

To see an example of new() used in a completed movie, see the Parent Scripts, and Read and
Write Text movies in the Learning/Lingo folder inside the Director application folder.

### Parameters
None.

### Example
```lingo
To create a new bitmap cast member in the first available slot, you use this syntax:
set newMember = new(#bitmap)

new()

417

After the line has been executed, newMember will contain the member reference to the cast
member just created:
put newMember
-- (member 1 of castLib 1)

If you are using JavaScript syntax to create a new cast members, use the movie object's
newMember() method. This statement creates a new bitmap cast member:
var tMem = _movie.newMember(symbol("bitmap"))

The following startMovie script creates a new Flash cast member using the new command, sets the
newly created cast member’s linked property so that the cast member’s assets are stored in an
external file, and then sets the cast member’s pathName property to the location of a Flash movie
on the World Wide Web:
on startMovie
flashCastMember = new(#flash)
member(flashCastMember).pathName = "http://www.someURL.com/myFlash.swf"
end

When the movie starts, this handler creates a new animated color cursor cast member and stores
its cast member number in a variable called customCursor. This variable is used to set the
castMemberList property of the newly created cursor and to switch to the new cursor.
on startmovie
customCursor = new(#cursor)
member(customCursor).castMemberList = [member 1, member 2, member 3]
cursor (member(customCursor))
end

These statements from a parent script include the on new handler to create a child object. The
parent script is a script cast member named Bird, which contains these handlers.
on new me, nameForBird
return me
end
on fly me
put "I am flying"
end

The first statement in the following example creates a child object from the above script in the
preceding example, and places it in a variable named myBird. The second statement makes the
bird fly by calling the fly handler in the Bird parent script:
myBird = script("Bird").new()
myBird.fly()

This statement uses a new Bird parent script, which contains the property variable speed:
property speed
on new me, initSpeed
speed = initSpeed
return me
end
on fly me
put "I am flying at " & speed & "mph"
end

418

Chapter 12: Methods

The following statements create two child objects called myBird1 and myBird2. They are given
different starting speeds: 15 and 25, respectively. When the fly handler is called for each child
object, the speed of the object is displayed in the Message window.
myBird1 = script("Bird").new(15)
myBird2 = script("Bird").new(25)
myBird1.fly()
myBird2.fly()

This message appears in the Message window:
-- "I am flying at 15 mph"
-- "I am flying at 25 mph"

This statement creates a new timeout object called intervalTimer that will send a timeout event to
the on minuteBeep handler in the child object playerOne every 60 seconds:
timeout("intervalTimer").new(60000, #minuteBeep, playerOne)

This statement creates a sample JavaScript function:
function sampleTimeout () { trace("hello"); }

Elsewhere in your movie you can use this statement to create a timeout object that calls the
JavaScript function:
-- Lingo syntax
gTO = timeout().new("test",50,"sampleTimeout",0)
// JavaScript syntax
_global.gTO = new timeout("test",50,"sampleTimeout",0)
```

### See also
on stepFrame, actorList, ancestor, me, type (Member), timeout()

### Implementation
- **File**: `apps/client/src/director/api/new.js`
- **Test**: `apps/client/src/director/api/__tests__/new.test.js`
- **Dependencies**: Various (depends on function)

