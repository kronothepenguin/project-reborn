## copyPixels()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13897-14003

### Usage
```lingo
imageObjRef.copyPixels(sourceImgObj, destRectOrQuad, sourceRect {, paramList})
imageObjRef.copyPixels(sourceImgObj, destRectOrQuad, sourceRect {,
paramList});
```

### Description
Image method. Copies the contents of a rectangle in an existing image object into a new
image object.
When copying pixels from one area of a cast member to another area of the same member, it is
best to copy the pixels first into a duplicate image object before copying them back into the
original member. Copying directly from one area to another in the same image is not
recommended.
To simulate matte ink with copyPixels(), create a matte object with createMatte() and then
pass that object as the #maskImage parameter of copyPixels().

copyPixels()

271

To see an example of quad used in a completed movie, see the Quad movie in the Learning/Lingo
folder inside the Director application folder.

### Parameters
sourceImgObj Required. A reference to the source image object from which pixels are copied.
destRectOrQuad Required if copying pixels into a screen coordinate rectangle or a floating point

quad. The rectangle or quad into which pixels are copied.
sourceRect Required. The source rectangle from which pixels are copied.
paramList Optional. A parameter list that can be used to manipulate the copied pixels before
they are placed into destRect or destQuad. The property list may contain any or all of the
following parameters.
Property

Use and Effect

#color

The foreground color to apply for colorization effects. The default color is black.

#bgColor

The background color to apply for colorization effects or background transparency.
The default color is white.

#ink

The type of ink to apply to the copied pixels. This can be an ink symbol or the
corresponding numeric ink value. The default ink is #copy.

#blendLevel

The degree of blend (transparency) to apply to the copied pixels. The range of
values is from 0 to 255. The default value is 255 (opaque). Using a value less than
255 forces the #ink setting to be #blend, or #blendTransparent if it was originally
#backgroundTransparent. #blendLevel could also be replaced with #blend; if so, use
use a value range of 0 to 100.

#dither

A TRUE or FALSE value that determines whether the copied pixels will be dithered
when placed into the destRect in 8- and 16-bit images. The default value is FALSE,
which maps the copied pixels directly into the imageObjRef’s color palette.

#useFastQuads A TRUE or FALSE value that determines whether quad calculations are made using the

faster but less precise method available in Director when copying pixels into
destQuad. Set to TRUE to use quads for simple rotation and skew operations. Set to
FALSE for arbitrary quads, such as those used for perspective transformations. The
default value is FALSE.
#maskImage

Specifies a mask or matte object, created with the creatMask() or createMatte()s,
that will be used as a mask for the pixels being copied. This enables the effects of
mask and matte sprite inks to be duplicated. If the source image has an alpha
channel and its useAlpha property is TRUE, the alpha channel is used and the
specified mask or matte is ignored. The default is no mask.

#maskOffset

A point indicating the amount of x and y offset to apply to the mask specified by
#maskImage. The offset is relative to the upper left corner of the source image. The
default offset is (0, 0).

### Example
```lingo
This statement copies the entire image of member Happy into the rectangle of member flower. If
the members are different sizes, the image of member Happy will be resized to fit the rectangle of
member flower.

272

Chapter 12: Methods

The following statement copies part of the image of member Happy into part of member flower.
The part of the image copied from Happy is within rectangle(0, 0, 200, 90). It is pasted into
rectangle(20, 20, 100, 40) within the image of member flower. The copied portion of Happy is
resized to fit the rectangle into which it is pasted.
The following statement copies the entire image of member Happy into a rectangle within the
image of member flower. The rectangle into which the copied image of member Happy is pasted
is the same size as the rectangle of member Happy, so the copied image is not resized. The blend
level of the copied image is 50, so it is semi-transparent, revealing the part of member flower it is
pasted over.
```

### See also
color(), image()

### Implementation
- **File**: `apps/client/src/director/api/copyPixels.js`
- **Test**: `apps/client/src/director/api/__tests__/copyPixels.test.js`
- **Dependencies**: Various (depends on function)

