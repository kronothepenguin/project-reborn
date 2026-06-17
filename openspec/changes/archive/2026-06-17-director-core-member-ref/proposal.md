## Why

The `MemberRef` class represents a cast member reference in Director MX 2004. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `MemberRef` class with all properties documented in the Director MX 2004 reference, with each property having its own spec file containing full documentation.

## What Changes

- Implement `MemberRef` class in `apps/client/src/director/core/member-ref.js`
- Implement all MemberRef properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/member-ref.test.js`
- Each property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-member-ref`: Complete MemberRef class implementation with all properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/member-ref.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: `director-core-point`, `director-core-rect` (for regPoint and rect properties)

## Properties to Implement

| Property | Lines | Description |
|----------|-------|-------------|
| castLibNum | - | Cast library number |
| duration | 37776-37821 | Duration of media member |
| fileName | 38705-38749 | External file name |
| font | - | Font name for text members |
| fontSize | - | Font size for text members |
| height | - | Member height |
| ink | - | Ink effect |
| loop | 42303-42320 | Loop flag for media |
| name | - | Member name |
| number | 44869-44917 | Member number in cast |
| percentStreamed | 46076-46138 | Streaming percentage |
| picture | 46189-46220 | Picture data |
| preLoad | 46738-46767 | Preload flag |
| rect | 47310-47340 | Member rectangle |
| regPoint | - | Registration point |
| scale | 48382-48439 | Scale factor |
| sound | 49624-49654 | Sound data |
| text | - | Text content |
| trackCount | 52254-52273 | Number of tracks |
| trackStartTime | 52407-52430 | Track start time |
| trackStopTime | 52453-52473 | Track stop time |
| trackType | 52525-52553 | Track type |
| type | 52957-53053 | Member type |
| volume | 54126-54144 | Volume level |
| width | - | Member width |
