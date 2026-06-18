## setAlpha()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27107-27135

### Usage
```lingo

```

### Description
Function; sets the alpha channel of an image object to a flat alphaLevel or to an existing
alphaImageObject. The alphaLevel must be a number from 0–255. Lower values cause the
image to appear more transparent. Higher values cause the image to appear more opaque. The
value 255 has the same effect as a value of zero. In order for the alphaLevel to have effect, the
useAlpha() of the image object must be set to TRUE.
The image object must be 32-bit. If you specify an alpha image object, it must be 8-bit. Both
images must have the same dimensions. If these conditions are not met, setAlpha() has no effect
and returns FALSE. The function returns TRUE when it is successful.

### Parameters
None.

### Example
```lingo
The following Lingo statement makes the image of the bitmap cast member Foreground opaque
and disables the alpha channel altogether. This is a good method for removing the alpha layer
from an image:
member("Foreground").image.setAlpha(255)
member("Foreground").image.useAlpha = FALSE

This Lingo gets the alpha layer from the cast member Sunrise and places it into the alpha layer of
the cast member Sunset:
tempAlpha = member("Sunrise").image.extractAlpha()
member("Sunset").image.setAlpha(tempAlpha)
```

### See also
useAlpha, extractAlpha()

### Implementation
- **File**: `apps/client/src/director/api/setAlpha.js`
- **Test**: `apps/client/src/director/api/__tests__/setAlpha.test.js`
- **Dependencies**: Various (depends on function)

