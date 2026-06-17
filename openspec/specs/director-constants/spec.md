## ADDED Requirements

### Requirement: VOID constant SHALL be defined

The runtime SHALL export `VOID` representing an undefined value.

**Lingo**: `VOID`
**JavaScript**: `void 0` (undefined)

#### Scenario: VOID equals undefined
- **WHEN** `VOID === undefined` is evaluated
- **THEN** returns `true`

#### Scenario: voidP checks for VOID
- **WHEN** `voidP(VOID)` is called
- **THEN** returns `true`

### Requirement: EMPTY constant SHALL be defined

The runtime SHALL export `EMPTY` representing an empty string.

**Lingo**: `EMPTY`
**JavaScript**: `""`

#### Scenario: EMPTY equals empty string
- **WHEN** `EMPTY === ""` is evaluated
- **THEN** returns `true`

### Requirement: PI constant SHALL be defined

The runtime SHALL export `PI` representing the mathematical constant π.

**Lingo**: `PI`
**JavaScript**: `Math.PI`

#### Scenario: PI equals Math.PI
- **WHEN** `PI === Math.PI` is evaluated
- **THEN** returns `true`

### Requirement: String constants SHALL be defined

The runtime SHALL export the following string constants:

| Constant | Value | Description |
|----------|-------|-------------|
| `RETURN` | `"\r"` | Carriage return |
| `SPACE` | `" "` | Space character |
| `TAB` | `"\t"` | Tab character |
| `QUOTE` | `'"'` | Double quote character |
| `ENTER` | `"\r"` | Enter key (same as RETURN) |

#### Scenario: RETURN is carriage return
- **WHEN** `RETURN === "\r"` is evaluated
- **THEN** returns `true`

#### Scenario: SPACE is space character
- **WHEN** `SPACE === " "` is evaluated
- **THEN** returns `true`

### Requirement: Boolean constants SHALL be defined

The runtime SHALL support TRUE and FALSE values (JavaScript booleans).

**Lingo**: `TRUE`, `FALSE`
**JavaScript**: `true`, `false`

Note: Lingo's TRUE/FALSE are case-insensitive and may appear as `true`/`false` in code.

#### Scenario: TRUE equals true
- **WHEN** `TRUE === true` is evaluated
- **THEN** returns `true`

### Requirement: Symbol constants SHALL be supported

The runtime SHALL support Lingo symbol literals using `Symbol.for()`.

**Lingo**: `#symbolName`
**JavaScript**: `Symbol.for("symbolName")`

#### Scenario: symbol creates Symbol.for
- **WHEN** `symbol("openConnection")` is called
- **THEN** returns `Symbol.for("openConnection")`

#### Scenario: symbolP checks for symbol
- **WHEN** `symbolP(Symbol.for("test"))` is called
- **THEN** returns `true`
