// @owner top
// ilk(object) / ilk(object, type) — type introspection per docs.
//
// Doc table (methods.txt ilk()): returns the type symbol; the two-arg form
// returns TRUE (1) only if the object's type matches the given type symbol
// (where #list/#proplist, #number/#integer|#float, etc. are aliases).
// Implementation notes:
//   - symbols are created with Symbol.for(name) — the runtime's symbol registry
//     (translated Lingo globals compare symbols by identity).
//   - #void for undefined/null; #integer/#float split numbers.
import { List } from "../../engine/base/list.js";
import { PropList } from "../../engine/base/prop-list.js";
import { Color } from "../../engine/base/color.js";
import { Point } from "../../engine/base/point.js";
import { Rect } from "../../engine/base/rect.js";
import { SoundObject } from "../../engine/core/sound.js";
import { PlayerObject } from "../../engine/core/player.js";
import { MovieObject } from "../../engine/core/index.js";
import { SpriteObject } from "../../engine/core/sprite.js";
import { MemberObject } from "../../engine/core/member.js";
import { CastLibraryObject } from "../../engine/core/cast-library.js";
import { WindowObject } from "../../engine/core/window.js";

function ilkOf(object) {
  if (object === undefined || object === null) return Symbol.for("void");
  if (typeof object === "symbol") return Symbol.for("symbol");
  if (typeof object === "string") return Symbol.for("string");
  if (typeof object === "boolean") return Symbol.for("boolean");
  if (typeof object === "number") {
    return Number.isInteger(object) ? Symbol.for("integer") : Symbol.for("float");
  }
  if (object instanceof PropList) return Symbol.for("proplist");
  if (object instanceof List) return Symbol.for("list");
  if (object instanceof Color) return Symbol.for("color");
  if (object instanceof Point) return Symbol.for("point");
  if (object instanceof Rect) return Symbol.for("rect");
  if (object instanceof Date) return Symbol.for("date");
  if (object instanceof SoundObject) return Symbol.for("sound");
  if (object instanceof CastLibraryObject) return Symbol.for("castlib");
  if (object instanceof WindowObject) return Symbol.for("window");
  if (object instanceof PlayerObject) return Symbol.for("player");
  if (object instanceof SpriteObject) return Symbol.for("sprite");
  if (object instanceof MemberObject) return Symbol.for("member");
  if (object instanceof MovieObject) return Symbol.for("media");
  if (typeof object === "object") return Symbol.for("instance");
  return undefined;
}

// Two-arg alias sets per the docs table's second column.
const ALIAS_GROUPS = {
  list: new Set(["list", "linearlist"]),
  proplist: new Set(["list", "proplist"]),
  integer: new Set(["integer", "number"]),
  float: new Set(["float", "number"]),
  rect: new Set(["rect", "list"]),
  point: new Set(["point", "list"]),
  color: new Set(["color"]),
  date: new Set(["date"]),
  symbol: new Set(["symbol"]),
  string: new Set(["string"]),
  void: new Set(["void"]),
  picture: new Set(["picture"]),
  instance: new Set(["instance", "object"]),
  member: new Set(["member", "object"]),
  xtra: new Set(["xtra", "object"]),
  script: new Set(["script", "object"]),
  castlib: new Set(["castlib", "object"]),
  sound: new Set(["sound"]),
  player: new Set(["player"]),
  sprite: new Set(["sprite"]),
  media: new Set(["media"]),
};

export function ilk(object, type) {
  const sym = ilkOf(object);
  if (type === undefined) return sym;
  const typeName = typeof type === "symbol" ? Symbol.keyFor(type) : String(type);
  if (!typeName) return false;
  const actualName = sym ? Symbol.keyFor(sym) : undefined;
  if (!actualName) return false;
  // check the requested type's alias group against the actual type
  const requestedGroup = ALIAS_GROUPS[typeName];
  const actualGroup = ALIAS_GROUPS[actualName];
  if (requestedGroup && requestedGroup.has(actualName)) return true;
  if (actualGroup && actualGroup.has(typeName)) return true;
  return typeName === actualName;
}