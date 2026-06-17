## hitTest()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18364-18414

### Usage
```lingo
spriteObjRef.hitTest(point)
spriteObjRef.hitTest(point);
```

### Description
Function; indicates which part of a Flash movie is directly over a specific Director Stage location.
The Director Stage location is expressed as a Director point value: for example, point(100,50).
The hitTest function returns these values:

• #background—The specified Stage location falls within the background of the Flash movie
sprite.

• #normal—The specified Stage location falls within a filled object.
• #button—The specified Stage location falls within the active area of a button.
• #editText—The specified Stage location falls within a Flash editable text field.

### Parameters
point Required. Specifies the point to test.

356

Chapter 12: Methods

### Example
```lingo
This frame script checks to see if the mouse is currently located over a button in a Flash movie
sprite in channel 5 and, if it is, the script sets a text field used to display a status message:
-- Lingo syntax
on exitFrame
if sprite(5).hitTest(_mouse.mouseLoc) = #button then
member("Message Line").text = "Click here to play the movie."
_movie.updatestage()
else
member("Message Line").text = ""
end if
_movie.go(_movie.frame)
end
// JavaScript syntax
function exitFrame() {
var hT = sprite(5).hitTest(_mouse.mouseLoc);
if (hT = "button") {
member("Message Line").text = "Click here to play the movie.";
_movie.updatestage();
} else {
member("Message Line").text = "";
}
_movie.go(_movie.frame)
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/hitTest.js`
- **Test**: `apps/client/src/director/api/__tests__/hitTest.test.js`
- **Dependencies**: Various (depends on function)

