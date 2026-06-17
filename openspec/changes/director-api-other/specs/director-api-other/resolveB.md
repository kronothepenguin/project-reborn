## resolveB

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26170-26185

### Usage
```lingo

```

### Description
3D collision method; overrides the collision behavior set by the collision.resolve property for
collisionData.modelB. Call this function only if you wish to override the behavior set for
modelB using collision.resolve.

### Parameters
bResolve Required. Specifies whether the collision for modelB is resolved. If bResolve is TRUE,
then the collision for the modelB is resolved; if bResolve is FALSE the collision for modelB is

not resolved.

### Example
```lingo

```

### See also
collisionData, resolve, registerScript(), modelB, setCollisionCallback()

### Implementation
- **File**: `apps/client/src/director/api/resolveB.js`
- **Test**: `apps/client/src/director/api/__tests__/resolveB.test.js`
- **Dependencies**: Various (depends on function)

