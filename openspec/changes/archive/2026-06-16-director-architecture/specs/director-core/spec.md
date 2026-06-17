## ADDED Requirements

### Requirement: Director core SHALL be organized as atomic files in core/ directory

The Director core (private API) SHALL be organized as individual files in `apps/client/src/director/core/`, with each class having its own file. Tests SHALL be co-located in `apps/client/src/director/core/__tests__/`.

**File structure:**
```
apps/client/src/director/core/
├── __tests__/
│   ├── list.test.js
│   ├── prop-list.test.js
│   ├── point.test.js
│   ├── rect.test.js
│   ├── color.test.js
│   ├── member-ref.test.js
│   ├── sprite-ref.test.js
│   ├── movie-ref.test.js
│   ├── player-ref.test.js
│   ├── sound-ref.test.js
│   ├── cast-library-ref.test.js
│   └── ...
├── list.js
├── prop-list.js
├── point.js
├── rect.js
├── color.js
├── member-ref.js
├── sprite-ref.js
├── movie-ref.js
├── player-ref.js
├── sound-ref.js
├── cast-library-ref.js
├── index.js (barrel export)
└── ...
```

#### Scenario: Core classes are importable from barrel export
- **WHEN** code imports `import { List, PropList, Point } from "../director/core"`
- **THEN** all core classes are available

#### Scenario: Core tests are co-located
- **WHEN** looking for List class tests
- **THEN** they exist at `core/__tests__/list.test.js`

### Requirement: List class SHALL implement all methods from Director MX 2004

The `List` class SHALL implement all linear list methods documented in Director MX 2004.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "List" methods in Chapter 12 (lines 11733-31000)

**Methods to implement** (each as a separate task):
- `add(value)` - Add value to end of list (or sorted position)
- `addAt(position, value)` - Insert value at position
- `append(value)` - Append value to end
- `count` - Property returning list length
- `deleteAt(position)` - Delete item at position
- `deleteOne(value)` - Delete first occurrence of value
- `deleteProp(item)` - Delete property at index
- `duplicate()` - Return copy of list
- `getAt(position)` - Get item at position (1-indexed)
- `getaProp(position)` - Get item at position (alias)
- `getLast()` - Get last item
- `getOne(value)` - Get position of first occurrence
- `getPos(value)` - Get position of value
- `setAt(position, value)` - Set item at position
- `sort()` - Sort list in place

#### Scenario: List is 1-indexed
- **WHEN** `list.getAt(1)` is called on `List(10, 20, 30)`
- **THEN** returns `10`

#### Scenario: List.add appends to unsorted list
- **WHEN** `list.add(4)` is called on `List(1, 2, 3)`
- **THEN** list becomes `[1, 2, 3, 4]`

#### Scenario: List.addAt inserts at position
- **WHEN** `list.addAt(2, 99)` is called on `List(1, 2, 3)`
- **THEN** list becomes `[1, 99, 2, 3]`

### Requirement: PropList class SHALL implement all methods from Director MX 2004

The `PropList` class SHALL implement all property list methods documented in Director MX 2004.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "PropList" or property list methods in Chapter 12

**Methods to implement** (each as a separate task):
- `addProp(property, value)` - Add property/value pair
- `count` - Property returning number of pairs
- `deleteAt(position)` - Delete pair at position
- `deleteOne(value)` - Delete first pair with value
- `deleteProp(property)` - Delete pair by property
- `duplicate()` - Return copy of proplist
- `findPos(property)` - Find position of property
- `getaProp(property)` - Get value by property
- `getLast()` - Get last value
- `getOne(property)` - Get position of property
- `getPos(value)` - Get position of value
- `getProp(property)` - Get value by property (throws if not found)
- `getPropAt(index)` - Get value at index
- `setaProp(property, value)` - Set value by property (adds if not exists)
- `setAt(position, value)` - Set value at position
- `sort()` - Sort by property names

#### Scenario: PropList uses symbols as keys
- **WHEN** `proplist.getaProp(Symbol.for("name"))` is called
- **THEN** returns the value associated with #name symbol

#### Scenario: PropList.setaProp adds new property
- **WHEN** `proplist.setaProp(Symbol.for("new"), 42)` is called on empty PropList
- **THEN** PropList contains one pair: #new: 42

### Requirement: Point class SHALL implement all methods from Director MX 2004

The `Point` class SHALL implement point operations documented in Director MX 2004.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "point" in Chapter 12 and Chapter 14

**Properties and methods to implement** (each as a separate task):
- `locH` / `x` - Horizontal coordinate
- `locV` / `y` - Vertical coordinate
- `inside(rect)` - Check if point is inside rectangle

#### Scenario: Point has locH and locV properties
- **WHEN** `point.locH` is accessed on Point(100, 200)
- **THEN** returns `100`

### Requirement: Rect class SHALL implement all methods from Director MX 2004

The `Rect` class SHALL implement rectangle operations documented in Director MX 2004.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "rect" in Chapter 12 and Chapter 14

**Properties to implement** (each as a separate task):
- `left` - Left edge
- `top` - Top edge
- `right` - Right edge
- `bottom` - Bottom edge

#### Scenario: Rect has four edge properties
- **WHEN** `rect.left` is accessed on Rect(10, 20, 100, 200)
- **THEN** returns `10`

### Requirement: Color class SHALL implement all methods from Director MX 2004

