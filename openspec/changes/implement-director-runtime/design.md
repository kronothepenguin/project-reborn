## Context

The Habbo Hotel R26 client uses Macromedia Director's Lingo scripting language. We are rebuilding the client in JavaScript by implementing the Director runtime API. The runtime (`apps/client/src/director/`) currently has:

- **runtime.js**: 65 functions (type checks, data types, conversions, math, member access, network stubs)
- **syntax.js**: 11 functions/constants (chunk helpers, `the` proxy, `range()`)
- **core.js**: Core classes (List, PropList, Member, Movie, Player, etc.)

The Director MX 2004 API contains 310 methods, 577 properties, and 56 `the` properties used in .ls files. The PDF reference (`docs/drmx2004_scripting_ref.pdf`) has been extracted to `/tmp/director_ref.txt` for reference.

**Current gaps**:
- 37 missing `the` properties (keyCode, doubleClick, stage, selStart, etc.)
- ~18 missing Director API functions (abs, sqrt, atan, getProp, union, etc.)
- Case mismatches: Lingo uses `voidp`, we export `voidP`
- JS reserved word conflicts: `new` → `newFn`, `delete` → `deleteFn`

## Goals / Non-Goals

**Goals:**
- Implement all missing Director API functions used in .ls files
- Add lowercase aliases for type-check functions to match Lingo's case-insensitive nature
- Implement 37 missing `the` properties in the proxy
- Document all 310 methods with signatures and JavaScript equivalents
- Document all 577 properties organized by Director object
- Enable TypeScript LSP to recognize all Director API imports

**Non-Goals:**
- Implement 3D functions (camera, light, shader, texture, vector) unless needed
- Implement Xtra-specific functions (QuickTime, Flash, DVD) not used in Habbo
- Implement voice functions (voiceCount, voiceGet, voiceSpeak, etc.)
- Change existing function signatures or behavior
- Modify the `the` proxy architecture (continue using Proxy approach)

## Decisions

### 1. Export both camelCase and lowercase for type-check functions

**Decision**: Export `voidP` and `voidp`, `integerP` and `integerp`, etc.

**Rationale**: Lingo is case-insensitive, so .ls files may use `voidp` or `voidP`. Exporting both ensures compatibility without requiring translators to normalize case.

**Alternatives considered**:
- Only export camelCase: Would require translators to normalize all calls
- Only export lowercase: Would break existing imports

### 2. Continue using Proxy for `the` keyword

**Decision**: Keep the Proxy-based `the` object in syntax.js.

**Rationale**: The Proxy approach makes .ls ↔ .js comparison easier. `the.keyCode` in JS maps directly to `the keyCode` in Lingo.

**Alternatives considered**:
- Direct object access (`_key.keyCode`): Less readable, harder to compare with Lingo
- Getter functions (`getKeyCode()`): More verbose, doesn't match Lingo syntax

### 3. Implement functions incrementally by usage frequency

**Decision**: Prioritize functions by usage count in .ls files.

**Rationale**: The 56 `the` properties have varying usage counts (itemDelimiter: 360, browser: 1). Implementing high-frequency properties first provides immediate value.

**Priority order**:
1. High-frequency `the` properties (doubleClick, stage, keyCode)
2. Math functions (abs, sqrt, atan)
3. Type-check aliases (voidp, integerp, etc.)
4. List/PropList operations (getProp, union)
5. Network/Sound/Window functions

### 4. Document naming mismatches in specs

**Decision**: Create a naming mismatch table in specs documenting Lingo → JavaScript differences.

**Rationale**: Translators need to know that `voidp` maps to `voidP`, `new` maps to `newFn`, etc. Centralizing this in specs prevents confusion.

### 5. Skip 3D/Xtra/Voice functions unless needed

**Decision**: Don't implement 3D (camera, light, shader), Xtra (QuickTime, Flash), or Voice functions.

**Rationale**: These are not used in the Habbo client. Implementing them would be wasted effort. If needed later, they can be added.

## Risks / Trade-offs

- **[Case sensitivity confusion]** Exporting both `voidP` and `voidp` could lead to inconsistent usage. → Mitigation: Document convention (prefer camelCase in new code, lowercase for compatibility).

- **[Incomplete `the` properties]** Some `the` properties are context-dependent (e.g., `the number` can mean different things). → Mitigation: Implement based on actual usage in .ls files, document edge cases.

- **[Proxy performance]** The `the` Proxy may have performance overhead. → Mitigation: Monitor performance; optimize if needed. Current usage is not performance-critical.

- **[Missing PDF functions]** Some functions in the PDF may not be needed, some needed functions may not be in the PDF. → Mitigation: Cross-reference PDF with actual .ls file usage. Implement what's needed.

- **[JS reserved words]** Functions like `new`, `delete`, `try`, `catch` conflict with JS reserved words. → Mitigation: Use `Fn` suffix (`newFn`, `deleteFn`, etc.). Document in specs.

- **[Property vs method ambiguity]** Some Director APIs are both properties and methods (e.g., `count`). → Mitigation: Implement as both where needed (property on List class, `count()` function).

## Migration Plan

1. **Phase 1**: Add lowercase aliases for existing functions (non-breaking)
2. **Phase 2**: Implement missing `the` properties (additive)
3. **Phase 3**: Implement missing Director API functions (additive)
4. **Phase 4**: Document all APIs in specs (documentation only)

No breaking changes. All additions are backward-compatible.

## Open Questions

1. **`the number` context**: How to handle `the number of items in list` vs `the number of castLibs`? → Implement as `list.count` and `the.numberOfCastLibs` respectively.

2. **`the last` context**: How to handle `the last char of str` vs `the last item of list`? → Implement as `charOf(str)[charOf(str).count]` and `list[list.count]`.

3. **Sound functions**: Are `playSound` and `queueSound` needed for Habbo? → Check .ls files for usage.

4. **Network functions**: Are `netAbort`, `netLastModDate`, `netMIME` needed? → Check .ls files for usage.

5. **Date function**: Should `date()` return a string or Date object? → Return string to match Lingo behavior.
