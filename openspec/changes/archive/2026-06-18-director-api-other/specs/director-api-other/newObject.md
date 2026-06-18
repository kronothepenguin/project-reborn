## newObject()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22073-22118

### Usage
```lingo
spriteObjRef.newObject(objectType {, arg1, arg2 ....})
spriteObjRef.newObject(objectType {, arg1, arg2 ....});
```

### Description
Flash sprite command; creates an ActionScript object of the specified type.
The following syntax creates an object within a Flash sprite:
flashSpriteReference.newObject("objectType" {, arg1, arg2 ....})

The following syntax creates a global object:
newObject("objectType" {, arg1, arg2 ....})
Note: If you have not imported any Flash cast members, you must manually add the Flash Asset Xtra
to your movie’s Xtra list in order for global Flash commands to work correctly in the Shockwave
Player and projectors. You add Xtra extensions to the Xtra list by choosing Modify > Movie > Xtras. For
more information about managing Xtra extensions for distributed movies, see the Using Director
topics in the Director Help Panel.

426

Chapter 12: Methods

### Parameters
objectType Required. Specifies the type of new object to create.
arg1, arg2, ... Optional. Specifies any initialization arguments required by the object. Each
argument must be separated by a comma.

### Example
```lingo
This Lingo sets the variable tLocalConObject to a reference to a new LocalConnection object
in the Flash movie in sprite 3:
-- Lingo syntax
tLocalConObject = sprite(3).newObject("LocalConnection")
// JavaScript syntax
var tLocalConObject = sprite(3).newObject("LocalConnection");

The following Lingo sets the variable tArrayObject to a reference to a new array object in the
Flash movie in sprite 3. The array contains the 3 integer values 23, 34, and 19.
-- Lingo syntax
tArrayObject = sprite(3).newObject("Array",23,34,19)
// JavaScript syntax
var tArrayObject = sprite(3).newObject("Array",23,34,19);
```

### See also
setCallback(), clearAsObjects()

### Implementation
- **File**: `apps/client/src/director/api/newObject.js`
- **Test**: `apps/client/src/director/api/__tests__/newObject.test.js`
- **Dependencies**: Various (depends on function)

