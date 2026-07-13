let gCore;

export function initCore() {
  if (!constructObjectManager()) {
    return 0;
  }
  if (!dumpVariableField("System Props")) {
    return stopClient();
  }
  if (!resetCastLibs(0, 0)) {
    return stopClient();
  }
  if (!getResourceManager().preIndexMembers()) {
    return stopClient();
  }
  if (!dumpTextField("System Texts")) {
    return stopClient();
  }
  if (!getThreadManager().create(Symbol.for("core"), Symbol.for("core"))) {
    return stopClient();
  }
  return 1;
}

export function stopClient() {
  if (the.runMode.contains("Author")) {
    if (voidp(gCore)) {
      return 0;
    }
    if (the.runMode.contains("Author")) {
      deconstructConnectionManager();
      deconstructObjectManager();
      deconstructErrorManager();
    }
  }
  return 0;
}

export function resetClient() {
  if (the.runMode.contains("Author")) {
    stopClient();
  } else {
    const tURL = getMoviePath();
    if (objectExists(Symbol.for("session"))) {
      if (getObject(Symbol.for("session")).exists("client_url")) {
        tURL = deobfuscate(getObject(Symbol.for("session")).GET("client_url"));
      }
    }
    gotoNetPage(tURL);
  }
  return 1;
}
