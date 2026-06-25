## Context

The Director runtime layer provides browser integration for Director movies, replacing the Shockwave Player plugin. It handles custom HTML elements for embedding movies, manages the frame-based event loop, loads cast libraries from URLs, and orchestrates the script lifecycle.

**Source**: `docs/drmx2004_scripting_ref.txt` (Chapter 10: Events and Messages)
**Current State**: Monolithic `runtime.js` file with incomplete implementation

## Goals / Non-Goals

**Goals:**
- Split runtime into atomic files for maintainability
- Implement custom elements for embedding Director movies
- Implement frame-based event loop matching Director's tempo
- Implement cast library loading from URLs
- Implement complete script lifecycle events
- Co-located tests for each component

**Non-Goals:**
- 3D rendering support
- Video/audio playback (handled by browser)
- Network protocol implementation (use browser fetch)

## Decisions

### Decision 1: File structure

**Choice**: Split into focused modules
```
apps/client/src/director/runtime/
├── custom-elements.js    # <x-object>, <x-param>
├── event-loop.js         # Frame-based playback
├── cast-loader.js        # Load cast libraries
├── script-lifecycle.js   # Event handlers
├── canvas.js             # Stage rendering
├── index.js              # Barrel export
└── __tests__/
    ├── custom-elements.test.js
    ├── event-loop.test.js
    ├── cast-loader.test.js
    ├── script-lifecycle.test.js
    └── canvas.test.js
```

**Rationale**: Each component has distinct responsibilities. Splitting enables parallel development and testing.

### Decision 2: Custom elements

**Choice**: Use Web Components API
```javascript
class XObject extends HTMLElement {
  connectedCallback() {
    // Initialize Director movie
  }
}
customElements.define('x-object', XObject);
```

**Rationale**: Standard browser API for custom HTML elements. Replaces Shockwave `<object>` tag.

### Decision 3: Event loop

**Choice**: Use requestAnimationFrame with tempo control
```javascript
function eventLoop(timestamp) {
  const elapsed = timestamp - lastFrameTime;
  if (elapsed >= frameDuration) {
    processFrame();
    lastFrameTime = timestamp;
  }
  requestAnimationFrame(eventLoop);
}
```

**Rationale**: Matches browser's refresh rate while controlling playback speed via tempo.

### Decision 4: Cast loading

**Choice**: Use dynamic imports for JavaScript casts
```javascript
async function loadCast(url) {
  const module = await import(url);
  return module.default;
}
```

**Rationale**: Leverages browser's module loading. Casts are JavaScript modules.

### Decision 5: Script lifecycle

**Choice**: Dispatch custom events on canvas
```javascript
canvas.dispatchEvent(new CustomEvent('prepareMovie'));
canvas.dispatchEvent(new CustomEvent('enterFrame'));
```

**Rationale**: Decouples event dispatch from handlers. Allows multiple listeners.

### Decision 6: Canvas rendering

**Choice**: Use HTML5 Canvas API
```javascript
const ctx = canvas.getContext('2d');
ctx.drawImage(sprite.image, x, y);
```

**Rationale**: Standard browser API for 2D rendering. Matches Director's 2D stage.

## Risks / Trade-offs

**Risk**: Custom elements not supported in older browsers
→ **Mitigation**: Use polyfills or require modern browser

**Risk**: Event loop timing may drift
→ **Mitigation**: Use high-resolution timer and adjust frame duration

**Risk**: Cast loading may fail
→ **Mitigation**: Implement error handling and fallback behavior

**Trade-off**: requestAnimationFrame vs setInterval for event loop
→ **Acceptable**: requestAnimationFrame is more efficient and matches browser refresh

**Trade-off**: Custom events vs direct function calls for lifecycle
→ **Acceptable**: Custom events provide better decoupling and extensibility
