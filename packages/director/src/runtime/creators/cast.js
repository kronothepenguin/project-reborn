// CastBuilder
// `cast(name)` → `.bitmap(...)`.field(...)`.sound(...)`.script(...).build()`
// Each chained method appends a MemberObject (created via the member factories
// in `./member-factories.js`) and returns the builder for chaining. `.build()`
// finalises the cast: assigns it the next free cast-lib number (or the one
// passed), registers every member under both its index and its name, and
// registers the cast lib itself with `CastLibraryObject._register`.

import { CastLibraryObject } from "../objects/cast-library.js";
import {
  createBitmap, createField, createText, createSound, createScript,
  createBehavior, createParentScript, createShape, createFilmLoop,
  createPalette, createTransition, createButton,
} from "./member-factories.js";

export function cast(name = "Internal") {
  return new CastBuilder(name);
}

class CastBuilder {
  constructor(name) {
    this._name = name;
    this._members = [];
    this._fileName = "";
    this._preLoadMode = 0;
    this._number = null;
  }

  fileName(v) { this._fileName = v; return this; }
  preLoadMode(v) { this._preLoadMode = v; return this; }
  number(v) { this._number = v; return this; }

  bitmap(name, opts) { this._members.push(createBitmap(name, opts)); return this; }
  field(name, opts) { this._members.push(createField(name, opts)); return this; }
  text(name, opts) { this._members.push(createText(name, opts)); return this; }
  sound(name, opts) { this._members.push(createSound(name, opts)); return this; }
  script(name, opts) { this._members.push(createScript(name, opts)); return this; }
  behavior(name, opts) { this._members.push(createBehavior(name, opts)); return this; }
  parentScript(name, opts) { this._members.push(createParentScript(name, opts)); return this; }
  shape(name, opts) { this._members.push(createShape(name, opts)); return this; }
  filmLoop(name, opts) { this._members.push(createFilmLoop(name, opts)); return this; }
  palette(name, opts) { this._members.push(createPalette(name, opts)); return this; }
  transition(name, opts) { this._members.push(createTransition(name, opts)); return this; }
  button(name, opts) { this._members.push(createButton(name, opts)); return this; }

  build(number) {
    const n = number ?? this._number ?? nextCastLibNumber();
    const lib = new CastLibraryObject({ number: n, name: this._name, castLibNum: n });
    lib.fileName = this._fileName;
    lib.preLoadMode = this._preLoadMode;
    for (const m of this._members) lib._addMember(m);
    CastLibraryObject._register(lib);
    return lib;
  }
}

function nextCastLibNumber() {
  // CastLibraryObject.castLib is a Proxy keyed by number (1-based) or name;
  // its `length`-style helper is the static registry size, available via the
  // `_count()` static — fall back to walking the proxy when absent.
  let n = 1;
  while (CastLibraryObject.castLib[n]) n++;
  return n;
}