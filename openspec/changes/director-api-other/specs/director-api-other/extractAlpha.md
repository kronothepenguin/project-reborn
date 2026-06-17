## extractAlpha()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16019-16032

### Usage
```lingo

```

### Description
This function copies the alpha channel from the given 32-bit image and returns it as a new image
object. The result is an 8-bit grayscale image representing the alpha channel.
This function is useful for down-sampling 32-bit images with alpha channels.

### Parameters
None.

### Example
```lingo
This statement places the alpha channel of the image of member 1 into the variable mainAlpha:
mainAlpha = member(1).image.extractAlpha()
setAlpha(), useAlpha
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/extractAlpha.js`
- **Test**: `apps/client/src/director/api/__tests__/extractAlpha.test.js`
- **Dependencies**: Various (depends on function)

