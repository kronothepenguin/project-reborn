# Plan: LingoScript Translation & Director Runtime

## Overview

Two interdependent changes:

1. **`implement-director-runtime`** - Documents and implements the Director API
2. **`translate-lingoscript-to-javascript`** - Translates LingoScript using the Director API spec

The Director runtime spec must exist **before** translation begins, so translators know what functions are Director API (import from `"../../director"`) vs movie script handlers (call via `_director.funcName()`).

---

## Change 1: implement-director-runtime

### Purpose

Document the complete Director API surface and implement missing functionality incrementally.

### Specs

#### `director-api-functions`

Lists all Director API functions with:
- Function signature
- Behavior description
- Implementation status (implemented/stub/missing)
- Example usage

**Source**: Current exports from `runtime.js`, `syntax.js`, `keywords.js` (~80 functions)

**Categories**:
- Type checks: `ilk()`, `voidP()`, `objectP()`, `listP()`, `integerP()`, `floatP()`, `stringP()`, `symbolP()`
- Data types: `list()`, `propList()`, `point()`, `rect()`, `color()`, `symbol()`
- Conversions: `integer()`, `float()`, `string()`, `value()`, `charToNum()`, `numToChar()`
- Chunk helpers: `chars()`, `charOf()`, `itemOf()`, `lineOf()`, `wordOf()`
- Math: `cos()`, `sin()`, `random()`, `abs()`, `min()`, `max()`, `power()`
- Constants: `VOID`, `EMPTY`, `RETURN`, `PI`, `SPACE`, `TAB`, `QUOTE`
- Objects: `_global`, `_movie`, `_player`, `_sound`, `_system`, `_window`, `_key`, `_mouse`
- Member access: `member()`, `script()`, `sprite()`, `field()`, `castLib()`
- Network: `getNetText()`, `postNetText()`, `netDone()`, `netError()`, `netTextResult()`
- Stubs: `beep()`, `cursor()`, `date()`, `sound()`, `xtra()`, etc.

#### `director-the-properties`

Documents all `the` property access patterns.

**Found 56 unique patterns across codebase**:

**Implemented in runtime** (19):
- `the alertHook`, `the environment`, `the frame`, `the itemDelimiter`
- `the keyboardFocusSprite`, `the lastChannel`, `the longTime`
- `the milliSeconds`, `the mouseH`, `the mouseLoc`, `the mouseV`
- `the numberOfCastLibs`, `the runMode`
- `the stageBottom`, `the stageLeft`, `the stageRight`, `the stageTop`

**Missing from runtime** (37):
- `the browser`, `the clickOn`, `the colorDepth`, `the commandDown`
- `the content`, `the date`, `the debugPlaybackEnabled`, `the doorbell`
- `the doubleClick`, `the download`, `the editShortcutsEnabled`, `the exitLock`
- `the floatPrecision`, `the frameTempo`, `the key`, `the keyCode`
- `the model`, `the moviePath`, `the optionDown`, `the paramCount`
- `the parameters`, `the platform`, `the randomSeed`, `the remote`
- `the reply`, `the rollover`, `the selEnd`, `the selStart`
- `the server`, `the shiftDown`, `the stage`, `the time`
- `the timer`, `the transaction`, `the xtraList`

**Compound expressions** (need parsing):
- `the last char/item/line/word`
- `the long time/date`
- `the number of items/lines/chars/words`

#### `director-syntax-helpers`

Documents Lingo syntax patterns that need runtime support:

**Chunk expressions**:
```lingo
chars(str, i, j)           → charOf(str).slice(i, j)
char str[i]                → charOf(str)[i]
item i of str              → itemOf(str)[i]
line i of str              → lineOf(str)[i]
word i of str              → wordOf(str)[i]
the number of items in str → itemOf(str).count
```

**`the` property access**:
```lingo
the keyCode                → the.keyCode
set the selStart to X      → the.selStart = X
the milliSeconds           → the.milliSeconds
```

