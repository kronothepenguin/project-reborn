// @owner creator
// propList(...) — top-level creator method (006 C6).
//
// Delegates to engine/base/prop-list.js — the PropList class and the
// bracket/list syntax Proxy live there; this is the api-methods layer exposing
// the creator.
import { propList as makePropList } from "../../engine/base/prop-list.js";

export function propList(...pairs) {
  return makePropList(...pairs);
}