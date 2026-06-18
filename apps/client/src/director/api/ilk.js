import { List, PropList } from "../core/index.js";
import { Color } from "../core/color.js";
import { Point } from "../core/point.js";
import { Rect } from "../core/rect.js";
import { SoundRef } from "../core/sound-ref.js";
import { PlayerRef } from "../core/player-ref.js";
import { MovieRef } from "../core/movie-ref.js";
import { SpriteRef } from "../core/sprite-ref.js";
import { MemberRef } from "../core/member-ref.js";
import { CastLibraryRef } from "../core/cast-library-ref.js";

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
  if (object instanceof SoundRef) return Symbol.for("sound");
  if (object instanceof CastLibraryRef) return Symbol.for("castlib");
  if (object instanceof PlayerRef) return Symbol.for("window");
  if (object instanceof SpriteRef) return Symbol.for("sprite");
  if (object instanceof MemberRef) return Symbol.for("member");
  if (object instanceof MovieRef) return Symbol.for("media");
  if (typeof object === "object") return Symbol.for("instance");
  return undefined;
}
