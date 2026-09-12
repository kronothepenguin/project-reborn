# Quickstart — Scripting Objects (011)

**Gate**: `pnpm --filter @project-reborn/director test` — 350 green (52 files).

## Creation — `new xtra(name)`

The documented form (scripting_objects.txt). `xtra()` is a top-level api method
(`@owner top`):

```js
import { xtra } from "@project-reborn/director";

const io  = new xtra("fileio");      // FileioObject
const net = new xtra("netlingo");    // NetLingoObject
const tts = new xtra("speechxtra");  // SpeechXtraObject
const xml = new xtra("xmlparser");   // XMLParserObject
xtra("nope");                        // null
```

## NetLingo — the net owner

Per the 011 clarify directive, **net state and net logic live on the NetLingo
object**, and the top-level 006 net api methods delegate to it:

```js
const id = net.getNetText("https://api/habbo/start", { sw1: "1" });
net.netDone(id);         // false → true when resolved/errored
net.netTextResult(id);   // the body
net.netError(id);        // "OK" when no error
net.netAbort(id);
// ...the same results are reachable through the top-level methods:
netDone(id); netError(id); netTextResult(id); netMIME(id); ...
```

Every `DirectorContext` owns one `netLingo`; its internal transaction registry
is `netLingo.netState` (compat alias `ctx.netState`). `_getNetLingo()` /
`_getNetState()` (singletons facade) resolve the active context's instance, or
a module default when none is active.

## XMLParser — minimal real

```js
const xml = new xtra("xmlparser");
xml.parseString("<root><a>1</a></root>"); // true
xml.doneParsing();  // true
xml.name;           // "root"
xml.count();        // 1 (child elements; DOM-free envs return 0 without throwing)
xml.getError();     // "" — or "Malformed XML" on bad input
```

## Fileio / SpeechXtra — stubs

Full documented method surface with deterministic v1 returns (no filesystem /
TTS engine in the runtime). `speechxtra.voiceSpeak("hi")` flips the speaking bit;
`fileio.getOSDirectory()` → `""`, `getLength()` → `0`, etc.

## Notes

- Classes live in `engine/core/scripting/` (exported from `@/lingo` core barrel).
- NetState stays as the internal registry class owned by NetLingo; the api net
  methods are one-line delegates now.