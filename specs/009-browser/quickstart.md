# Quickstart — Browser (009) declarative embedding

**Gate**: `pnpm --filter @project-reborn/director test` — 303 green (45 files).

## Declarative path — `<x-embed>`

```html
<x-embed src="/game/habbo/index.js" width="640" height="480" tempo="30">
  <x-param name="sw1" value="1">
  <x-param name="sw2" value="0">
</x-embed>
```

- `src` (alias `data`): the bundle URL (a C8 pack, default export = movie def).
- `width`/`height`: stage px, default 640×480. `tempo`: optional, overrides the
  pack's `options.tempo`.
- `<x-param>`s are snapshotted at connect → `externalParams` (stale if mutated
  later — documented).
- `<x-object>` is an exact alias of `<x-embed>`.

On connect: canvas inserted (`transferControlToOffscreen` when available, else
worker posts `paint` → element draws the ImageData), `run(src, {canvas,
externalParams})`, auto-`start()` after `ready`. `externalEvent` / `error` /
`gotoNetMovie` / `gotoNetPage` / `paint` are re-dispatched on the element as
`CustomEvent`s. `disconnectedCallback` → `destroy()`.

The element is a thin wrapper: `el.handle` is the imperative
`MainThreadImperativeHandle` (SC-010 equivalence — see equivalence.test.js).

## Imperative path — `run()`

```js
import { run } from "@project-reborn/director"; // or the player subpath
const handle = run("https://cdn/habbo/index.js", {
  canvas: someCanvas,                     // optional DOM canvas
  externalParams: [{ name: "sw1", value: "1" }],
});
handle.addEventListener("ready", () => handle.start());
handle.addEventListener("externalEvent", (e) => console.log(e.detail));
handle.destroy();
```

## Worker bootstrap (worker-entry.js)

`run()` runs a dedicated `Worker` on `worker-entry.js`; it installs the globals,
`import()`s the bundle, ingests the definition, renders per frame (OffscreenCanvas
or `paint` fallback), and serves the 001 protocol (init/ready/start/stop/destroy/
goToFrame/poll-lifecycle/setTempo + input + externalEvent + paint). One worker
per movie.

## Test notes

- jsdom has no `OffscreenCanvas`/2d context → element tests exercise the
  `paint` path (`el.frame` == worker paint `seq`).
- Worker is mocked as an in-process `EventTarget` (008 pattern) — the same
  stub drives `run()`, the element, and the equivalence suite.