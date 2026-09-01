// @owner top
function handlerName(sym) {
  if (typeof sym === "symbol") return sym.description || "";
  if (typeof sym === "string") return sym.startsWith("#") ? sym.slice(1) : sym;
  return String(sym);
}

export function handler(symHandler, scriptObject) {
  const name = handlerName(symHandler);
  if (scriptObject == null) return false;
  if (scriptObject.ancestor && typeof scriptObject.ancestor === "object") {
    if (typeof scriptObject.ancestor[name] === "function") return true;
  }
  return typeof scriptObject[name] === "function";
}
