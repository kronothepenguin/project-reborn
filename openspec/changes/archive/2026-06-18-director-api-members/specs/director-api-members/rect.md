## rect()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25756-25827

### Usage
```lingo
rect(intLeft, intTop, intRight, intBottom)
rect(intLeft, intTop, intRight, intBottom);
```

### Description
Top level function; defines a rectangle.
You can perform arithmetic operations on rectangles using both Lingo and JavaScript syntax.
If you add a single value to a rectangle, Lingo and JavaScript syntax adds it to each element in
the rectangle.
You can refer to rectangle components by list syntax or property syntax. For example, the
following assignments set both myRectWidth1 and myRectWidth2 to 50:
// JavaScript syntax
var myRect = rect(40,30,90,70);

498

Chapter 12: Methods

var myRectWidth1 = myRect.right - myRect.left; // 50
var myRectWidth2 = myRect[3] - myRect[1]; // 50

To see an example of rect() used in a completed movie, see the Imaging movie in the Learning/
Lingo folder inside the Director application folder.

### Parameters
intLeft Required. An integer that specifies the number of pixels that the left side of the rectangle
is from the left edge of the Stage.
intTop Required. An integer that specifies the number of pixels that the top side of the rectangle
is from the top edge of the Stage.
intRight Required. An integer that specifies the number of pixels that the right side of the

rectangle is from the left edge of the Stage.
intBottom Required. An integer that specifies the number of pixels that the bottom side of the

rectangle is from the top edge of the Stage.

### Example
```lingo
This statement sets the variable newArea to a rectangle whose left side is at 100, top is at 150,
right side is at 300, and bottom is at 400 pixels:
-- Lingo syntax
newArea = rect(100, 150, 300, 400)
// JavaScript syntax
var newArea = rect(100, 150, 300, 400);

In Lingo only, the following statement sets the variable newArea to the rectangle defined by the
points firstPoint and secondPoint:
-- Lingo syntax
firstPoint = point(100, 150)
secondPoint = point(300, 400)
newArea = rect(firstPoint, secondPoint)

In Lingo only, these statements add and subtract values for rectangles:
-- Lingo syntax
put(rect(0, 0, 100, 100) + rect(30, 55, 120, 95)) -- rect(30, 55, 220, 195)
put(rect(0, 0, 100, 100) -rect(30, 55, 120, 95)) -- rect(-30, -55, -20, 5)

In Lingo only, this statement adds 80 to each coordinate in a rectangle:
-- Lingo syntax
put(rect(60, 40, 120, 200) + 80) -- rect(140, 120, 200, 280)

In Lingo only, this statement divides each coordinate in a rectangle by 3:
-- Lingo syntax
put(rect(60, 40, 120, 200) / 3) -- rect(20, 13, 40, 66)
```

### See also
point(), quad

rect()

499

### Implementation
- **File**: `apps/client/src/director/api/rect.js`
- **Test**: `apps/client/src/director/api/__tests__/rect.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

