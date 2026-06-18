function handlerName(sym) {
  if (typeof sym === "symbol") return sym.description || "";
  if (typeof sym === "string") return sym.startsWith("#") ? sym.slice(1) : sym;
  return String(sym);
}

function resolveScript(target) {
  if (Array.isArray(target)) return target;
  return [target];
}

function callOnInstance(instance, name, args, { requireAncestor = false, raiseIfMissing = true } = {}) {
  if (instance == null) {
    if (raiseIfMissing) {
      throw new Error(`Cannot call "${name}" on a null script instance.`);
    }
    return undefined;
  }
  let scope = instance;
  if (requireAncestor && instance.ancestor) {
    scope = instance.ancestor;
  }
  if (scope && typeof scope === "object" && typeof scope[name] === "function") {
    return scope[name].apply(scope, [scope, ...args]);
  }
  if (requireAncestor && scope !== instance && instance && typeof instance[name] === "function") {
    return instance[name].apply(instance, [instance, ...args]);
  }
  if (raiseIfMissing) {
    throw new Error(`Handler "${name}" is not defined on the script instance.`);
  }
  return undefined;
}

export function call(symHandlerName, scriptInstance, ...args) {
  const name = handlerName(symHandlerName);
  const targets = resolveScript(scriptInstance);
  const raiseIfMissing = targets.length === 1;
  const results = [];
  for (const t of targets) {
    results.push(callOnInstance(t, name, args, { raiseIfMissing }));
  }
  return targets.length === 1 ? results[0] : results;
}
