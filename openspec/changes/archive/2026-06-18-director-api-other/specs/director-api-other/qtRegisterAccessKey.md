## qtRegisterAccessKey()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25026-25040

### Usage
```lingo
qtRegisterAccessKey(categoryString, keyString)
qtRegisterAccessKey(categoryString, keyString);
```

### Description
Command; allows registration of a key for encrypted QuickTime media.
The key is an application-level key, not a system-level key. After the application unregisters the
key or shuts down, the media will no longer be accessible.
Note: For security reasons, there is no way to display a listing of all registered keys.

### Parameters
None.

### Example
```lingo

```

### See also
qtUnRegisterAccessKey()

### Implementation
- **File**: `apps/client/src/director/api/qtRegisterAccessKey.js`
- **Test**: `apps/client/src/director/api/__tests__/qtRegisterAccessKey.test.js`
- **Dependencies**: Various (depends on function)

