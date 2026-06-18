## fill()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16147-16214

### Usage
```lingo
imageObjRef.fill(left, top, right, bottom, colorObjOrParamList)
imageObjRef.fill(point(x, y), point(x, y), colorObjOrParamList)
imageObjRef.fill(rect, colorObjOrParamList)
imageObjRef.fill(left, top, right, bottom, colorObjOrParamList);
imageObjRef.fill(point(x, y), point(x, y), colorObjOrParamList);
imageObjRef.fill(rect, colorObjOrParamList);
```

### Description
Image method. Fills a rectangular region with a specified color in a given image object.
This method returns a value of 1 if there is no error, zero if there is an error.
For best performance, with 8-bit or lower images the color object should contain an indexed color
value. For 16- 32-bit images, use an RGB color value.

### Parameters
left Required if filling a region specified by coordinates. An integer that specifies the left side of
the region to fill.
top Required if filling a region specified by coordinates. An integer that specifies the top side of
the region to fill.
right Required if filling a region specified by coordinates. An integer that specifies the right side
of the region to fill.
bottom Required if filling a region specified by coordinates. An integer that specifies the bottom
side of the region to fill.
colorObjOrParamList Required. A color object or parameter list that specifies the color used to
fill the region. The parameter list can be used instead of a simple color object to specify the
following properties.

312

Property

### Example
```lingo
This statement renders the image object in the variable myImage completely black:
The following statement draws a filled oval in the image object TestImage. The oval has a green
fill and a 5-pixel-wide red border.
```

### See also
color(), draw(), image()

### Implementation
- **File**: `apps/client/src/director/api/fill.js`
- **Test**: `apps/client/src/director/api/__tests__/fill.test.js`
- **Dependencies**: Various (depends on function)

