## broadcastProps

**Source**: `docs/drmx2004_scripting_ref.txt` lines 34071-34103

### Usage
```lingo
memberObjRef.broadcastProps
memberObjRef.broadcastProps;
```

### Description
Cast member property; controls whether changes made to a Flash or Vector shape cast member
are immediately broadcast to all of its sprites currently on the Stage (TRUE) or not (FALSE).
When this property is set to FALSE, changes made to the cast member are used only as defaults for
new sprites and don’t affect sprites on the Stage.
The default value for this property is TRUE, and it can be both tested and set.

### Parameters
None.

### Example
```lingo
This frame script assumes that a Flash movie cast member named Navigation Movie has been set
up with its broadcastProps property set to FALSE. The script momentarily allows changes to a
Flash movie cast member to be broadcast to its sprites currently on the Stage. It then sets the
viewScale property of the Flash movie cast member, and that change is broadcast to its sprite.
The script then prevents the Flash movie from broadcasting changes to its sprites.
-- Lingo syntax
on enterFrame
member("Navigation Movie").broadcastProps = TRUE
member("Navigation Movie").viewScale = 200
member("Navigation Movie").broadcastProps = FALSE
end
// JavaScript syntax
function enterFrame() {
member("Navigation Movie").broadcastProps = 1;
member("Navigation Movie").viewScale = 200;
member("Navigation Movie").broadcastProps = 0;
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

