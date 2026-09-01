import { List } from "../../engine/base/list.js";

export function max(value1, ...rest) {
  if (value1 instanceof List) {
    return Math.max(...value1);
  }
  return Math.max(value1, ...rest);
}
