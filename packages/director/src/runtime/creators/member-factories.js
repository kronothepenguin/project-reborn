// Member factories used by CastBuilder.
// Each factory creates a `MemberObject` with the correct `type` symbol and
// applies the supplied options. Two input shapes are supported:
//   - { dataUrl } — Vite `?inline` for images/audio (data URL string).
//   - { text }    — Vite `?raw` for text fields / scripts.
// The runtime lazy-decodes `dataUrl`/`text` on first use (see MemberObject).

import { MemberObject } from "../objects/member.js";

const TYPE = {
  bitmap: Symbol.for("bitmap"),
  field: Symbol.for("field"),
  text: Symbol.for("text"),
  sound: Symbol.for("sound"),
  script: Symbol.for("script"),
  behavior: Symbol.for("script"),
  parentScript: Symbol.for("script"),
  shape: Symbol.for("shape"),
  filmLoop: Symbol.for("filmLoop"),
  palette: Symbol.for("palette"),
  transition: Symbol.for("transition"),
  button: Symbol.for("button"),
};

function applyCommon(member, opts = {}) {
  if (opts.name !== undefined) member.name = opts.name;
  if (opts.comments !== undefined) member.comments = opts.comments;
  if (opts.width !== undefined) member._setWidth(opts.width);
  if (opts.height !== undefined) member._setHeight(opts.height);
  if (opts.fileName !== undefined) member.fileName = opts.fileName;
  if (opts.purgePriority !== undefined) member.purgePriority = opts.purgePriority;
  if (opts.hilite !== undefined) member.hilite = opts.hilite;
  if (opts.creationDate !== undefined) member._setCreationDate(opts.creationDate);
  // dataUrl / text are stashed on the member via the `media` setter so the
  // runtime can lazy-decode on first use.
  if (opts.dataUrl !== undefined) member.media = { dataUrl: opts.dataUrl };
  if (opts.text !== undefined) member.text = opts.text;
  if (opts.scriptText !== undefined) member.scriptText = opts.scriptText;
  return member;
}

export function createBitmap(name, opts = {}) {
  const m = new MemberObject(TYPE.bitmap, name);
  if (opts.x !== undefined && opts.y !== undefined) m.regPoint = { x: opts.x, y: opts.y };
  return applyCommon(m, opts);
}

export function createField(name, opts = {}) {
  const m = new MemberObject(TYPE.field, name);
  if (opts.font !== undefined) m.font = opts.font;
  if (opts.fontSize !== undefined) m.fontSize = opts.fontSize;
  return applyCommon(m, opts);
}

export function createText(name, opts = {}) {
  const m = new MemberObject(TYPE.text, name);
  if (opts.font !== undefined) m.font = opts.font;
  if (opts.fontSize !== undefined) m.fontSize = opts.fontSize;
  return applyCommon(m, opts);
}

export function createSound(name, opts = {}) {
  const m = new MemberObject(TYPE.sound, name);
  if (opts.duration !== undefined) m.duration = opts.duration;
  if (opts.loop !== undefined) m.loop = opts.loop;
  if (opts.volume !== undefined) m.volume = opts.volume;
  return applyCommon(m, opts);
}

export function createScript(name, opts = {}) {
  const m = new MemberObject(TYPE.script, name);
  return applyCommon(m, opts);
}

export function createBehavior(name, opts = {}) {
  const m = new MemberObject(TYPE.behavior, name);
  return applyCommon(m, opts);
}

export function createParentScript(name, opts = {}) {
  const m = new MemberObject(TYPE.parentScript, name);
  return applyCommon(m, opts);
}

export function createShape(name, opts = {}) {
  const m = new MemberObject(TYPE.shape, name);
  return applyCommon(m, opts);
}

export function createFilmLoop(name, opts = {}) {
  const m = new MemberObject(TYPE.filmLoop, name);
  if (opts.loop !== undefined) m.loop = opts.loop;
  return applyCommon(m, opts);
}

export function createPalette(name, opts = {}) {
  const m = new MemberObject(TYPE.palette, name);
  return applyCommon(m, opts);
}

export function createTransition(name, opts = {}) {
  const m = new MemberObject(TYPE.transition, name);
  return applyCommon(m, opts);
}

export function createButton(name, opts = {}) {
  const m = new MemberObject(TYPE.button, name);
  if (opts.font !== undefined) m.font = opts.font;
  if (opts.fontSize !== undefined) m.fontSize = opts.fontSize;
  return applyCommon(m, opts);
}