import { List } from "../types/list.js";

export function listP(item) {
  return item instanceof List;
}
