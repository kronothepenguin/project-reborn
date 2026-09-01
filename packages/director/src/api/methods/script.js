// @owner top
import { member } from "./member.js";

export function script(nameOrNum, castLibNum) {
  const mem = member(nameOrNum, castLibNum);
  if (mem && mem.type === Symbol.for("script")) return mem;
  return null;
}
