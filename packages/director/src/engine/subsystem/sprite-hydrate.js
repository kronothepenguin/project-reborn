// Sprite hydration (003 R2) — subsystem-side helper (FR-005: no statics, no
// behavior on classes). Copies the 004 Score cell's placement fields onto a
// live SpriteObject so translated scripts read documented sprite fields.
//
// Cell shape (004 score.js): `{ member, loc, size, visible, ink, blend, ... }`
// (opaque passthrough). Hydration maps:
//   loc: [h, v]        → loc/.locH/.locV + left/top (bounds) + right/bottom
//   size: [w, h]       → width/height (+ right/bottom)
//   visible: bool      → visible
//   member: name       → member (resolved via ctx.memberRegistry)
//   ink/blend/rotation → fields as-is (data-only; rendering is 008's job)

const PLACEMENT_FIELDS = [
  "member", "loc", "size", "visible", "ink", "blend", "rotation", "puppet",
  "flipH", "flipV", "skew", "constraint", "moveableSprite", "editable", "cursor",
  "locZ", "backColor", "foreColor", "castLib", "memberNum", "quad", "volume",
];

export function hydrateSprite(ctx, sprite, cell) {
  if (!cell) {
    clearSprite(sprite);
    return sprite;
  }
  for (const key of PLACEMENT_FIELDS) {
    if (typeof cell[key] !== "undefined") {
      sprite[key] = cell[key];
    }
  }
  applyLoc(ctx, sprite, cell.loc);
  applySize(ctx, sprite, cell.size);
  resolveMember(ctx, sprite);
  return sprite;
}

function applyLoc(ctx, sprite, loc) {
  const [h = 0, v = 0] = Array.isArray(loc) ? loc : [0, 0];
  sprite.loc = { h, v };
  sprite.locH = h;
  sprite.locV = v;
  sprite.left = h;
  sprite.top = v;
  sprite.right = h + (sprite.width || 0);
  sprite.bottom = v + (sprite.height || 0);
}

function applySize(ctx, sprite, size) {
  if (!Array.isArray(size)) return;
  const [w = 0, h = 0] = size;
  sprite.width = w;
  sprite.height = h;
  sprite.right = sprite.left + w;
  sprite.bottom = sprite.top + h;
}

function resolveMember(ctx, sprite) {
  const name = sprite.member;
  if (typeof name !== "string" || name.length === 0) {
    sprite.member = null;
    return;
  }
  const member = ctx.memberRegistry?.lookupByNameInMovie?.(ctx.movie, name)
    ?? ctx.memberRegistry?._lookupByName?.(name) ?? null;
  sprite.member = member ?? name;
  if (member?.number) sprite.memberNum = member.number;
}

function clearSprite(sprite) {
  sprite.loc = { h: 0, v: 0 };
  sprite.locH = 0;
  sprite.locV = 0;
  sprite.left = 0;
  sprite.top = 0;
  sprite.right = 0;
  sprite.bottom = 0;
  sprite.width = 0;
  sprite.height = 0;
  sprite.visible = false;
  sprite.member = null;
  sprite.ink = 0;
  sprite.blend = 100;
  sprite.puppet = false;
}

// 003 T015: if the sprite has a `constraint` (channel number), clamp its loc
// into the constraining sprite's bounds (docs: the constraint point cannot be
// moved outside the bounding rectangle of the constraining sprite).
export function constrainIfNeeded(ctx, sprite, locH = sprite.locH, locV = sprite.locV) {
  const cn = Number(sprite.constraint);
  if (!Number.isFinite(cn) || cn <= 0) return;

  const target = ctx.sprite(cn);
  if (!target) return;
  const left = target.left ?? 0;
  const top = target.top ?? 0;
  const right = target.right ?? left;
  const bottom = target.bottom ?? top;

  sprite.locH = Math.min(right, Math.max(left, locH));
  sprite.locV = Math.min(bottom, Math.max(top, locV));
  syncBounds(sprite);
}

// keep sprite.loc / left / top / right / bottom consistent with locH/locV +
// width/height (the flat-2D renderer + hitTest read the bounds fields).
export function syncBounds(sprite) {
  const h = sprite.locH ?? 0;
  const v = sprite.locV ?? 0;
  sprite.loc = { h, v };
  sprite.left = h;
  sprite.top = v;
  sprite.right = h + (sprite.width ?? 0);
  sprite.bottom = v + (sprite.height ?? 0);
}