The `Color` class SHALL implement color operations documented in Director MX 2004.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "color" in Chapter 12

**Properties to implement** (each as a separate task):
- `red` - Red component (0-255)
- `green` - Green component (0-255)
- `blue` - Blue component (0-255)

#### Scenario: Color has RGB properties
- **WHEN** `color.red` is accessed on Color(255, 128, 0)
- **THEN** returns `255`

### Requirement: MemberRef class SHALL replace Member for API returns

The `MemberRef` class SHALL represent cast member references returned by the `member()` function. This replaces the previous `Member` class for API returns.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "member" properties in Chapter 14 (lines 31404+)

**Properties to implement** (each as a separate task):
- `name` - Member name
- `number` - Member number in cast
- `type` - Member type symbol
- `castLibNum` - Cast library number
- `text` - Text content (for text members)
- `font` - Font name
- `fontSize` - Font size
- `picture` - Picture data
- `rect` - Member rectangle
- `ink` - Ink effect
- `width` - Member width
- `height` - Member height
- `regPoint` - Registration point

**Methods to implement** (each as a separate task):
- `duplicate()` - Duplicate member
- `erase()` - Erase member content

#### Scenario: MemberRef is returned by member() function
- **WHEN** `member("test")` is called
- **THEN** returns a MemberRef instance

### Requirement: SpriteRef class SHALL replace Sprite for API returns

The `SpriteRef` class SHALL represent sprite references returned by the `sprite()` function.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "sprite" properties in Chapter 14

**Properties to implement** (each as a separate task):
- `num` - Sprite channel number
- `member` - Associated member
- `memberNum` - Member number
- `castLib` - Cast library number
- `locH` - Horizontal location
- `locV` - Vertical location
- `loc` - Location as Point
- `ink` - Ink effect
- `blend` - Blend percentage
- `visible` - Visibility flag
- `foreColor` - Foreground color
- `backColor` - Background color
- `rect` - Sprite rectangle

#### Scenario: SpriteRef is returned by sprite() function
- **WHEN** `sprite(1)` is called
- **THEN** returns a SpriteRef instance

### Requirement: MovieRef class SHALL represent _movie object

The `MovieRef` class SHALL represent the movie singleton accessible as `_movie`.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "_movie" in Chapter 5 and Chapter 14

**Properties to implement** (each as a separate task):
- `castLib` - Cast libraries (1-indexed)
- `frame` - Current frame
- `frameTempo` - Current tempo
- `sprite` - Sprites (1-indexed)
- `stage` - Stage dimensions
- `name` - Movie name
- `path` - Movie path
- `moviePath` - Full movie path
- `actorList` - Active behavior list
- `lastChannel` - Last sound channel
- `keyboardFocusSprite` - Keyboard focus sprite
- `xtraList` - Loaded Xtras

**Methods to implement** (each as a separate task):
- `go(frame)` - Go to frame
- `halt()` - Stop movie
- `puppetSprite(channel, flag)` - Puppet a sprite
- `puppetTempo(tempo)` - Set tempo
- `rollOver(sprite)` - Check rollover
- `stopEvent()` - Stop current event
- `updateStage()` - Update stage display

#### Scenario: MovieRef is accessible as _movie
- **WHEN** `_movie.frame` is accessed
- **THEN** returns current frame number

### Requirement: PlayerRef class SHALL represent _player object

The `PlayerRef` class SHALL represent the player singleton accessible as `_player`.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "_player" in Chapter 5 and Chapter 14

**Properties to implement** (each as a separate task):
- `alertHook` - Alert handler
- `debugPlaybackEnabled` - Debug flag
- `editShortcutsEnabled` - Edit shortcuts flag
- `exitLock` - Exit lock flag
- `parameters` - External parameters
- `runMode` - Run mode string
- `sound` - Sound object
- `xtra` - Xtras (1-indexed)
- `xtraList` - Xtra list

**Methods to implement** (each as a separate task):
- `externalParamValue(name)` - Get external parameter
- `getPref(name)` - Get preference
- `setPref(name, value)` - Set preference
- `quit()` - Quit player

#### Scenario: PlayerRef is accessible as _player
- **WHEN** `_player.runMode` is accessed
- **THEN** returns `"Plugin"` for browser mode

### Requirement: SoundRef class SHALL represent _sound object

The `SoundRef` class SHALL represent the sound singleton accessible as `_sound`.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "_sound" in Chapter 5 and Chapter 14

**Properties to implement** (each as a separate task):
- `soundEnabled` - Sound enabled flag

**Methods to implement** (each as a separate task):
- `beep()` - Play system beep

#### Scenario: SoundRef is accessible as _sound
- **WHEN** `_sound.beep()` is called
- **THEN** triggers system beep sound

### Requirement: CastLibraryRef class SHALL represent cast library references

The `CastLibraryRef` class SHALL represent cast library references returned by `castLib()`.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "castLib" in Chapter 14

**Properties to implement** (each as a separate task):
- `name` - Cast library name
- `number` - Cast library number
- `member` - Members (1-indexed, read-only)
- `fileName` - External cast file name
- `preLoadMode` - Preload mode (0, 1, or 2)

#### Scenario: CastLibraryRef is returned by castLib() function
- **WHEN** `castLib(1)` is called
- **THEN** returns a CastLibraryRef instance
