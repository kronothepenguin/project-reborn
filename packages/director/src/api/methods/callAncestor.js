// @owner top
function handlerName(sym) {
  if (typeof sym === "symbol") return sym.description || "";
  if (typeof sym === "string") return sym.startsWith("#") ? sym.slice(1) : sym;
  return String(sym);
}

function resolveScript(target) {
  if (Array.isArray(target)) return target;
  return [target];
}

function callAncestorOnInstance(instance, name, args, { raiseIfMissing = true } = {}) {
  if (instance == null) {
    if (raiseIfMissing) {
      throw new Error(`Cannot callAncestor "${name}" on a null script instance.`);
    }
    return undefined;
  }
  const scope = instance.ancestor ?? instance;
  if (scope && typeof scope === "object" && typeof scope[name] === "function") {
    return scope[name].apply(scope, [scope, ...args]);
  }
  if (raiseIfMissing) {
    throw new Error(`Ancestor handler "${name}" is not defined on the script instance.`);
  }
  return undefined;
}

export function callAncestor(symHandlerName, scriptInstance, ...args) {
  const name = handlerName(symHandlerName);
  const targets = resolveScript(scriptInstance);
  const raiseIfMissing = targets.length === 1;
  const results = [];
  for (const t of targets) {
    results.push(callAncestorOnInstance(t, name, args, { raiseIfMissing }));
  }
  return targets.length === 1 ? results[0] : results;
}
