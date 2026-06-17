## ADDED Requirements

### Requirement: _movie properties SHALL be documented and implemented

The `_movie` object SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `castLib` | Object | Cast libraries (1-indexed) | Implemented |
| `frame` | Integer | Current frame number | Implemented |
| `frameTempo` | Integer | Current tempo (frames/sec) | Implemented |
| `sprite` | Object | Sprites (1-indexed) | Implemented |
| `stage` | Object | Stage dimensions | Implemented |
| `moviePath` | String | Path to movie file | Stub |
| `actorList` | List | List of active scripts | Stub |
| `timeoutList` | Object | Active timeouts | Implemented |
| `displayTemplate` | Member | Display template member | Stub |
| `preLoadMode` | Boolean | Preload mode flag | Stub |

#### Scenario: _movie.frame returns current frame
- **WHEN** `_movie.frame` is accessed
- **THEN** returns current frame number (integer >= 1)

#### Scenario: _movie.moviePath returns path
- **WHEN** `_movie.moviePath` is accessed
- **THEN** returns string path to movie file

### Requirement: _player properties SHALL be documented and implemented

The `_player` object SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `alertHook` | Integer | Alert hook handler | Stub |
| `runMode` | String | Run mode ("Plugin", "Standalone") | Stub |
| `environment` | Object | Environment info | Implemented |
| `debugPlaybackEnabled` | Boolean | Debug playback flag | Stub |
| `exitLock` | Boolean | Exit lock flag | Stub |
| `xtraList` | List | Available Xtras | Stub |
| `transitionXtraList` | List | Transition Xtras | Stub |
| `mediaXtraList` | List | Media Xtras | Stub |
| `scriptingXtraList` | List | Scripting Xtras | Stub |
| `sound` | Sound | Sound object | Implemented |
| `window` | Object | Windows (1-indexed) | Stub |
| `windowList` | List | Window list | Stub |
| `parameters` | PropList | External parameters | Stub |

#### Scenario: _player.runMode returns mode
- **WHEN** `_player.runMode` is accessed
- **THEN** returns `"Plugin"` for browser mode

#### Scenario: _player.debugPlaybackEnabled returns flag
- **WHEN** `_player.debugPlaybackEnabled` is accessed
- **THEN** returns boolean

### Requirement: _mouse properties SHALL be documented and implemented

The `_mouse` object SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `mouseH` | Integer | Horizontal mouse position | Implemented |
| `mouseV` | Integer | Vertical mouse position | Implemented |
| `mouseLoc` | Point | Mouse location as Point | Implemented |
| `clickOn` | Integer | Sprite clicked on | Stub |
| `clickLoc` | Point | Click location | Stub |
| `doubleClick` | Boolean | Double click detected | Stub |
| `lastClick` | Integer | Last click time | Stub |
| `lastRoll` | Integer | Last roll time | Stub |
| `rightMouseDown` | Boolean | Right mouse button state | Stub |

#### Scenario: _mouse.doubleClick returns state
- **WHEN** `_mouse.doubleClick` is accessed
- **THEN** returns boolean indicating double click

#### Scenario: _mouse.clickOn returns sprite number
- **WHEN** `_mouse.clickOn` is accessed
- **THEN** returns sprite number or 0

### Requirement: _key properties SHALL be documented and implemented

The `_key` object SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `keyCode` | Integer | Last key code pressed | Stub |
| `key` | String | Last key pressed | Stub |
| `shiftDown` | Boolean | Shift key state | Stub |
| `controlDown` | Boolean | Control key state | Stub |
| `optionDown` | Boolean | Option/Alt key state | Stub |
| `commandDown` | Boolean | Command key state | Stub |
| `focusWindow` | Window | Focused window | Stub |

#### Scenario: _key.keyCode returns key code
- **WHEN** `_key.keyCode` is accessed
- **THEN** returns integer key code

#### Scenario: _key.shiftDown returns state
- **WHEN** `_key.shiftDown` is accessed
- **THEN** returns boolean

### Requirement: _system properties SHALL be documented and implemented

