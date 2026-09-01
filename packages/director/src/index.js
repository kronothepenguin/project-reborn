// @project-reborn/director - root entry
// Combines the Lingo public surface (singletons, constants, syntax, methods)
// with the browser host integration layer (createContext, custom elements,
// builders). Vite tree-shakes unused exports; if you only want the runtime
// surface, import from `@project-reborn/director/lingo`.

export * from "./api/index.js";
export * from "./browser/index.js";