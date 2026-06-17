## draw()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15334-15406

### Usage
```lingo
imageObjRef.draw(x1, y1, x2, y2, colorObjOrParamList)
imageObjRef.draw(point(x, y), point(x, y), colorObjOrParamList)
imageObjRef.draw(rect, colorObjOrParamList)
imageObjRef.draw(x1, y1, x2, y2, colorObjOrParamList);
imageObjRef.draw(point(x, y), point(x, y), colorObjOrParamList);
imageObjRef.draw(rect, colorObjOrParamList);
```

### Description
Image method. Draws a line or an unfilled shape with a specified color in a rectangular region of
a given image object.
This method returns a value of 1 if there is no error.
If the optional parameter list is not provided, draw() draws a 1-pixel line between the first and
second points given or between the upper left and lower right corners of the given rectangle.
For best performance, with 8-bit or lower images the color object should contain an indexed color
value. For 16- or 32-bit images, use an RGB color value.
To fill a solid region, use the fill() method.

### Parameters
x1 Required if drawing a line using x and y coordinates. An integer that specifies the x coordinate

of the start of the line.
y1 Required if drawing a line using x and y coordinates. An integer that specifies the y coordinate

of the start of the line.

draw()

297

x2 Required if drawing a line using x and y coordinates. An integer that specifies the x coordinate

of the end of the line.
y2 Required if drawing a line using x and y coordinates. An integer that specifies the y coordinate

of the end of the line.
colorObjOrParamList Required. A color object or parameter list that specifies the color of the

line or shape’s border. The parameter list can be used instead of a simple color object to specify
the following properties.
Property

### Example
```lingo
This statement draws a 1-pixel, dark red, diagonal line from point (0, 0) to point (128, 86) within
the image of member Happy.
The following statement draws a dark red, 3-pixel unfilled oval within the image of member
Happy. The oval is drawn within the rectangle (0, 0, 128, 86).
```

### See also
color(), copyPixels(), fill(), image(), setPixel()

### Implementation
- **File**: `apps/client/src/director/api/draw.js`
- **Test**: `apps/client/src/director/api/__tests__/draw.test.js`
- **Dependencies**: Various (depends on function)

