## group()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18240-18258

### Usage
```lingo

```

### Description
3D element; a node in the 3D world that has a name, transform, parent, and children, but no
other properties.
Every 3D cast member has a default group named World that cannot be deleted. The parent
hierarchy of all models, lights, cameras, and groups that exist in the 3D world terminates in
group("world").

### Parameters
None.

### Example
```lingo
This statement shows that the fourth group of the cast member newAlien is the group Direct01:
put member("newAlien").group[4]
-- group("Direct01")
```

### See also
newGroup, deleteGroup, child (3D), parent

### Implementation
- **File**: `apps/client/src/director/api/group.js`
- **Test**: `apps/client/src/director/api/__tests__/group.test.js`
- **Dependencies**: Various (depends on function)

