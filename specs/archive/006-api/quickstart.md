# Quickstart — API (006)

**Gate**: `pnpm --filter @project-reborn/director test` — every scenario here is a
vitest case (co-located `__tests__/`), mirroring real TDD tests.

## Active-context state (C8) — how methods resolve state

```js
import { DirectorContext } from "../engine/subsystem/context.js";
import { go, beep, member } from "../index.js";          // the @/lingo barrel
import { _getMovie } from "../engine/subsystem/singletons.js";

// no context -> neutral: member() null, castLib() null, go no-op
member("x");          // null

const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }] } });
ctx.activate();       // installs the ACTIVE context (single pointer, no globals)

// stateful methods now route to ctx's consts:
go(1);                // -> ctx.movie (Score frame 1)
beep(1);              // -> ctx.sound
member("x");          // -> ctx.movie.castLib lookup (null in empty castLib)

ctx.destroy();        // clears the active pointer (if it was this ctx)
```

The 7 core-object instances are **consts on DirectorContext** (`ctx.movie`,
`ctx.player`, `ctx.sound`, `ctx.key`, `ctx.mouse`, `ctx.system`, `ctx.global`).
`engine/subsystem/accessor.js` holds the single active pointer; the singleton
facade (`singletons.js`) resolves `_getMovie()` … through it. No `globalThis`
installs, no mutable module-level slots.

## value() — expression evaluation (C7)

```js
import { value } from "../index.js";
value("3+4");           // 7
value("(2+3)*4");       // 20
value("3 5");           // 3   (leading portion up to first syntax error)
value("penny");         // undefined (VOID)
value("TRUE");          // true
value("#hop");          // Symbol.for("hop")
value("[1, 2, 3]");     // live list
value("foo");           // undefined (VOID)
```

## color() — palette form (C5)

```js
import { color, PALETTES } from "../index.js";
color(137);             // palette index form: paletteIndex 137, RGB from default palette
color(255, 0, 0);       // RGB form: red 255, green 0, blue 0, no paletteIndex
PALETTES[Symbol.for("rainbow")];   // built-in 256-entry palette
```

## symbol() / ilk() / predicates (US5)

```js
import { symbol, ilk, symbolP, integerP } from "../index.js";
symbol("hello") === Symbol.for("hello");  // true
ilk([1, 2]);                // Symbol.for("list")
ilk(3, Symbol.for("number")); // true (2-arg alias form)
symbolP(symbol("x"));       // true
integerP(3); integerP("3"); // true / false
```

## Ownership registry (C2)

```js
import { ownerOf, METHODS_OWNERS } from "../methods/registry.js";
ownerOf("go");           // "movie"
ownerOf("beep");         // "sound"
ownerOf("netAbort");     // "net"
METHODS_OWNERS["color"]; // "creator"
```

Every `api/methods/*.js` file carries a `// @owner <name>` header; the
registry-audit test (`registry.test.js`) enforces header == registry == file set.

## Net ops fail-soft (C3, R9)

The net transaction registry lives in the **`NetState` subsystem**
(`engine/subsystem/net-state.js`, context-owned via `ctx.netState`); the net
methods resolve it through `_getNetState()`. No module-global registry.

```js
import { getNetText, netDone, netError, netTextResult } from "../index.js";
const id = getNetText("http://x");   // fetch rejects offline -> Error tx
// later poll:
netDone(id);        // true
netError(id);       // "Network error" (or "HTTP 404")
netTextResult(id);  // ""
```

`getStreamStatus(id)` → `{URL, state: "Complete"|"Error"|"InProgress", bytesSoFar, bytesTotal, error}`.
Never throws; `netAbort(url|id)` is a no-op for unknown ids.

## No-context neutral map (R8)

| category | no-context return |
|---|---|
| movie/player/sound/sprite/window `member/castLib` | null, `<X>Object` default, or no-op |
| key | default instance, no-throw |
| system | default instance, no-throw |
| global | default instance |
| net | false / "" (no registry entry) |
| top (pure) / creator | always computes |