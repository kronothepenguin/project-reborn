## setCollisionCallback()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27296-27330

### Usage
```lingo

```

### Description
3D collision command; registers a specified handler, in a given script instance, to be called when
whichModel is involved in a collision.
This command works only if the model’s collision.enabled property is TRUE. The default
behavior is determined by the value of collision.resolve, you can override it using the
collision.resolveA and/or the collision.resolveB commands. Do not use the
updateStage command in the specified handler.

setCollisionCallback()

529

This command is a shorter alternative to using the registerScript command for collisions, but
there is no difference in the overall result. This command can be considered to perform a small
subset of the registerScript command functionality.

### Parameters
handlerName Required. Specifies the handler called when a model is involved in a collision.
scriptInstance Required. Specifies the script instance that contains the handler specified by
handlerName.

### Example
```lingo
This statement causes the #bounce handler in the cast member colScript to be called when the
model named Sphere collides with another model:
member("3d world").model("Sphere").collision.\
setCollisionCallback\
(#bounce, member("colScript"))
```

### See also
collisionData, collision (modifier), resolve, resolveA, resolveB,
registerForEvent(), registerScript(), sendEvent

### Implementation
- **File**: `apps/client/src/director/api/setCollisionCallback.js`
- **Test**: `apps/client/src/director/api/__tests__/setCollisionCallback.test.js`
- **Dependencies**: Various (depends on function)

