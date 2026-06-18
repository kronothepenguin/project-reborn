// Internal network transaction registry.
// Shared by getNetText, postNetText, downloadNetThing, preloadNetThing,
// gotoNetMovie, gotoNetPage, netAbort, netDone, netError, netTextResult,
// netLastModDate, netMIME, getStreamStatus.

const _netTransactions = new Map();
let _nextNetId = 1;
let _lastNetId = 0;
const _abortControllers = new Map();

export function createTransaction() {
  const id = _nextNetId++;
  _netTransactions.set(id, {
    url: "",
    state: "InProgress",
    bytesSoFar: 0,
    bytesTotal: 0,
    mime: "",
    lastModDate: "",
    result: null,
    error: "OK",
  });
  _lastNetId = id;
  return id;
}

export function getLastNetId() {
  return _lastNetId;
}

export function setLastNetId(id) {
  _lastNetId = id;
}

export function getTransaction(id) {
  return _netTransactions.get(id);
}

export function updateTransaction(id, updates) {
  const trans = _netTransactions.get(id);
  if (trans) Object.assign(trans, updates);
}

export function deleteTransaction(id) {
  _netTransactions.delete(id);
  _abortControllers.delete(id);
}

export function setAbortController(id, controller) {
  _abortControllers.set(id, controller);
}

export function getAbortController(id) {
  return _abortControllers.get(id);
}

export function findTransactionByUrl(url) {
  for (const [id, trans] of _netTransactions) {
    if (trans.url === url) return id;
  }
  return null;
}

export function deleteAbortController(id) {
  _abortControllers.delete(id);
}

export function __resetForTests() {
  _netTransactions.clear();
  _abortControllers.clear();
  _nextNetId = 1;
  _lastNetId = 0;
}
