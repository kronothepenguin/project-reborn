## mapStageToMember()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20285-20301

### Usage
```lingo

```

### Description
Function; uses the specified sprite and point to return an equivalent point inside the dimensions
of the cast member. This properly accounts for any current transformations to the sprite using
quad, or the rectangle if not transformed.
This is useful for determining if a particular area on a cast member has been clicked even if there
have been major transformations to the sprite on the Stage.
If the specified point on the Stage is not within the sprite, this function returns VOID.

### Parameters
whichPointOnStage Required. A point from which an equivalent point is returned.

### Example
```lingo

```

### See also
map(), mapMemberToStage()

### Implementation
- **File**: `apps/client/src/director/api/mapStageToMember.js`
- **Test**: `apps/client/src/director/api/__tests__/mapStageToMember.test.js`
- **Dependencies**: Various (depends on function)

