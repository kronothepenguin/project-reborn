## createMask()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14106-14151

### Usage
```lingo

```

### Description
This function creates and returns a mask object for use with the copyPixels() function.
Mask objects aren’t image objects; they’re useful only with the copyPixels() function for
duplicating the effect of mask sprite ink. To save time, if you plan to use the same image as a mask
more than once, it’s best to create the mask object and save it in a variable for reuse.

### Parameters
None.

### Example
```lingo
This statement copies the entire image of member Happy into a rectangle within the image of
member brown square. Member gradient2 is used as a mask with the copied image. The mask is
offset by 10 pixels up and to the left of the rectangle into which the image of member Happy
is pasted.
member("brown square").image.copyPixels(member("Happy").image, \
rect(20, 20, 150, 108), member("Happy").rect, \
[#maskImage:member("gradient2").image.createMask(), maskOffset:point(-10, 10)])
See also3
copyPixels(), createMatte(), ink

createMask()

275

createMatte()
Syntax
imageObject.createMatte({alphaThreshold})
```

### See also
copyPixels(), createMask()

### Implementation
- **File**: `apps/client/src/director/api/createMask.js`
- **Test**: `apps/client/src/director/api/__tests__/createMask.test.js`
- **Dependencies**: Various (depends on function)

