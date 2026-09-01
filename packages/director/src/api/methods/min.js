import { List } from "../../engine/base/list.js";

export function min(value1, ...rest) {
  if (value1 instanceof List) {
    return Math.min(...value1);
  }
  return Math.min(value1, ...rest);
}
