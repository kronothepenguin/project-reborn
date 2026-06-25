## Context

The Director MX 2004 API includes 3D and DVD methods that require specialized rendering and playback engines. Since this implementation focuses on 2D browser-based Director movies, these methods are excluded from the current scope.

**Source**: `docs/director-inventory.json`
**Excluded Count**: 91 methods (76 3D + 15 DVD)

## Goals / Non-Goals

**Goals:**
- Document all excluded 3D methods with line numbers
- Document all excluded DVD methods with line numbers
- Provide clear reasons for exclusion
- Create reference for future implementation if needed

**Non-Goals:**
- Implement any 3D or DVD methods
- Create stub implementations
- Provide migration paths (not applicable)

## Decisions

### Decision 1: Documentation format

**Choice**: Single spec file with tables of excluded methods
```markdown
## 3D Methods (76 total)
| Method | Lines | Reason |
|--------|-------|--------|
| addBackdrop | 12000-12050 | Requires 3D rendering |
...
```

**Rationale**: Simple, searchable reference for excluded methods.

### Decision 2: Reason categorization

**Choice**: Two categories - "3D rendering" and "DVD playback"
```markdown
| Method | Reason |
|--------|--------|
| addBackdrop | Requires 3D rendering engine |
| activateAtLoc | Requires DVD playback support |
```

**Rationale**: Clear, concise reasons for exclusion.

### Decision 3: No implementation

**Choice**: Documentation only, no code changes
```markdown
**Impact**: No implementation (documentation only)
```

**Rationale**: These methods are out of scope. No need for stubs or placeholders.

## Risks / Trade-offs

**Risk**: Users may expect 3D/DVD methods to work
→ **Mitigation**: Clear documentation of excluded methods

**Risk**: Future implementation may be needed
→ **Mitigation**: Line numbers provided for easy reference

**Trade-off**: Complete documentation vs. minimal documentation
→ **Acceptable**: Complete documentation helps future maintainers
