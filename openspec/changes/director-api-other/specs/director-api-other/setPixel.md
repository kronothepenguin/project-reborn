## setPixel()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27417-27454

### Usage
```lingo
imageObjRef.setPixel(x, y, colorObjOrIntValue)
imageObjRef.setPixel(point(x, y), colorObjOrIntValue)
imageObjRef.setPixel(x, y, colorObjOrIntValue);
imageObjRef.setPixel(point(x, y), colorObjOrIntValue);
```

### Description
Image method. Sets the color value of the pixel at a specified point in a given image.
If setting many pixels to the color of another pixel with getPixel(), it is faster to set them
as integers.
For best performance with color objects, use an indexed color object with 8-bit or lower images,
and use an RGB color object with 16-bit or higher images.
This method returns FALSE if the specified pixel falls outside the specified image.
To see an example of this method used in a completed movie, see the Imaging movie in the
Learning/Lingo folder inside the Director application folder.

### Parameters
x Required if specifying a pixel using x and y coordinates. An integer that specifies the x
coordinate of the pixel.
y Required if specifying a pixel using x and y coordinates. An integer that specifies the y
coordinate of the pixel.
point(x, y) Required if specifying a pixel using a point. A point that specifies the pixel.

532

Chapter 12: Methods

colorObjOrIntValue Required if setting the color to a color object or an integer value. A
reference to a color object that specifies the color of the pixel, or an integer that specifies the color
value of the pixel.

### Example
```lingo
This Lingo statement draws a horizontal black line 50 pixels from left to right in cast member 5:
```

### See also
color(), draw(), fill(), getPixel(), image()

### Implementation
- **File**: `apps/client/src/director/api/setPixel.js`
- **Test**: `apps/client/src/director/api/__tests__/setPixel.test.js`
- **Dependencies**: Various (depends on function)

