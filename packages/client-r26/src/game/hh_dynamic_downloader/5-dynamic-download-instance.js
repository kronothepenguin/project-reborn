export default class {
  pListenerList;
  pAssetId;
  pDownloadURL;
  pAllowindexing;
  pAssetType;
  pParentId;

  construct() {
    this.pListenerList = list();
    this.pAssetId = VOID;
    this.pDownloadID = VOID;
    this.pAllowindexing = 0;
  }

  addCallbackListener(tObjectID, tHandlerName, tCallbackParams) {
    const tNewListener = propList("objectID", tObjectID, "handlerName", tHandlerName, "callbackParams", tCallbackParams);
    this.pListenerList.add(tNewListener);
  }

  purgeCallbacks(tSuccess) {
    const tTimeoutName = `dyndownload${the.milliSeconds}`;
    let tCounter = 1;
    for (const tListener of this.pListenerList) {
      const tObject = getObject(tListener[Symbol.for("objectID")]);
      const tHandler = tListener[Symbol.for("handlerName")];
      const tCallbackParams = tListener[Symbol.for("callbackParams")];
      if ((tObject != 0) && symbolp(tHandler)) {
        createTimeout(`${tTimeoutName}${tCounter}`, 10, Symbol.for("sendTimeoutCallbacks"), this.getID(), [tHandler, tObject, this.pAssetId, tSuccess, tCallbackParams], 1);
      } else {
        error(this, `Object or handler invalid: ${tObject} ${tHandler}`, Symbol.for("purgeCallbacks"), Symbol.for("minor"));
      }
      tCounter = tCounter + 1;
    }
    this.pListenerList = list();
  }

  setAssetId(tAssetId) {
    this.pAssetId = tAssetId;
  }

  getAssetId() {
    return this.pAssetId;
  }

  setAssetType(tAssetType) {
    this.pAssetType = tAssetType;
  }

  getAssetType() {
    return this.pAssetType;
  }

  setDownloadName(tURL) {
    this.pDownloadURL = tURL;
  }

  getDownloadName() {
    const tOffset = offset("?", this.pDownloadURL);
    let tDownloadURLNoParams;
    if (tOffset) {
      tDownloadURLNoParams = this.pDownloadURL.char[`${1}..${tOffset - 1}`];
    } else {
      tDownloadURLNoParams = this.pDownloadURL;
    }
    return tDownloadURLNoParams;
  }

  setIndexing(tAllowIndexing) {
    this.pAllowindexing = tAllowIndexing;
  }

  getIndexing() {
    return this.pAllowindexing;
  }

  setParentId(tParentId) {
    this.pParentId = tParentId;
  }

  getParentId() {
    return this.pParentId;
  }

  sendTimeoutCallbacks(tArguments) {
    call(tArguments[1], tArguments[2], tArguments[3], tArguments[4], tArguments[5]);
  }
}
