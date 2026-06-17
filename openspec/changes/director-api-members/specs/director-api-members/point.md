## point()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23523-23581

### Usage
```lingo
point(intH, intV)
point(intH, intV);
```

### Description
Top level function and data type. Returns a point that has specified horizontal and
vertical coordinates.
A point has both a locH and a locV property.
Point coordinates can be changed by arithmetic operations using Lingo only. For example, the
following two points can be added together using Lingo, but NaN is returned using JavaScript
syntax:
-- Lingo
pointA = point(10,10)
pointB = point(5,5)
put(pointA + pointB)
-- point(15,15)
// JavaScript syntax
var pointA = point(10,10);
var pointB = point(5,5);
trace(pointA + pointB);
// NaN

To see an example of point() used in a completed movie, see the Imaging and Vector Shapes
movies in the Learning/Lingo folder inside the Director application folder.

456

Chapter 12: Methods

### Parameters
intH Required. An integer that specifies the horizontal coordinate of the point.
intV Required. An integer that specifies the vertical coordinate of the point.

### Example
```lingo
This statement sets the variable lastLocation to the point (250, 400):
-- Lingo syntax
lastLocation = point(250, 400)
// JavaScript syntax
var lastLocation = point(250, 400);

This statement adds 5 pixels to the horizontal coordinate of the point assigned to the variable
myPoint:
-- Lingo syntax
myPoint.locH = myPoint.locH + 5
// JavaScript syntax
myPoint.locH = myPoint.locH + 5;

In Lingo only, the following statements set a sprite’s Stage coordinates to mouseH and mouseV plus
10 pixels. The two statements are equivalent.
-- Lingo syntax
sprite(_mouse.clickOn).loc = point(_mouse.mouseH, _mouse.mouseV) \
+ point(10, 10)
sprite(_mouse.clickOn).loc = _mouse.mouseLoc + 10
```

### See also
locH, locV

### Implementation
- **File**: `apps/client/src/director/api/point.js`
- **Test**: `apps/client/src/director/api/__tests__/point.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

