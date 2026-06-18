## crop() (Image)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14152-14181

### Usage
```lingo
imageObjRef.crop(rectToCropTo)
imageObjRef.crop(rectToCropTo);
```

### Description
Image method. Returns a new image object that contains a copy of a source image object,
cropped to a given rectangle.
Calling crop() does not alter the source image object.
The new image object does not belong to any cast member and has no association with the Stage.
To assign the new image to a cast member, set the image property of that cast member.

### Parameters
rectToCropTo Required. The rectangle to which the new image is cropped.

### Example
```lingo
This Lingo takes a snapshot of the Stage and crops it to the rect of sprite 10, capturing the
current appearance of that sprite on the Stage:
This statement uses the rectangle of cast member Happy to crop the image of cast member
Flower, then sets the image of cast member Happy to the result:
member("Happy").image = member("Flower").image.crop(member("Happy").rect)

276

Chapter 12: Methods
```

### See also
image (Image), image(), rect (Image)

### Implementation
- **File**: `apps/client/src/director/api/crop-Image.js`
- **Test**: `apps/client/src/director/api/__tests__/crop-Image.test.js`
- **Dependencies**: Various (depends on function)