**Operators**:
```lingo
str1 & str2                → str1 + str2
"a" && "b"                 → `a b`
<>                         → !==
and                        → &&
or                         → ||
not                        → !
```

#### `director-core-classes`

Documents core Director classes:

- `List` - 1-indexed linear list with Proxy wrapper
- `PropList` - Key-value property list with Proxy wrapper
- `Member` - Cast member reference
- `Movie` - Movie object with cast libraries, sprites, frames
- `Player` - Player object with preferences, sound
- `Sprite` - Sprite reference
- `Rect`, `Point`, `Color` - Geometric types
- `CastLibrary` - Cast library container
- `ScriptRef`, `ScriptObject` - Script references and instances

### Tasks

1. **Document Director API**
   - [ ] 1.1 Create `director-api-functions` spec with all ~80 functions
   - [ ] 1.2 Create `director-the-properties` spec with all 56 patterns
   - [ ] 1.3 Create `director-syntax-helpers` spec with chunk expressions, operators
   - [ ] 1.4 Create `director-core-classes` spec with class documentation

2. **Implement missing `the` properties**
   - [ ] 2.1 Implement `the keyCode`, `the selStart`, `the selEnd` (needed for vertical slice)
   - [ ] 2.2 Implement other high-frequency `the` properties
   - [ ] 2.3 Implement compound expressions (`the last char`, `the number of`)

3. **Implement stub functions**
   - [ ] 3.1 Implement `max()`, `min()`, `abs()` (math functions)
   - [ ] 3.2 Implement `date()`, `time()` (date/time functions)
   - [ ] 3.3 Implement other stubs as needed by translation

4. **Implement member type creators**
   - [ ] 4.1 Implement `createTextMember()` for field members
   - [ ] 4.2 Implement `createSoundMember()` for sound members
   - [ ] 4.3 Implement `createPaletteMember()` for palette members

---

## Change 2: translate-lingoscript-to-javascript

### Purpose

Translate all LingoScript files to JavaScript following the conventions defined in specs.

### Specs

#### `lingo-translation-conventions`

**Structure**:
- Every script → factory function: `export default function() { return { ... }; }`
- Properties → `pFoo: VOID` in return object
- Handlers → method shorthand: `handler() { }`
- Globals → `_global.gVar = _global.gVar ?? VOID`

**Import resolution** (3-tier rule):
1. **Director API** (in `director-api-functions` spec) → `import from "../../director"`
2. **Movie script handlers** (not in Director API) → `_director.funcName()`
3. **Cast-local functions** → `import from "./local-file.js"`

**Data types**:
- `#symbol` → `Symbol.for("symbol")`
- `[:]` → `propList()`
- `[]` → `list()`
- `VOID` → `VOID` (imported)

**Operators**:
- `&` → `+`
- `&&` → template literal with space
- `<>` → `!==`
- `and`/`or`/`not` → `&&`/`||`/`!`

**Control flow**:
- `repeat with i = 1 to n` → `for (let i = 1; i <= n; i++)`
- `repeat with x in list` → `for (const x of list)`
- `case x of ... otherwise:` → `switch(x) { ... default: }`
- `the paramCount` → `arguments.length`
- `param(n)` → `arguments[n - 1]`

**Keyword conflicts**:
- `delete`, `try`, `catch` → `deleteFn`, `tryFn`, `catchFn`

**Verification**:
- Handler count must match
- Property count must match
- Global declarations must match

#### `cast-registration`

**Structure**:
- Each cast has `index.js` with `registerCast(name, members[])`
- Members in `Members.csv` Number column order

**Member types**:
- Script → `createScriptMember(name, scriptType, factory)`
- Field → `createFieldMember(name, content)` with `?raw` import
- Bitmap → `createBitmapMember(name, src)` with PNG import

