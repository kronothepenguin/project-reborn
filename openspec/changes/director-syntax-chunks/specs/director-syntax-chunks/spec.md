## ADDED Requirements

### Requirement: Chunk helpers SHALL be implemented in syntax/ directory

The Director chunk expression helpers SHALL be implemented in `apps/client/src/director/syntax/` with each helper in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 11: Keywords

**Files**:
- `apps/client/src/director/syntax/char.js`
- `apps/client/src/director/syntax/item.js`
- `apps/client/src/director/syntax/line.js`
- `apps/client/src/director/syntax/word.js`

**Tests**:
- `apps/client/src/director/syntax/__tests__/char.test.js`
- `apps/client/src/director/syntax/__tests__/item.test.js`
- `apps/client/src/director/syntax/__tests__/line.test.js`
- `apps/client/src/director/syntax/__tests__/word.test.js`

#### Scenario: Chunk helpers are importable
- **WHEN** code imports `import { char, item, line, word } from "../../director/syntax"`
- **THEN** all chunk helpers are available

### Requirement: char() SHALL access characters

The `char()` helper SHALL access characters in strings using 1-based indexing.

#### Scenario: char returns character at position
- **WHEN** `char(3, "hello")` is called
- **THEN** returns `"l"`

#### Scenario: char with range
- **WHEN** `charRange(2, 4, "hello")` is called
- **THEN** returns `"ell"`

### Requirement: item() SHALL access items

The `item()` helper SHALL access items in delimited strings using 1-based indexing.

#### Scenario: item returns item at position
- **WHEN** `item(2, "a,b,c")` is called
- **THEN** returns `"b"`

#### Scenario: item uses the.itemDelimiter
- **WHEN** `the.itemDelimiter = ";"` and `item(2, "a;b;c")` is called
- **THEN** returns `"b"`

### Requirement: line() SHALL access lines

The `line()` helper SHALL access lines in strings using 1-based indexing.

#### Scenario: line returns line at position
- **WHEN** `line(2, "a\nb\nc")` is called
- **THEN** returns `"b"`

### Requirement: word() SHALL access words

The `word()` helper SHALL access words in strings using 1-based indexing.

#### Scenario: word returns word at position
- **WHEN** `word(2, "hello world test")` is called
- **THEN** returns `"world"`

### Requirement: All chunk helpers SHALL match Director MX 2004 exactly

Each chunk helper SHALL behave exactly as documented in Director MX 2004.

#### Scenario: Helpers match Director behavior
- **WHEN** any chunk helper is called
- **THEN** behavior matches Director MX 2004 documentation exactly
