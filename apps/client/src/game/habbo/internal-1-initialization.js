export function prepareMovie() {
  if (!(the.runMode.contains("Author"))) {
    let tProcessLogURL = EMPTY;
    let tAccountID = EMPTY;
    let tDelim = the.itemDelimiter;
    for (let i = 1; i <= 9; i++) {
      let tParamBundle = externalParamValue(`${"sw"}${i}`);
      if (!voidp(tParamBundle)) {
        the.itemDelimiter = ";";
        for (let j = 1; j <= tParamBundle.item.count; j++) {
          let tParam = tParamBundle.item[j];
          the.itemDelimiter = "=";
          if (tParam.item.count > 1) {
            let tKey = tParam.item[1];
            let tValue = tParam.item[`${2}..${tParam.item.count}`];
            if (tKey == "processlog.url") {
              tProcessLogURL = tValue;
            } else {
              if (tKey == "account_id") {
                tAccountID = tValue;
              }
            }
          }
          the.itemDelimiter = ";";
        }
      }
    }
    the.itemDelimiter = tDelim;
    if (tProcessLogURL != EMPTY) {
      postNetText(tProcessLogURL, propList("step", 8, "account_id", tAccountID));
    }
  }
  the.debugPlaybackEnabled = 0;
  castLib(2).preloadMode = 1;
  preloadNetThing(castLib(2).fileName);
  moveToFront(the.stage);
  the.exitLock = 1;
  puppetTempo(15);
}

export function stopMovie() {
  stopClient();
  go(1);
}
