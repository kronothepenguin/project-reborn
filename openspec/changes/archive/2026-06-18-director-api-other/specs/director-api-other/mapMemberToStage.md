## mapMemberToStage()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20263-20284

### Usage
```lingo

```

### Description
Function; uses the specified sprite and point to return an equivalent point inside the dimensions
of the Stage. This properly accounts for the current transformations to the sprite using quad, or
the rectangle if not transformed.
This is useful for determining if a particular area of a cast member has been clicked, even if there
have been major transformations to the sprite on the Stage.

390

Chapter 12: Methods

If the specified point on the Stage is not within the sprite, a VOID is returned.

### Parameters
whichPointInMember Required. A point from which an equivalent point is returned.

### Example
```lingo

```

### See also
map(), mapStageToMember()

### Implementation
- **File**: `apps/client/src/director/api/mapMemberToStage.js`
- **Test**: `apps/client/src/director/api/__tests__/mapMemberToStage.test.js`
- **Dependencies**: Various (depends on function)

