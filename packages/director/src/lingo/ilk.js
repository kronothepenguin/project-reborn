import { List, PropList } from "../core/index.js";
import { Color } from "../core/color.js";
import { Point } from "../core/point.js";
import { Rect } from "../core/rect.js";
import { SoundObject } from "../core/sound-object.js";
import { PlayerObject } from "../core/player-object.js";
import { MovieObject } from "../core/movie-object.js";
import { SpriteObject } from "../core/sprite-object.js";
import { MemberObject } from "../core/member-object.js";
import { CastLibraryObject } from "../core/cast-library-object.js";
import { WindowObject } from "../core/window-object.js";

export function ilk(object) {
  if (object === undefined || object === null) return Symbol.for("void");
  if (typeof object === "symbol") return Symbol.for("symbol");
  if (typeof object === "string") return Symbol.for("string");
  if (typeof object === "number") {
    return Number.isInteger(object) ? Symbol.for("integer") : Symbol.for("float");
  }
  if (object instanceof PropList) return Symbol.for("propList");
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