The `_system` object SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `milliseconds` | Integer | Milliseconds since midnight | Stub |
| `timer` | Integer | System timer | Stub |
| `platform` | String | Platform identifier | Stub |
| `colorDepth` | Integer | Display color depth | Stub |
| `randomSeed` | Integer | Random seed value | Stub |
| `floatPrecision` | Integer | Float precision digits | Stub |
| `applicationPath` | String | Application path | Stub |
| `applicationName` | String | Application name | Stub |
| `productName` | String | Product name | Stub |
| `productVersion` | String | Product version | Stub |
| `serialNumber` | String | Serial number | Stub |
| `userName` | String | User name | Stub |
| `organizationName` | String | Organization name | Stub |

#### Scenario: _system.milliseconds returns time
- **WHEN** `_system.milliseconds` is accessed
- **THEN** returns milliseconds since midnight

#### Scenario: _system.platform returns platform
- **WHEN** `_system.platform` is accessed
- **THEN** returns platform string (e.g., "Win32", "MacIntel")

### Requirement: _window properties SHALL be documented and implemented

The `_window` object SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `title` | String | Window title | Stub |
| `visible` | Boolean | Visibility state | Stub |
| `loc` | Point | Window location | Stub |
| `rect` | Rect | Window rectangle | Stub |
| `width` | Integer | Window width | Stub |
| `height` | Integer | Window height | Stub |
| `bgColor` | Color | Background color | Stub |
| `resizable` | Boolean | Resizable flag | Stub |
| `closeBox` | Boolean | Has close box | Stub |
| `titleBar` | Boolean | Has title bar | Stub |

#### Scenario: _window.title returns title
- **WHEN** `_window.title` is accessed
- **THEN** returns window title string

### Requirement: Member properties SHALL be documented

Member objects SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `name` | String | Member name | Implemented |
| `number` | Integer | Member number | Implemented |
| `type` | Symbol | Member type | Implemented |
| `castLibNum` | Integer | Cast library number | Implemented |
| `width` | Integer | Member width | Implemented |
| `height` | Integer | Member height | Implemented |
| `rect` | Rect | Member rectangle | Implemented |
| `regPoint` | Point | Registration point | Stub |
| `fontSize` | Integer | Font size (text members) | Stub |
| `font` | String | Font name (text members) | Stub |
| `text` | String | Text content (text members) | Stub |
| `picture` | Image | Image data (bitmap members) | Stub |
| `ink` | Integer | Ink effect | Stub |

#### Scenario: member.name returns name
- **WHEN** `member("Logo").name` is accessed
- **THEN** returns `"Logo"`

#### Scenario: member.type returns type symbol
- **WHEN** `member("Logo").type` is accessed
- **THEN** returns `Symbol.for("bitmap")`

### Requirement: Sprite properties SHALL be documented

Sprite objects SHALL provide the following properties:

| Property | Type | Description | Status |
|----------|------|-------------|--------|
| `num` | Integer | Sprite number | Stub |
| `member` | Member | Cast member | Stub |
| `memberNum` | Integer | Member number | Stub |
| `castLib` | Integer | Cast library | Stub |
| `loc` | Point | Location | Stub |
| `locH` | Integer | Horizontal location | Stub |
| `locV` | Integer | Vertical location | Stub |
| `rect` | Rect | Bounding rectangle | Stub |
| `width` | Integer | Width | Stub |
| `height` | Integer | Height | Stub |
| `ink` | Integer | Ink effect | Stub |
| `blend` | Integer | Blend level (0-100) | Stub |
| `visible` | Boolean | Visibility | Stub |
| `foreColor` | Integer | Foreground color | Stub |
| `backColor` | Integer | Background color | Stub |
| `rotation` | Number | Rotation angle | Stub |

#### Scenario: sprite.locH returns horizontal position
- **WHEN** `sprite(1).locH` is accessed
- **THEN** returns integer horizontal position

### Requirement: Point and Rect properties SHALL be documented

Point objects SHALL provide:
- `locH` / `x` - Horizontal component
- `locV` / `y` - Vertical component

Rect objects SHALL provide:
- `left` - Left edge
- `top` - Top edge
- `right` - Right edge
- `bottom` - Bottom edge
- `width` - Width (right - left)
- `height` - Height (bottom - top)

#### Scenario: point.locH returns horizontal
- **WHEN** `point(10, 20).locH` is accessed
- **THEN** returns `10`

#### Scenario: rect.width returns width
- **WHEN** `rect(0, 0, 100, 50).width` is accessed
- **THEN** returns `100`
