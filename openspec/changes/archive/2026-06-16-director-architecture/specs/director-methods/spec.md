## REMOVED Requirements

### Requirement: Math functions SHALL be implemented

**Reason**: Methods are now split into individual files under the director-api capability. Each method has its own spec file in `api/` directory.

**Migration**: See `director-api` capability for individual method implementations:
- `api/abs.js` for abs()
- `api/sqrt.js` for sqrt()
- etc.

### Requirement: Type checking functions SHALL be implemented with case-insensitive aliases

**Reason**: Type checking functions are now split into individual files under the director-api capability.

**Migration**: See `director-api` capability for individual type check implementations:
- `api/void-p.js` for voidP()
- `api/integer-p.js` for integerP()
- etc.
