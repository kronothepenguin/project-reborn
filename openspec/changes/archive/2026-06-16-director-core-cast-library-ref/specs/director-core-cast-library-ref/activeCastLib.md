## activeCastLib

**Source**: `docs/drmx2004_scripting_ref.txt` lines 31698-31727

### Usage
```lingo
_player.activeCastLib
_player.activeCastLib;
```

### Description
Player property; indicates which cast library was most recently activated. Read-only.
The activeCastLib property’s value is the cast library’s number.
The activeCastLib property is useful when working with the Cast object’s selection property.
Use it to determine which cast library the selection refers to.

activeCastLib

623

### Parameters
None.

### Example
```lingo
These statements assign the selected cast members in the most recently selected cast to the
variable selectedMembers:
-- Lingo syntax
castLibOfInterest = _player.activeCastLib
selectedMembers = castLib(castLibOfInterest).selection
// JavaScript syntax
var castLibOfInterest = _player.activeCastLib;
var selectedMembers = castLib(castLibOfInterest).selection;
```

### See also
Player, selection

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

