import { List } from "../types/list.js";

export function list(...args) {
  return new List(...args);
}
