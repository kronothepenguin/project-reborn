## pictureP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23074-23106

### Usage
```lingo
pictureP(pictureValue)
pictureP(pictureValue);
```

### Description
Function; reports whether the state of the picture member property for the specified cast
member is TRUE (1) or FALSE (0).
Because pictureP doesn’t directly check whether a picture is associated with a cast member, you
must test for a picture by checking the cast member’s picture member property.

### Parameters
pictureValue Required. Specifies a reference to the picture of a cast member.

446

Chapter 12: Methods

### Example
```lingo
The first statement in this example assigns the value of the picture member property for the
cast member Shrine, which is a bitmap, to the variable pictureValue. The second statement
checks whether Shrine is a picture by checking the value assigned to pictureValue.
-- Lingo syntax
pictureValue = member("Shrine").picture
put pictureP(pictureValue)
// JavaScript syntax
var pictureValue = member("Shrine").picture;
put(pictureP(pictureValue));

The result is 1, which is the numerical equivalent of TRUE.
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/pictureP.js`
- **Test**: `apps/client/src/director/api/__tests__/pictureP.test.js`
- **Dependencies**: Various (depends on function)

