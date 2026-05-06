# TBD - Syntax Patterns to Implement Later

This file tracks Lingo syntax patterns that are not yet implemented in the runtime.

---

## the.* Computed Properties

| Pattern | Reference |
|---------|-----------|
| `the last char in tName` | `fuse_client/30_Resource Manager Class.ls:190,235` |
| `the last word in the content of tMsg` | `hh_room/5_Room Handler Class.ls:470` |
| `the number of castLibs` | Multiple files |
| `the number of castMembers of castLib N` | Multiple files |
| `the number of items in tLine` | `fuse_client/30_Resource Manager Class.ls:189,234` |
| `the number of lines in tAliasList` | `fuse_client/30_Resource Manager Class.ls:231` |
| `the first item of tStr` | TBD |
| `the first char of tStr` | TBD |
| `the first word of tStr` | TBD |

---

## Implementation Notes

These patterns need to be handled in `syntax.js` via the `the.*` proxy. Each pattern requires special handling since Lingo uses different delimiters (comma for items, carriage return for lines, space for words).

Current workaround: Use `itemOf(tStr).count`, `lineOf(tStr).count`, etc. to get counts. Use array indexing for "last" access.
