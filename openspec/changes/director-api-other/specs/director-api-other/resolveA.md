## resolveA

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26151-26169

### Usage
```lingo

```

### Description
3D collision method; overrides the collision behavior set by the collision.resolve property for
collisionData.modelA. Call this function only if you wish to override the behavior set for
modelA using collision.resolve.

### Parameters
bResolve Required. Specifies whether the collision for modelA is resolved. If bResolve is TRUE,
then the collision for the modelA is resolved; if bResolve is FALSE the collision for modelA is
not resolved.

### Example
```lingo

```

### See also
collisionData, registerScript(), resolve, modelA, setCollisionCallback()

506

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/resolveA.js`
- **Test**: `apps/client/src/director/api/__tests__/resolveA.test.js`
- **Dependencies**: Various (depends on function)

