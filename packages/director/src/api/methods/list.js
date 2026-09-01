// @owner creator
// list(...) — top-level creator method (006 C6).
//
// Delegates to engine/base/list.js — the List class and the bracket/list
// syntax Proxy live there; this is the api-methods layer exposing the creator.
import { list as makeList } from "../../engine/base/list.js";

export function list(...values) {
  return makeList(...values);
}