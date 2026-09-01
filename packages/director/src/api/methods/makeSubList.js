import { List } from "../../engine/base/list.js";

export function makeSubList(list, start, end) {
  const result = new List();
  for (let i = start; i <= end; i++) {
    result.add(list.getAt(i));
  }
  return result;
}
