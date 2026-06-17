## ADDED Requirements

### Requirement: Member access functions SHALL be implemented in api/ directory

The Director MX 2004 member access functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/member.js`
- `apps/client/src/director/api/sprite.js`
- `apps/client/src/director/api/castLib.js`
- `apps/client/src/director/api/script.js`
- `apps/client/src/director/api/point.js`
- `apps/client/src/director/api/rect.js`
- `apps/client/src/director/api/color.js`

**Tests**:
- `apps/client/src/director/api/__tests__/member.test.js`
- `apps/client/src/director/api/__tests__/sprite.test.js`
- `apps/client/src/director/api/__tests__/castLib.test.js`
- `apps/client/src/director/api/__tests__/script.test.js`
- `apps/client/src/director/api/__tests__/point.test.js`
- `apps/client/src/director/api/__tests__/rect.test.js`
- `apps/client/src/director/api/__tests__/color.test.js`

#### Scenario: Member access functions are importable
- **WHEN** code imports `import { member, sprite, castLib } from "../../director/api"`
- **THEN** all member access functions are available

#### Scenario: Member access functions integrate with core classes
- **WHEN** member access functions are called
- **THEN** they return Ref instances from core

### Requirement: member() SHALL access cast member

The `member()` function SHALL return a cast member by number or name.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 20436-20482

#### Scenario: member accesses by number
- **WHEN** `member(1)` is called
- **THEN** returns first cast member

#### Scenario: member accesses by name
- **WHEN** `member("myBitmap")` is called
- **THEN** returns cast member with that name

#### Scenario: member accesses from specific cast library
- **WHEN** `member(1, 2)` is called
- **THEN** returns first member from cast library 2

### Requirement: sprite() SHALL access sprite

The `sprite()` function SHALL return a sprite by channel number.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28039-28063

#### Scenario: sprite accesses by channel
- **WHEN** `sprite(1)` is called
- **THEN** returns sprite in channel 1

### Requirement: castLib() SHALL access cast library

The `castLib()` function SHALL return a cast library by number or name.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 13143-13172

#### Scenario: castLib accesses by number
- **WHEN** `castLib(1)` is called
- **THEN** returns first cast library

#### Scenario: castLib accesses by name
- **WHEN** `castLib("Internal")` is called
- **THEN** returns cast library with that name

### Requirement: script() SHALL access script member

The `script()` function SHALL return a script cast member.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 26746-26783

#### Scenario: script accesses script member
- **WHEN** `script("myBehavior")` is called
- **THEN** returns script member with that name

### Requirement: point() SHALL create point

The `point()` function SHALL create a new Point instance.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 23523-23581

#### Scenario: point creates point
- **WHEN** `point(100, 200)` is called
- **THEN** returns Point with locH=100, locV=200

### Requirement: rect() SHALL create rect

The `rect()` function SHALL create a new Rect instance.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 25756-25827

#### Scenario: rect creates rect
- **WHEN** `rect(10, 20, 100, 200)` is called
- **THEN** returns Rect with left=10, top=20, right=100, bottom=200

### Requirement: color() SHALL create color

The `color()` function SHALL create a new Color instance.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 13750-13791

#### Scenario: color creates color
- **WHEN** `color(255, 128, 0)` is called
- **THEN** returns Color with red=255, green=128, blue=0

### Requirement: All member access functions SHALL match Director MX 2004 exactly

Each member access function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `member.md` - Access cast member
- `sprite.md` - Access sprite
- `castLib.md` - Access cast library
- `script.md` - Access script
- `point.md` - Create point
- `rect.md` - Create rect
- `color.md` - Create color

#### Scenario: All functions implemented
- **WHEN** any member access function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
