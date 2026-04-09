// Client Initialization Script
// Translated from: 4_Client Initialization Script.ls

import {
  _global,
  VOID,
  voidp,
  the,
} from "../../director";

export default function () {
  _global.gCore = _global.gCore ?? VOID;

  return {
    initCore() {
      if (!_director.constructObjectManager()) {
        return 0;
      }
      if (!_director.dumpVariableField("System Props")) {
        return this.stopClient();
      }
      if (!_director.resetCastLibs(0, 0)) {
        return this.stopClient();
      }
      if (!_director.getResourceManager().preIndexMembers()) {
        return this.stopClient();
      }
      if (!_director.dumpTextField("System Texts")) {
        return this.stopClient();
      }
      if (!_director.getThreadManager().create(Symbol.for("core"), Symbol.for("core"))) {
        return this.stopClient();
      }
      return 1;
    },

    stopClient() {
      if (the.runMode.includes("Author")) {
        if (voidp(_global.gCore)) {
          return 0;
        }
        if (the.runMode.includes("Author")) {
          _director.deconstructConnectionManager();
          _director.deconstructObjectManager();
          _director.deconstructErrorManager();
        }
      }
      return 0;
    },

    resetClient() {
      if (the.runMode.includes("Author")) {
        this.stopClient();
      } else {
        let tURL = _director.getMoviePath();
        if (_director.objectExists(Symbol.for("session"))) {
          if (_director.getObject(Symbol.for("session")).exists("client_url")) {
            tURL = _director.deobfuscate(
              _director.getObject(Symbol.for("session")).GET("client_url"),
            );
          }
        }
        _director.gotoNetPage(tURL);
      }
      return 1;
    },
  };
}
