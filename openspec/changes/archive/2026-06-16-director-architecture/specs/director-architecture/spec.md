## MODIFIED Requirements

### Requirement: Director runtime SHALL be organized into four modules

The Director runtime SHALL be organized into four distinct modules with clear responsibilities, each as a folder with atomic files:

| Module | Visibility | Purpose | Location |
|--------|-----------|---------|----------|
| `api/` | Public | Director API surface (constants, globals, functions) | `apps/client/src/director/api/` |
| `core/` | Private | Implementation details (classes, loader, registries) | `apps/client/src/director/core/` |
| `runtime/` | Public | Browser plugin replacement (custom elements, mount, run) | `apps/client/src/director/runtime/` |
| `syntax/` | Public | Lingo syntax helpers (the proxy, chunk expressions) | `apps/client/src/director/syntax/` |

Each module SHALL have:
- Individual files per method/class
- Co-located tests in `__tests__/` subfolder
- Barrel export via `index.js`

#### Scenario: Module separation
- **WHEN** importing Director API functions
- **THEN** use `import { voidP, list, member } from "../../director"` (barrel export from index.js)

#### Scenario: Private implementation not exported
- **WHEN** code tries to import from core
- **THEN** it uses `import { List } from "../../director/core"` (not exported from main index.js)

#### Scenario: Atomic file structure
- **WHEN** looking for abs() implementation
- **THEN** it exists at `api/abs.js` with test at `api/__tests__/abs.test.js`

### Requirement: api/ SHALL contain Director API surface

`api/` SHALL contain all Director API elements documented in the Director MX 2004 reference, organized as atomic files.

**Constants** (in `api/constants.js`):
- `VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, `QUOTE`

**Globals** (in `api/globals.js`):
- `_global`, `_movie`, `_player`, `_mouse`, `_key`, `_sound`, `_system`, `_window`

**Functions** (each in own file):
- Type checks: `voidP()`, `integerP()`, `floatP()`, `listP()`, `objectP()`, `stringP()`, `symbolP()`, `ilk()`
- Data types: `list()`, `propList()`, `point()`, `rect()`, `color()`, `symbol()`
- Conversions: `integer()`, `float()`, `string()`, `value()`, `charToNum()`, `numToChar()`
- Math: `abs()`, `sqrt()`, `atan()`, `tan()`, `log()`, `power()`, `max()`, `min()`, `cos()`, `sin()`, `random()`
- Member access: `member()`, `script()`, `sprite()`, `castLib()`
- Network: `getNetText()`, `postNetText()`, `netDone()`, `netError()`, `netTextResult()`, `preloadNetThing()`
- All other Director API functions from the reference

#### Scenario: api.js exports Director API
- **WHEN** Lingo code calls `voidP(x)`
- **THEN** it imports from `api/void-p.js` via barrel export

#### Scenario: api.js exports globals
- **WHEN** Lingo code accesses `_global.gVar`
- **THEN** it imports `_global` from `api/globals.js`

### Requirement: Spec files SHALL contain full Director MX 2004 documentation

Each method and property spec file SHALL contain the complete documentation from the Director MX 2004 reference, not just line references. This ensures implementations match the official specification exactly.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Spec file structure**:
```markdown
## <name>

**Source**: `docs/drmx2004_scripting_ref.txt` lines <start>-<end>

### Usage
<exact Lingo syntax from documentation>

### Description
<exact description text from documentation>

### Parameters
<exact parameter descriptions from documentation, or "None.">

### Returns
<return value description if documented>

### Example
<exact example code from documentation - used for test generation>

### See also
<related methods/properties from documentation>

### Implementation
- **File**: `apps/client/src/director/<module>/<file>.js`
- **Test**: `apps/client/src/director/<module>/__tests__/<file>.test.js`
- **Dependencies**: <list of core classes or other API functions needed>
```

**Why full documentation?**
- Prevents AI hallucination of behavior
- Ensures exact match with Director MX 2004
- Provides examples for test generation
- Allows verification of implementation correctness

#### Scenario: Method spec contains full documentation
- **WHEN** creating spec for `abs()` method
- **THEN** spec includes exact Usage, Description, Parameters, Example from lines 11767-11797

#### Scenario: Property spec contains full documentation
- **WHEN** creating spec for `sprite.blend` property
- **THEN** spec includes exact Usage, Description from documentation
