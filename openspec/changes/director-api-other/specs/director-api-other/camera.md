## camera()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13059-13090

### Usage
```lingo

```

### Description
3D element; an object at a vector position from which the 3D world is viewed.
Each sprite has a list of cameras. The view from each camera in the list is displayed on top of the
view from camera with lower index positions. You can set the rect (camera) property of each
camera to display multiple views within the sprite.
Cameras are stored in the camera palette of the cast member. Use the newCamera and
deleteCamera commands to create and delete cameras in a 3D cast member.
The camera property of a sprite is the first camera in the list of cameras of the sprite. The camera
referred to by sprite(whichSprite).camera is the same as
sprite(whichSprite).camera(1). Use the addCamera and deleteCamera commands to build
the list of cameras in a 3D sprite.

### Parameters
None.

### Example
```lingo
This statement sets the camera of sprite 1 to the camera named TreeCam of the cast member
named Picnic.
sprite(1).camera = member("Picnic").camera("TreeCam")

This statement sets the camera of sprite 1 to camera 2 of the cast member named Picnic.
sprite(1).camera = member("Picnic").camera[2]
```

### See also
bevelDepth, overlay, modelUnderLoc, spriteSpaceToWorldSpace, fog,
clearAtRender

### Implementation
- **File**: `apps/client/src/director/api/camera.js`
- **Test**: `apps/client/src/director/api/__tests__/camera.test.js`
- **Dependencies**: Various (depends on function)

