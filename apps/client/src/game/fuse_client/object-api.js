// Object API
// Translated from: 6_Object API.ls

import {
  _global,
  field,
  list,
  listp,
  objectp,
  RETURN,
  script,
  value,
  voidp,
  VOID,
} from "../../director";

export default function () {
  _global.gCore = _global.gCore ?? VOID;

  return {
    constructObjectManager() {
      if (objectp(_global.gCore)) {
        return _global.gCore;
      }
      const tProps = value(
        _director.convertToPropList(field("System Props"), RETURN),
      );
      const tClass = tProps["object.manager.class"][1];
      _global.gCore = script(tClass).new();
      _global.gCore.construct();
      return _global.gCore;
    },

    deconstructObjectManager() {
      if (voidp(_global.gCore)) {
        return 0;
      }
      _global.gCore.deconstruct();
      _global.gCore = VOID;
      return 1;
    },

    getObjectManager() {
      if (voidp(_global.gCore)) {
        return this.constructObjectManager();
      }
      return _global.gCore;
    },

    createObject(tID) {
      const tClassList = list();
      for (let i = 2; i <= arguments.length; i++) {
        const tParam = arguments[i - 1];
        if (listp(tParam)) {
          for (const tClass of tParam._items) {
            tClassList.add(tClass);
          }
          continue;
        }
        tClassList.add(tParam);
      }
      return this.getObjectManager().create(tID, tClassList);
    },

    removeObject(tID) {
      return this.getObjectManager().Remove(tID);
    },

    getObject(tID) {
      return this.getObjectManager().GET(tID);
    },

    objectExists(tID) {
      return this.getObjectManager().exists(tID);
    },

    printObjects() {
      return this.getObjectManager().print();
    },

    registerObject(tID, tObject) {
      return this.getObjectManager().registerObject(tID, tObject);
    },

    unregisterObject(tID) {
      return this.getObjectManager().unregisterObject(tID);
    },

    createManager(tID) {
      const tClassList = list();
      for (let i = 2; i <= arguments.length; i++) {
        const tParam = arguments[i - 1];
        if (listp(tParam)) {
          for (const tClass of tParam._items) {
            tClassList.add(tClass);
          }
          continue;
        }
        tClassList.add(tParam);
      }
      const tObjMngr = this.getObjectManager();
      const tObjInst = tObjMngr.create(tID, tClassList);
      tObjMngr.registerManager(tID);
      tObjMngr.setaProp(tID, tObjInst);
      return tObjInst;
    },

    removeManager(tID) {
      return this.getObjectManager().Remove(tID);
    },

    getManager(tID) {
      return this.getObjectManager().getManager(tID);
    },

    managerExists(tID) {
      return this.getObjectManager().managerExists(tID);
    },

    printManagers() {
      return this.getObjectManager().print();
    },

    registerManager(tID) {
      return this.getObjectManager().registerManager(tID);
    },

    unregisterManager(tID) {
      return this.getObjectManager().unregisterManager(tID);
    },

    receivePrepare(tID) {
      return this.getObjectManager().receivePrepare(tID);
    },

    removePrepare(tID) {
      return this.getObjectManager().removePrepare(tID);
    },

    receiveUpdate(tID) {
      return this.getObjectManager().receiveUpdate(tID);
    },

    removeUpdate(tID) {
      return this.getObjectManager().removeUpdate(tID);
    },

    pauseUpdate() {
      return this.getObjectManager().pauseUpdate();
    },

    unpauseUpdate() {
      return this.getObjectManager().resumeUpdate();
    },
  };
}
