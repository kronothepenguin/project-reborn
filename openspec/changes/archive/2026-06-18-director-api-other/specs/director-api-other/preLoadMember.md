## preLoadMember()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24092-24126

### Usage
```lingo
_movie.preLoadMember({memberObjRef})
_movie.preLoadMember(fromMemNameOrNum, toMemNameOrNum)
_movie.preLoadMember({memberObjRef});
_movie.preLoadMember(fromMemNameOrNum, toMemNameOrNum);
```

### Description
Movie method; preloads cast members and stops when memory is full or when all of the specified
cast members have been preloaded.
This method returns the cast member number of the last cast member successfully loaded. To
obtain this value, use the result() method.
When used without arguments, preLoadMember() preloads all cast members in the movie.
When used with the memberObjRef argument, preLoadMember() preloads just that cast member.
If memberObjRef is an integer, only the first cast library is referenced. If memberObjRef is a string,
the first member with the string as its name will be used.
When used with the arguments fromMemNameOrNum and toMemNameOrNum, preLoadMember()
preloads all cast members in the range specified by the cast member numbers or names.

### Parameters
memberObjRef Optional. A reference to the cast member to preload.
fromMenNameOrNum Required when preloading a range of cast members. A string or an integer

that specifies the first cast member in the range of cast members to preload.
toMemNameOrNum Required when preloading a range of cast members. A string or an integer that

specifies the first cast member in the range of cast members to preload.

### Example
```lingo

```

### See also
Movie, preLoad() (Member), result

468

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/preLoadMember.js`
- **Test**: `apps/client/src/director/api/__tests__/preLoadMember.test.js`
- **Dependencies**: Various (depends on function)

