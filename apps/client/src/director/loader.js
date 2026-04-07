const pending = new Set();

let total = 0;
let loaded = 0;

const target = new EventTarget();

export function totalObjects() {
  return total;
}

export function objectsLoaded() {
  return loaded;
}

export function finished() {
  return pending.size === 0;
}

export function addFinishedListener(callback) {
  target.addEventListener("finished", callback);
}

function addPending(ref) {
  pending.add(ref);
  total++;
}

function deletePending(ref) {
  pending.delete(ref);
  loaded++;

  if (pending.size === 0) {
    target.dispatchEvent(new CustomEvent("finished"));
  }
}

export function loadImage(src) {
  const img = new Image();

  addPending(img);
  img.addEventListener("load", () => deletePending(img));
  img.addEventListener("error", () => deletePending(img));

  img.src = src;

  return img;
}

export function loadModule(url) {
  const promise = import(/* @vite-ignore */ url);

  addPending(promise);
  promise.finally(() => deletePending(promise));

  return promise;
}

/**
 *
 * @param {Promise} promise
 */
export function loadPromise(promise) {
  addPending(promise);
  promise.finally(() => deletePending(promise));
}
