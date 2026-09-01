import { splitItems, createChunkSelector } from "./chunk-split.js";
import { the } from "./the-proxy.js";

function liveDelimiter() {
  const d = the.itemDelimiter;
  return typeof d === "string" && d.length > 0 ? d : ",";
}

export const item = createChunkSelector(splitItems, "item", liveDelimiter);

export function itemRange(start, end) {
  return item(start).to(end);
}