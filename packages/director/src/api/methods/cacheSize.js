// @owner top
let currentCacheSize = 0;

export function cacheSize(newCacheSize) {
  if (newCacheSize === undefined || newCacheSize === null) {
    return currentCacheSize;
  }
  const size = Math.max(0, Math.trunc(Number(newCacheSize)));
  if (Number.isFinite(size)) {
    currentCacheSize = size;
  }
  return currentCacheSize;
}

export function _resetCacheSizeForTests() {
  currentCacheSize = 0;
}
