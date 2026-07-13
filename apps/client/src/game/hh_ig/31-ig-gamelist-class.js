export default class {
  pListMaxCount;
  pObservedGameObj;
  pJoinedGameObj;
  pPendingObservedGameId;

  construct() {
    pListMaxCount = 50;
    pObservedGameObj = VOID;
    pJoinedGameObj = VOID;
    pPendingObservedGameId = -1;
    this.pListItemContainerClass = list("IG ItemContainer Base Class", "IG GameInstanceData Class");
    this.pTimeoutUpdates = 1;
    this.pHiddenUpdates = 0;
    return 1;
  }

  deconstruct() {
    pObservedGameObj = VOID;
    pJoinedGameObj = VOID;
    return this.ancestor.deconstruct();
  }

  Initialize() {
    this.pollContentUpdate();
    return this.registerForIGComponentUpdates("LevelList");
  }

  storeGameInstance(tInstanceData) {
    if (!listp(tInstanceData)) {
      return 0;
    }
    if (tInstanceData.findPos(Symbol.for("id")) == 0) {
      return 0;
    }
    const tGameId = tInstanceData.getaProp(Symbol.for("id"));
    if (tGameId == this.getJoinedGameId()) {
      this.storeJoinedGameInstance(tInstanceData);
    } else {
      this.storeObservedGameInstance(tInstanceData);
    }
    if (tGameId == pPendingObservedGameId) {
      pPendingObservedGameId = -1;
    }
    return 1;
  }

  storeObservedGameInstance(tdata) {
    if (!listp(tdata)) {
      return this.setObservedGameId(-1);
    }
    const tGameId = tdata.getaProp(Symbol.for("id"));
    const tGameRef = this.getGameEntry(tGameId);
    if (objectp(tGameRef)) {
      pObservedGameObj = tGameRef;
      pObservedGameObj.Refresh(tdata);
    } else {
      if (pObservedGameObj == 0) {
        pObservedGameObj = this.getNewListItemObject();
        if (pObservedGameObj == 0) {
          return 0;
        }
      }
      pObservedGameObj.Refresh(tdata);
    }
    if (pObservedGameObj != 0) {
      this.announceUpdate(tGameId);
    }
    if (this.getActiveFlag()) {
      if (pPendingObservedGameId > -1) {
        this.renderUI("List");
      }
    }
    return 1;
  }

  addUserToGame(tdata) {
    const tGameId = tdata.getaProp(Symbol.for("game_id"));
    const tGameRef = this.getGameEntry(tGameId);
    if (tGameRef == 0) {
      return 0;
    }
    if (tGameRef.addUserToGame(tdata)) {
      if (tdata.getaProp(Symbol.for("name")) == this.getOwnPlayerName()) {
        pJoinedGameObj = tGameRef;
      }
    }
    return 1;
  }

  storeJoinedGameInstance(tdata) {
    let tNotOwnerAlready;
    if (objectp(pJoinedGameObj)) {
      tNotOwnerAlready = !pJoinedGameObj.checkIfOwnerOfGame();
    }
    if (listp(tdata)) {
      const tGameId = tdata.getaProp(Symbol.for("id"));
      const tGameRef = this.getGameEntry(tGameId);
      if (objectp(tGameRef)) {
        pJoinedGameObj = tGameRef;
      } else {
        if (pJoinedGameObj == 0) {
          pJoinedGameObj = this.getNewListItemObject();
          if (pJoinedGameObj == 0) {
            return 0;
          }
        }
      }
      if (pJoinedGameObj != 0) {
        pJoinedGameObj.Refresh(tdata);
        this.announceUpdate(tGameId);
      }
    } else {
      pJoinedGameObj = 0;
    }
    const tComponent = this.getComponent();
    if (tComponent.getSystemState() != Symbol.for("ready")) {
      return 1;
    }
    if (!objectp(pJoinedGameObj)) {
      this.getInterface().resetToDefaultAndHide();
      this.getHandler().send_ROOM_GAME_STATUS(0);
    } else {
      const tActiveMode = tComponent.getActiveIGComponentId();
      if ((tNotOwnerAlready == 1) && pJoinedGameObj.checkIfOwnerOfGame()) {
        this.announceUpdate(Symbol.for("owner_of_game"));
      }
    }
    return 1;
  }

  removeGameInstance(tGameId) {
    if (voidp(tGameId)) {
      return 0;
    }
    if (tGameId == pPendingObservedGameId) {
      pPendingObservedGameId = -1;
    }
    this.removeListEntry(tGameId);
    if (objectp(pJoinedGameObj)) {
      if (pJoinedGameObj.getItemId() == tGameId) {
        this.storeJoinedGameInstance(0);
        if (!objectp(pObservedGameObj)) {
          this.setObservedGameId(-1);
        }
      }
    }
    if (objectp(pObservedGameObj)) {
      if (pObservedGameObj.getItemId() == tGameId) {
        pObservedGameObj = 0;
        this.setObservedGameId(-1);
      }
    }
    return 1;
  }

  storeGameList(tdata) {
    tdata = tdata.getaProp(Symbol.for("list"));
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
      if (this.pListData.findPos(tItemID) == 0) {
        if (tItemID == this.getJoinedGameId()) {
          this.pJoinedGameObj.Refresh(tInstanceData);
          this.pListData.setaProp(tItemID, this.pJoinedGameObj);
          continue;
        }
        if (tItemID == this.getObservedGameId()) {
          this.pObservedGameObj.Refresh(tInstanceData);
          this.pListData.setaProp(tItemID, this.pObservedGameObj);
          continue;
        }
        this.updateListItemObject(tInstanceData);
      }
    }
    this.setUpdateTimestamp();
    this.announceUpdate(this.pListIndex);
    if (this.getObservedGameId() == -1) {
      this.setObservedGameId(-1);
    }
    return this.renderUI("List");
  }

  removeUserFromGame(tdata) {
    const tGameId = tdata.getaProp(Symbol.for("game_id"));
    const tPlayerId = tdata.getaProp(Symbol.for("id"));
    const tGameRef = this.getGameEntry(tGameId);
    if (tGameRef == 0) {
      return 0;
    }
    const tPlayer = tGameRef.getPlayerById(tPlayerId);
    if (tPlayer == 0) {
      return 0;
    }
    tGameRef.removeUserFromGame(tdata);
    if (tPlayer.getaProp(Symbol.for("name")) == this.getOwnPlayerName()) {
      this.storeJoinedGameInstance(0);
      pObservedGameObj = VOID;
      this.setObservedGameId(tGameId);
      if (this.getComponent().getSystemState() == Symbol.for("ready")) {
        this.getInterface().ChangeWindowView("GameList");
      }
      if (tdata.getaProp(Symbol.for("was_kicked"))) {
        this.getInterface().showBasicAlert("ig_error_kicked");
      }
    }
    return 1;
  }

  getJoinedGame() {
    return pJoinedGameObj;
  }

  getJoinedGameId() {
    if (pJoinedGameObj == 0) {
      return -1;
    }
    return pJoinedGameObj.getItemId();
  }

  joinTeamWithLeastMembers(tGameId) {
    if (this.getHandler().send_JOIN_GAME(tGameId, -1)) {
      pJoinedGameObj = this.getGameEntry(tGameId);
      return 1;
    } else {
      return 0;
    }
  }

  leaveJoinedGame(tKeepObserving) {
    if (!tKeepObserving) {
      this.getInterface().resetToDefaultAndHide();
    }
    if (objectp(pJoinedGameObj)) {
      if (pJoinedGameObj.getPlayerCount() == 1) {
      } else {
        if (tKeepObserving == 1) {
          this.setObservedGameId(pJoinedGameObj.getProperty(Symbol.for("id")));
        }
      }
      this.getHandler().send_LEAVE_GAME();
    }
    return 1;
  }

  setJoinedGameId(tGameId, tTeamIndex) {
    if (voidp(tGameId) || (tGameId == -1)) {
      return 0;
    }
    if (this.getHandler().send_JOIN_GAME(tGameId, tTeamIndex)) {
      pJoinedGameObj = this.getGameEntry(tGameId);
      return 1;
    } else {
      return 0;
    }
  }

  setNextTeamInJoinedGame() {
    const tGameRef = this.getJoinedGame();
    if (tGameRef == 0) {
      return 0;
    }
    let tTeamIndex = tGameRef.getOwnPlayerTeam();
    const tTeamCount = tGameRef.getTeamCount();
    if (tTeamIndex < tTeamCount) {
      tTeamIndex = tTeamIndex + 1;
    } else {
      tTeamIndex = 1;
    }
    return this.getHandler().send_JOIN_GAME(tGameRef.getItemId(), tTeamIndex);
  }

  getObservedGame() {
    return pObservedGameObj;
  }

  getObservedGameId() {
    if (pObservedGameObj == 0) {
      return -1;
    }
    return pObservedGameObj.getItemId();
  }

  setObservedGameId(tGameId) {
    const tCurrentId = this.getObservedGameId();
    if (voidp(tGameId) || (tGameId == -1)) {
      pObservedGameObj = 0;
      if (this.getActiveFlag()) {
        const tNewDefault = this.getObservedGameDefault();
        if ((tCurrentId == -1) && (tNewDefault == -1)) {
          this.renderUI();
          return 1;
        }
        if (tCurrentId == -1) {
          return this.setObservedGameId(tNewDefault);
        }
        this.renderUI();
      } else {
        if (tCurrentId == -1) {
          return 1;
        }
      }
      return this.getHandler().send_STOP_OBSERVING_GAME(tCurrentId);
    } else {
      if (!this.getActiveFlag()) {
        return 1;
      }
      if (tGameId == pPendingObservedGameId) {
        return 1;
      }
      pObservedGameObj = this.getGameEntry(tGameId);
      pPendingObservedGameId = tGameId;
      return this.getHandler().send_START_OBSERVING_GAME(tGameId, 1);
    }
  }

  setObservedGameIdExplicit(tGameId) {
    const tCurrentId = this.getObservedGameId();
    if (tGameId == tCurrentId) {
      return 1;
    }
    if (tGameId == pPendingObservedGameId) {
      return 1;
    }
    pObservedGameObj = this.getGameEntry(tGameId);
    pPendingObservedGameId = tGameId;
    return this.getHandler().send_START_OBSERVING_GAME(tGameId, 1);
  }

  pollContentUpdate(tForced) {
    const tMainThread = this.getMainThread();
    if (tMainThread == 0) {
      return 0;
    }
    if (!tForced && !this.isUpdateTimestampExpired()) {
      return 0;
    }
    this.setUpdateTimestamp();
    return tMainThread.getHandler().send_GET_GAME_LIST(0, pListMaxCount);
  }

  handleUpdate(tUpdateId, tSenderId) {
    switch (tSenderId) {
      case "LevelList":
        const tItemRef = this.getObservedGame();
        if (tItemRef != 0) {
          if (tUpdateId == tItemRef.getProperty(Symbol.for("level_id"))) {
            return this.renderUI();
          }
        }
        break;
      case "GameList":
        if (tUpdateId == this.getObservedGameId()) {
          return this.resetSubComponent("Details");
        } else {
          return this.renderUI("List");
        }
        break;
    }
    return 1;
  }

  setActiveFlag(tstate, tHoldUpdates) {
    this.ancestor.setActiveFlag(tstate, tHoldUpdates);
    if (this.getActiveFlag()) {
      this.setObservedGameId(this.getObservedGameId());
    } else {
      this.setObservedGameId(-1);
    }
    return 1;
  }

  getGameEntry(tID) {
    const tItemRef = this.ancestor.getListEntry(tID);
    if (tItemRef != 0) {
      return tItemRef;
    }
    if (this.getJoinedGameId() == tID) {
      return this.getJoinedGame();
    }
    if (this.getObservedGameId() == tID) {
      return this.getObservedGame();
    }
    return 0;
  }

  getObservedGameDefault() {
    if (this.getJoinedGameId() == -1) {
      return this.getListIdByIndex(1);
    } else {
      return this.getJoinedGameId();
    }
  }

  getMainListIds(tPageSize) {
    const tJoinedGameId = this.getJoinedGameId();
    const tFirst = 1;
    let tLast = tFirst + tPageSize - 1;
    const tList = list();
    if (tJoinedGameId > -1) {
      tList.append(tJoinedGameId);
      tLast = tLast - 1;
    }
    for (let i = tFirst; i <= tLast; i++) {
      if (i <= this.pListData.count) {
        const tGameId = this.pListData.getPropAt(i);
        if (tGameId != tJoinedGameId) {
          tList.append(this.pListData.getPropAt(i));
          continue;
        }
        tLast = tLast + 1;
      }
    }
    return tList;
  }
}
