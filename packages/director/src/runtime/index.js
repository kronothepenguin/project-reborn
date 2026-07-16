// Director runtime - internal barrel
// All real implementation lives in subfolders (objects/, types/, methods/,
// syntax/, creators/, player/). This file re-exports the surface that
// sibling modules inside runtime/ may need to import.

// Object classes. Singleton instances are NOT exported here — they live in
// `./singletons.js` as live-binding slots that `DirectorContext.activate()`
// rewrites per worker. Import singletons from `./singletons.js`.
export * from "./objects/movie.js";
export * from "./objects/player.js";
export * from "./objects/sound.js";
export * from "./objects/sound-channel.js";
export * from "./objects/key.js";
export * from "./objects/mouse.js";
export * from "./objects/system.js";
export * from "./objects/global.js";
export * from "./objects/member.js";
export * from "./objects/cast-library.js";
export * from "./objects/sprite.js";
export * from "./objects/sprite-channel.js";
export * from "./objects/window.js";

// Types
export * from "./types/point.js";
export * from "./types/rect.js";
export * from "./types/color.js";
export * from "./types/list.js";
export * from "./types/prop-list.js";

// Constants
export * from "./constants.js";

// Singleton slots + context installer (internal)
export * from "./singletons.js";
export * from "./context.js";