**Script type determination**:
- `*Behavior` → `BEHAVIOR_SCRIPT`
- `*API` → `MOVIE_SCRIPT`
- `*Class`, `*Instance` → `PARENT_SCRIPT`
- Other → Manual determination (document in task)

#### `script-type-determination`

Documents how to determine script types:

**Patterns** (from fuse_client):
- Ends in "Behavior" → `BEHAVIOR_SCRIPT`
- Ends in "API" → `MOVIE_SCRIPT`
- Ends in "Class" or "Instance" → `PARENT_SCRIPT`

**Ambiguous cases**:
- No `me` parameter → likely `MOVIE_SCRIPT`
- Has `me` parameter → `BEHAVIOR_SCRIPT` or `PARENT_SCRIPT`
- Utility libraries → likely `PARENT_SCRIPT`

**Verification**:
- Open in Macromedia Director MX 2004 for definitive answer
- Document uncertain cases in task description

### Tasks

1. **Tooling**
   - [ ] 1.1 Create comparison script for verifying 1:1 translation
   - [ ] 1.2 Create script type determination helper (if possible)

2. **Vertical slice: hh_entry_init**
   - [ ] 2.1 Translate `6_Login Interface Class.ls` → `login-interface-class.js` (PARENT_SCRIPT)
   - [ ] 2.2 Translate `7_Login Component Class.ls` → `login-component-class.js` (PARENT_SCRIPT)
   - [ ] 2.3 Translate `8_Login Handler Class.ls` → `login-handler-class.js` (PARENT_SCRIPT)
   - [ ] 2.4 Translate `9_Login Subscript.ls` → `login-subscript.js` (PARENT_SCRIPT or MOVIE_SCRIPT - TBD)
   - [ ] 2.5 Translate `10_Login Subscript 2.ls` → `login-subscript-2.js` (PARENT_SCRIPT or MOVIE_SCRIPT - TBD)
   - [ ] 2.6 Translate `11_Opening Hours Interface Class.ls` → `opening-hours-interface-class.js` (PARENT_SCRIPT)
   - [ ] 2.7 Translate `12_Opening Hours Component Class.ls` → `opening-hours-component-class.js` (PARENT_SCRIPT)
   - [ ] 2.8 Translate `13_Opening Hours Handler Class.ls` → `opening-hours-handler-class.js` (PARENT_SCRIPT)
   - [ ] 2.9 Create `hh_entry_init/index.js` - register all 17 members
   - [ ] 2.10 Add Vite build entry for `hh_entry_init`
   - [ ] 2.11 Wire into load chain
   - [ ] 2.12 Verify build succeeds
   - [ ] 2.13 Verify 1:1 translation with comparison script

3. **Remaining casts** (after vertical slice validated)
   - [ ] 3.1 Translate `hh_entry_base` - 3 scripts + 5 members
   - [ ] 3.2 Translate `hh_shared` - 28 scripts + 59 members
   - [ ] 3.3 Translate `hh_buffer` - 3 scripts + 44 members
   - [ ] 3.4 Register `hh_interface` - 0 scripts, 589 asset members
   - [ ] 3.5 Translate `hh_dynamic_downloader` - 3 scripts + members
   - [ ] 3.6 Translate `hh_entry_uk` - 2 scripts + members
   - [ ] 3.7 Wire Phase 1 casts, verify build

4. **Room system**
   - [ ] 4.1 Translate `hh_room_private` - 9 scripts + 261 members
   - [ ] 4.2 Translate `hh_room` - 6 scripts + 12 members
   - [ ] 4.3 Translate `hh_room_utils` - 29 scripts + 48 members
   - [ ] 4.4 Translate `hh_room_ui` - 12 scripts + 43 members
   - [ ] 4.5 Translate `hh_room_landscapes` - 2 scripts + members
   - [ ] 4.6 Translate `hh_roomdimmer` - 5 scripts + members
   - [ ] 4.7 Wire room casts, verify build

