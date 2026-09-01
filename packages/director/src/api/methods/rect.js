import { rect as makeRect } from "../types/rect.js";

export function rect(intLeft, intTop, intRight, intBottom) {
  return makeRect(intLeft, intTop, intRight, intBottom);
}
