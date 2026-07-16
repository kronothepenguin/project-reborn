// defineCast(name, memberSpecs)
// Convenience: build a cast from an inline array of member specs. Each spec is
// `{ type, name, ...opts }` where `type` is one of the supported member types
// (bitmap, field, text, sound, script, behavior, parentScript, shape,
// filmLoop, palette, transition, button). Delegates to `cast(name)`.

import { cast } from "./cast.js";

const METHODS = {
  bitmap: "bitmap",
  field: "field",
  text: "text",
  sound: "sound",
  script: "script",
  behavior: "behavior",
  parentScript: "parentScript",
  shape: "shape",
  filmLoop: "filmLoop",
  palette: "palette",
  transition: "transition",
  button: "button",
};

export function defineCast(name, memberSpecs = []) {
  let b = cast(name);
  for (const spec of memberSpecs) {
    const method = METHODS[spec.type];
    if (!method) throw new Error(`defineCast: unknown member type "${spec.type}"`);
    const { type: _t, ...opts } = spec;
    b = b[method](spec.name, opts);
  }
  return b.build();
}