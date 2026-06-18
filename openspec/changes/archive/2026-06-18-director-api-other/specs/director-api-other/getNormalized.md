## getNormalized

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17369-17396

### Usage
```lingo

```

### Description
3D vector method; copies the vector and divides the x, y, and z components of the copy by the
length of the original vector. The resulting vector has a length of 1 world unit.
This method returns the copy and leaves the original vector unchanged. To normalize the original
vector, use the normalize command.

336

Chapter 12: Methods

### Parameters
None.

### Example
```lingo
The following statement stores the normalized value of the vector MyVec in the variable Norm.
The value of Norm is vector (-0.1199, 0.9928, 0.0000) and the magnitude of Norm is 1.
MyVec = vector(-209.9019, 1737.5126, 0.0000)
Norm = MyVec.getNormalized()
put Norm
-- vector( -0.1199, 0.9928, 0.0000 )
put Norm.magnitude
-- 1.0000
```

### See also
normalize

### Implementation
- **File**: `apps/client/src/director/api/getNormalized.js`
- **Test**: `apps/client/src/director/api/__tests__/getNormalized.test.js`
- **Dependencies**: Various (depends on function)

