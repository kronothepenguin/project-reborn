// Director runtime - objects barrel
// Internal re-export of all Director Core Object classes + value types,
// plus singleton bindings + mount setters. This barrel exists so that
// sibling modules inside `runtime/` can import multiple singletons from
// one place. It is NOT re-exported by `lingo/` — only the singletons
// (without setters) are re-exported publicly via the lingo surface.

export * from "./movie.js";
export * from "./player.js";
export * from "./sound.js";
export * from "./sound-channel.js";
export * from "./key.js";
export * from "./mouse.js";
export * from "./system.js";
export * from "./global.js";
export * from "./member.js";
export * from "./cast-library.js";
export * from "./sprite.js";
export * from "./sprite-channel.js";
export * from "./window.js";

// Value types — re-exported here so a single `runtime/objects/index.js`
// import can pull in any of the four docs-defined value types alongside
// the core objects. Tests rely on this consolidation.
export * from "../types/point.js";
export * from "../types/rect.js";
export * from "../types/color.js";
export * from "../types/list.js";
export * from "../types/prop-list.js";
