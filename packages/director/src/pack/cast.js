// CastBuilder
// `cast(name)` → `.bitmap(name, opts).field(name, opts).build()`
// Each chained method constructs a member definition inline and appends it.
// `.build()` assigns sequential member numbers (1-indexed, compact) and
// returns a frozen `{ kind, name, members }` plain-object CastDefinition
// (per FR-017 — pure data, not live Director core objects).

export function cast(name = "Internal") {
  return new CastBuilder(name);
}

class CastBuilder {
  constructor(name) {
    this._name = name;
    this._members = [];
  }

  bitmap(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "bitmap",
      payload: { pixels: opts.pixels, width: opts.width, height: opts.height },
    });
    return this;
  }

  button(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "button",
      payload: { text: opts.text, width: opts.width, height: opts.height },
    });
    return this;
  }

  colorPalette(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "colorPalette",
      payload: { colors: opts.colors },
    });
    return this;
  }

  cursor(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "cursor",
      payload: { glyph: opts.glyph },
    });
    return this;
  }

  field(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "field",
      payload: { text: opts.text },
    });
    return this;
  }

  font(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "font",
      payload: { glyphs: opts.glyphs },
    });
    return this;
  }

  sound(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "sound",
      payload: { audioBytes: opts.audioBytes },
    });
    return this;
  }

  text(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "text",
      payload: { text: opts.text },
    });
    return this;
  }

  movieScript(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: "script",
      payload: { content: opts.content },
    });
    return this;
  }

  member(name, opts = {}) {
    this._members.push({
      kind: "member",
      name,
      mediaType: opts.type ?? "empty",
      payload: opts.payload,
    });
    return this;
  }

  build() {
    const members = this._members.map((m, i) => ({
      ...m,
      number: i + 1,
    }));
    return Object.freeze({
      kind: "cast",
      name: this._name,
      members: Object.freeze(members),
    });
  }
}