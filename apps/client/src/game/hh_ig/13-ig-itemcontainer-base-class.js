export default class {
  pIGComponentId;
  pData;

  construct() {
    pData = propList();
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  define(tdata) {
    return this.Refresh(tdata);
  }

  Refresh(tdata) {
    if (!listp(tdata)) {
      return 0;
    }
    for (let i = 1; i <= tdata.count; i++) {
      const tKey = tdata.getPropAt(i);
      const tValue = tdata[i];
      this.pData.setaProp(tKey, tValue);
    }
    return 1;
  }

  getProperty(tKey) {
    return this.pData.getaProp(tKey);
  }

  exists(tKey) {
    return this.pData.findPos(tKey);
  }

  setProperty(tKey, tValue) {
    const tOldValue = this.pData.getaProp(tKey);
    if (ilk(tOldValue) == Symbol.for("list")) {
      if (ilk(tValue) != Symbol.for("list")) {
        if (tOldValue.findPos(tValue)) {
          tOldValue.deleteOne(tValue);
        } else {
          tOldValue.append(tValue);
        }
        tValue = tOldValue;
      }
    }
    this.pData.setaProp(tKey, tValue);
    return 1;
  }

  getItemId() {
    return pData.getaProp(Symbol.for("id"));
  }

  dump() {
    return pData;
  }

  getIGComponent(tServiceId) {
    const towner = this.getOwnerIGComponent();
    if (towner == 0) {
      return 0;
    }
    return towner.getIGComponent(tServiceId);
  }

  getOwnerIGComponent() {
    return getObject(pIGComponentId);
  }
}
