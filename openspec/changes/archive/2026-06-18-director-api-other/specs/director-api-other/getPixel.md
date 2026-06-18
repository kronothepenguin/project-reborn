## getPixel()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17488-17530

### Usage
```lingo
imageObjRef.getPixel(x, y {, #integer})
imageObjRef.getPixel(point(x, y) {, #integer})
imageObjRef.getPixel(x, y {, #integer});
imageObjRef.getPixel(point(x, y) {, #integer});
```

### Description
Image method. Returns an indexed or RGB color of the pixel at a specified point in a given
image.
The index of the rows and columns of the returned image starts with 0. Therefore, in order to
access the top left pixel of an image, specify the location as (0,0), and not (1,1). If a given image
is h pixels high and w pixels wide, to access the bottom right pixel of the image, specify the
location as (w,1), (h,1).
This method returns a value of 0 if the specified pixel is outside the given image.
To set a lot of pixels to the color of another pixel, it is faster to set them as raw numbers (by using
the optional #integer parameter). Raw integer color values are also useful because they contain
alpha layer information as well as color when the image is 32-bit. The alpha channel information
can be extracted from the raw integer by dividing the integer by 2^8+8+8.

### Parameters
x Required if specifying a pixel using x and y coordinates. An integer that specifies the x
coordinate of the pixel.
y Required if specifying a pixel using x and y coordinates. An integer that specifies the y
coordinate of the pixel.
#integer Optional. A symbol that specifies the raw number of the returned color value.
point(x, y) Required if specifying a pixel using a point. A point that specifies the point of

the pixel.

### Example
```lingo
These statements get the color of the pixel at point (90, 20) in member Happy and set sprite 2 to
that color:
This statement sets the variable alpha to the alpha channel value of the point (25, 33) in the
32-bit image object myImage:
```

### See also
color(), image(), power(), setPixel()

getPixel()

339

### Implementation
- **File**: `apps/client/src/director/api/getPixel.js`
- **Test**: `apps/client/src/director/api/__tests__/getPixel.test.js`
- **Dependencies**: Various (depends on function)

