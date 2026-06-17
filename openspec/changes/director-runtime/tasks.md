## 1. Setup

- [ ] 1.1 Create `apps/client/src/director/runtime/` directory
- [ ] 1.2 Create `apps/client/src/director/runtime/__tests__/` directory
- [ ] 1.3 Create `apps/client/src/director/runtime/index.js` barrel export

## 2. Custom Elements

- [ ] 2.1 Implement `<x-object>` custom element in `runtime/custom-elements.js`
- [ ] 2.2 Implement `<x-param>` custom element in `runtime/custom-elements.js`
- [ ] 2.3 Write tests for custom elements in `runtime/__tests__/custom-elements.test.js`

## 3. Event Loop

- [ ] 3.1 Implement `startEventLoop()` function in `runtime/event-loop.js`
- [ ] 3.2 Implement `stopEventLoop()` function in `runtime/event-loop.js`
- [ ] 3.3 Implement frame processing at specified tempo
- [ ] 3.4 Write tests for event loop in `runtime/__tests__/event-loop.test.js`

## 4. Cast Loader

- [ ] 4.1 Implement `loadCast(url)` function in `runtime/cast-loader.js`
- [ ] 4.2 Implement cast registration with MovieRef
- [ ] 4.3 Implement error handling for failed loads
- [ ] 4.4 Write tests for cast loader in `runtime/__tests__/cast-loader.test.js`

## 5. Script Lifecycle

- [ ] 5.1 Implement `prepareMovie` event dispatch in `runtime/script-lifecycle.js`
- [ ] 5.2 Implement `startMovie` event dispatch
- [ ] 5.3 Implement `stopMovie` event dispatch
- [ ] 5.4 Implement `prepareFrame` event dispatch
- [ ] 5.5 Implement `enterFrame` event dispatch
- [ ] 5.6 Implement `exitFrame` event dispatch
- [ ] 5.7 Write tests for script lifecycle in `runtime/__tests__/script-lifecycle.test.js`

## 6. Canvas Rendering

- [ ] 6.1 Implement `setCanvas(canvas)` function in `runtime/canvas.js`
- [ ] 6.2 Implement `updateStage()` function for rendering
- [ ] 6.3 Implement canvas resizing
- [ ] 6.4 Write tests for canvas in `runtime/__tests__/canvas.test.js`

## 7. Integration

- [ ] 7.1 Export all runtime functions from `runtime/index.js`
- [ ] 7.2 Verify runtime is accessible via `import { ... } from "../../director/runtime"`
- [ ] 7.3 Run all tests to ensure implementation matches Director MX 2004 behavior
