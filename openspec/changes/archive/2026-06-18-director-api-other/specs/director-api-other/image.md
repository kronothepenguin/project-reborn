## image()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19008-19061

### Usage
```lingo
image(intWidth, intHeight, intBitDepth)
image(intWidth, intHeight, intBitDepth);
```

### Description
Top level function; creates and returns a new image with specified dimensions.
If you create a new image by using the top level image() function, the new image is a selfcontained set of image data, and is independent of all other images. Therefore, changes made to
any other images have no effect on the new image.
If you refer to an image by setting a variable equal to a source image, such as a cast member or the
image of the Stage, the variable contains a reference to the source image. Therefore, a change
made to the image in either the source object or the variable will be reflected in the other image.
To avoid this behavior and create a copy of an image that is independent of the source image, use
the duplicate() method. The duplicate() method returns a copy of a source image that
inherits all the values of the source image but is not tied to the source image. Therefore, a change
made to either the source image or the new copy of the source image will have no effect on the
other image.
If you create an image object by referring to a cast member, the new object contains a reference to
the image of the member. Any changes made to the image are reflected in the cast member and in
any sprites that are created from that member.

364

Chapter 12: Methods

When you create a new image object, the background color defaults to white
(color(255,255,255)), and the alpha channel is completely opaque (color(0,0,0)).
The alpha channel color for 100% transparency is white (color(255,255,255)); the alpha channel
color for 100% opaque is black (color(0,0,0)).
To see an example of image() used in a completed movie, see the Imaging movie in the Learning/
Lingo folder inside the Director application folder.

### Parameters
intWidth Required. An integer that specifies the width of the new image.
intHeight Required. An integer that specifies the height of the new image.
intBitDepth Required. An integer that specifies the bit depth of the new image. Valid values are
1, 2, 4, 8, 16, or 32.

### Example
```lingo
The following example creates an 8-bit image that is 200 pixels wide by 200 pixels high.
-- Lingo syntax
objImage = image(200, 200, 8)
// JavaScript syntax
var objImage = image(200, 200, 8);

The following example creates an image by referring to the image of the Stage.
-- Lingo syntax
objImage = _movie.stage.image
// JavaScript syntax
var objImage = _movie.stage.image;
```

### See also
duplicate() (Image), fill(), image (Image)

### Implementation
- **File**: `apps/client/src/director/api/image.js`
- **Test**: `apps/client/src/director/api/__tests__/image.test.js`
- **Dependencies**: Various (depends on function)

