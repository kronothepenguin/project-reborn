export default class {
  pListIndex;
  pListData;
  pListItemContainerClass;

  construct() {
    this.pListIndex = list();
    this.pListData = propList();
    return this.ancestor.construct();
  }

  deconstruct() {
    this.pListIndex = list();
    this.pListData = propList();
    return this.ancestor.deconstruct();
  }

  storeNewList(tdata, tOverwrite) {
    if (!listp(tdata)) {
      return 0;
    }
    const tPurgeList = this.pListIndex.duplicate();
    for (let i = 1; i <= tdata.count; i++) {
      tPurgeList.deleteOne(tdata[i].getaProp(Symbol.for("id")));
    }
    for (const tID of tPurgeList) {
      this.removeListEntry(tID);
    }
    this.pListIndex = list();
    for (const tInstanceData of tdata) {
      const tItemID = tInstanceData.getaProp(Symbol.for("id"));
      if (this.pListIndex.findPos(tItemID) == 0) {
        this.pListIndex.append(tItemID);
      }
      if ((this.pListData.findPos(tItemID) == 0) || tOverwrite) {
        this.updateListItemObject(tInstanceData);
      }
    }
    this.setUpdateTimestamp();
    return this.announceUpdate(this.pListIndex);
  }

  updateEntry(tdata) {
    const tObject = this.updateListItemObject(tdata);
    if (tObject != 0) {
      this.announceUpdate(tdata.getaProp(Symbol.for("id")));
    }
    return tObject;
  }

  getListEntry(tID) {
    if (voidp(tID)) {
      return 0;
    }
    return pListData.getaProp(tID);
  }

  getListCount() {
    return pListData.count;
  }

  dump() {
    return this.pListData;
  }

  updateListItemObject(tInstanceData) {
    if (!listp(tInstanceData)) {
      return 0;
    }
    if (!tInstanceData.findPos(Symbol.for("id"))) {
      return error(this, `List instance struct must contain id! ${tInstanceData}`, Symbol.for("updateListItemObject"));
    }
    const tID = tInstanceData.getaProp(Symbol.for("id"));
    let tObject = this.pListData.getaProp(tID);
    if (tObject == 0) {
      tObject = this.getNewListItemObject();
      if (tObject == 0) {
        return 0;
      }
      tObject.define(tInstanceData);
      this.pListData.setaProp(tID, tObject);
      if (this.pListIndex.findPos(tID) == 0) {
        this.pListIndex.append(tID);
      }
    } else {
      tObject.Refresh(tInstanceData);
    }
    return tObject;
  }

  getListIdByIndex(tIndex) {
    if (tIndex < 1) {
      return -1;
    }
    if (tIndex > pListIndex.count) {
      return -1;
    }
    return pListIndex[tIndex];
  }

  removeListEntry(tID) {
    const tObject = this.pListData.getaProp(tID);
    if (objectp(tObject)) {
      tObject.deconstruct();
    }
    this.pListIndex.deleteOne(tID);
    this.pListData.deleteProp(tID);
  }

  getNewListItemObject() {
    const tObject = createObject(Symbol.for("temp"), this.pListItemContainerClass);
    if (tObject == 0) {
      return 0;
    }
    tObject.pIGComponentId = this.getID();
    return tObject;
  }
}