5. **Avatar system**
   - [ ] 5.1 Translate `hh_human` - 10 scripts + 16 members
   - [ ] 5.2 Translate `hh_human_body` through `hh_human_shoe` (8 casts)
   - [ ] 5.3 Translate `hh_human_acc_*` (5 accessory casts)
   - [ ] 5.4 Translate `hh_human_50_*` (9 variant casts)
   - [ ] 5.5 Wire avatar casts, verify build

6. **Furniture system**
   - [ ] 6.1 Translate `hh_furni_classes` - 51 scripts + 62 members
   - [ ] 6.2 Wire furniture casts, verify build

7. **Navigation & social**
   - [ ] 7.1 Translate `hh_navigator` - 5 scripts + 74 members
   - [ ] 7.2 Translate `hh_friend_list` - 12 scripts + members
   - [ ] 7.3 Translate `hh_instant_messenger` - 5 scripts + members
   - [ ] 7.4 Wire social casts, verify build

8. **Games system**
   - [ ] 8.1 Register `hh_ig_interface` - 0 scripts, asset members
   - [ ] 8.2 Translate `hh_ig` - 79 scripts + 85 members
   - [ ] 8.3 Wire game casts, verify build

9. **Catalog & commerce**
   - [ ] 9.1 Translate `hh_cat_code` - 14 scripts + members
   - [ ] 9.2 Register `hh_cat_gfx_all` - 0 scripts, asset members
   - [ ] 9.3 Translate `hh_club` - 3 scripts + members
   - [ ] 9.4 Translate `hh_recycler` - 5 scripts + members
   - [ ] 9.5 Wire commerce casts, verify build

10. **Features & miscellaneous**
    - [ ] 10.1 Translate `hh_guide` - 4 scripts + members
    - [ ] 10.2 Translate `hh_kiosk_room` - 4 scripts + members
    - [ ] 10.3 Translate `hh_photo` - 4 scripts + members
    - [ ] 10.4 Translate `hh_poll` - 3 scripts + members
    - [ ] 10.5 Translate `hh_tutorial` - 11 scripts + members
    - [ ] 10.6 Translate `hh_soundmachine` - 12 scripts + members
    - [ ] 10.7 Translate `hh_pets`, `hh_pets_50`, `hh_pets_common`
    - [ ] 10.8 Register `hh_badges`, `hh_patch_uk` - asset-only casts
    - [ ] 10.9 Wire remaining casts, verify build

11. **Final verification**
    - [ ] 11.1 Verify all 63 casts registered and loadable
    - [ ] 11.2 Update all task checklists
    - [ ] 11.3 Full build verification

---

## Execution Order

1. **Create Director runtime change** (`implement-director-runtime`)
2. **Write Director runtime specs** (API functions, `the` properties, syntax helpers, core classes)
3. **Create translation change** (`translate-lingoscript-to-javascript`)
4. **Write translation specs** (conventions, registration, script types)
5. **Implement comparison script** (tooling)
6. **Translate vertical slice** (`hh_entry_init`)
7. **Validate vertical slice** (build, comparison script)
8. **Continue with remaining casts** (dependency order)
9. **Implement Director runtime** (incremental, driven by translation needs)

---

## Open Questions

1. **Script types for ambiguous cases**: "Login Subscript" files have no `me` parameter. Are they MOVIE_SCRIPT or PARENT_SCRIPT? Need Director verification or usage analysis.

2. **Comparison script design**: What should it compare?
   - Handler count?
   - Property count?
   - Line-by-line structure?
   - Runtime behavior (run both in parallel)?

3. **`the` property implementation priority**: Which of the 37 missing `the` properties should be implemented first?

4. **Runtime stub handling**: When a translated script calls a stub function, should we:
   - Log a warning?
   - Throw an error?
   - Return a default value?

5. **Cross-cast dependencies**: How do we handle scripts that call handlers from untranslated casts?
   - Use `_director.handlerName()` which resolves at runtime?
   - Document as TBD until that cast is translated?
