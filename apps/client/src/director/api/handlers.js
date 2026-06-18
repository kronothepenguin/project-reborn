function asSymbol(name) {
  if (typeof name === "symbol") return name;
  return Symbol(String(name));
}

export function handlers(scriptObject) {
  if (scriptObject == null || typeof scriptObject !== "object") return [];
  const names = new Set();
  const visited = new Set();
  let scope = scriptObject;
  while (scope && !visited.has(scope)) {
    visited.add(scope);
    for (const key of Object.keys(scope)) {
      if (typeof scope[key] === "function" && key !== "constructor") {
        names.add(asSymbol(key));
      }
    }
    scope = scope.ancestor;
  }
  return Array.from(names);
}
