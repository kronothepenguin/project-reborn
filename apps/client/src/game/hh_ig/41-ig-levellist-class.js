export default class {
  pSelectedLevelId;
  pInviteMaxCount;
  pInviteSentData;

  construct() {
    pSelectedLevelId = -1;
    pInviteMaxCount = 5;
    pInviteSentData = propList();
    this.pTimeoutUpdates = 0;
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  Initialize() {
    this.pListItemContainerClass = list("IG ItemContainer Base Class", "IG LevelInstanceData Class");
    this.pollContentUpdate();
  }

  storeLevelListInfo(tLevelData) {
    this.storeNewList(tLevelData, 0);
    if (this.getSelectedLevelId() == -1) {
      this.selectLevel(this.getListIdByIndex(1), 1);
    }
    return 1;
  }

  getMainListIds(tPageSize) {
    const tFirst = 1;
    const tLast = tFirst + tPageSize - 1;
    const tList = list();
    for (let i = tFirst; i <= tLast; i++) {
      if (i <= this.pListIndex.count) {
        tList.append(this.pListIndex[i]);
      }
    }
    return tList;
  }

  createGame() {
    const tLevelItem = this.getSelectedLevel();
    if (tLevelItem == 0) {
      return 0;
    }
    const tTypeService = this.getIGComponent("GameTypes");
    const tGameParams = tTypeService.convertGamePropsForCreate(tLevelItem.getProperty(Symbol.for("game_type")), tLevelItem.dump());
    if (tGameParams == 0) {
      return 0;
    }
    executeMessage(Symbol.for("sendTrackingPoint"), "/game/created");
    put(`${pSelectedLevelId} ${tGameParams}`);
    return this.getHandler().send_CREATE_GAME(string(pSelectedLevelId), tGameParams);
  }

  selectLevel(tLevelId, tRenderFlag) {
    if (voidp(tLevelId)) {
      tLevelId = -1;
    }
    pSelectedLevelId = tLevelId;
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.resetSubComponent("Details");
    tRenderObj.setViewMode(Symbol.for("Info"));
    return 1;
  }

  getSelectedLevelId() {
    return pSelectedLevelId;
  }

  getSelectedLevel() {
    const tItemRef = this.getListEntry(pSelectedLevelId);
    if (tItemRef == 0) {
      return error(this, `No selected level item! ${pSelectedLevelId}`, Symbol.for("getSelectedLevel"));
    }
    return tItemRef;
  }

  getRemInviteCount() {
    return pInviteMaxCount - pInviteSentData.count;
  }

  setProperty(tKey, tValue) {
    const tLevelRef = this.getSelectedLevel();
    if (tLevelRef == 0) {
      return 0;
    }
    tLevelRef.setProperty(tKey, tValue);
    const tRenderObj = this.getRenderer();
    if (tRenderObj == 0) {
      return 0;
    }
    tRenderObj.renderProperty(tKey, tLevelRef.getProperty(tKey));
    return 1;
  }

  handleUpdate(tUpdateId, tSenderId) {
    switch (tSenderId) {
      case "LevelList":
        const tItemRef = this.getSelectedLevel();
        if (tItemRef != 0) {
          if (tUpdateId == tItemRef.getProperty(Symbol.for("id"))) {
            return this.renderUI();
          }
        }
        break;
    }
    return 1;
  }

  pollContentUpdate(tForced) {
    if (!tForced && !this.isUpdateTimestampExpired()) {
      return 0;
    }
    this.setUpdateTimestamp();
    return this.getHandler().send_GET_CREATE_GAME_INFO();
  }
}
