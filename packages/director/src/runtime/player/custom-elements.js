// Re-export of the custom-elements module to preserve a stable
// `player/custom-elements.js` import path used by tests and any
// historical call sites. The actual implementation lives in
// `player/custom-elements/index.js` (the architecture target).
export * from "./custom-elements/index.js";
