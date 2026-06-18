## qtUnRegisterAccessKey()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25041-25055

### Usage
```lingo
qtUnRegisterAccessKey(categoryString, keyString)
qtUnRegisterAccessKey(categoryString, keyString);
```

### Description
Command; allows the key for encrypted QuickTime media to be unregistered.
The key is an application-level key, not a system-level key. After the application unregisters
the key, only movies encrypted with this key continue to play. Other media will no longer
be accessible.

### Parameters
None.

### Example
```lingo

```

### See also
qtRegisterAccessKey()

### Implementation
- **File**: `apps/client/src/director/api/qtUnRegisterAccessKey.js`
- **Test**: `apps/client/src/director/api/__tests__/qtUnRegisterAccessKey.test.js`
- **Dependencies**: Various (depends on function)

