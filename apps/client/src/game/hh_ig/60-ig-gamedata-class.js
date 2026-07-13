export default class {
  pPlayerData;
  pRoomIndexIndex;

  construct() {
    this.clear();
    registerMessage(Symbol.for("ig_clear_game_info"), this.getID(), Symbol.for("clear"));
    registerMessage(Symbol.for("ig_store_game_info"), this.getID(), Symbol.for("define"));
    registerMessage(Symbol.for("ig_store_gameplayer_info"), this.getID(), Symbol.for("storeUser"));
    registerMessage(Symbol.for("ig_user_left_game"), this.getID(), Symbol.for("userLeftGame"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("ig_clear_game_info"), this.getID());
    unregisterMessage(Symbol.for("ig_store_game_info"), this.getID());
    unregisterMessage(Symbol.for("ig_store_gameplayer_info"), this.getID());
    unregisterMessage(Symbol.for("ig_user_left_game"), this.getID());
    this.clear();
    return this.ancestor.deconstruct();
  }

  storeUser(tdata) {
    if (!listp(tdata)) {
      return 0;
    }
    let tID = tdata.getaProp(Symbol.for("id"));
    this.pPlayerData.setaProp(tID, tdata);
    const tRoomIndex = tdata.getaProp(Symbol.for("room_index"));
    if (!voidp(tRoomIndex)) {
      this.pRoomIndexIndex.setaProp(tRoomIndex, tID);
    }
    return 1;
  }

  userLeftGame(tRoomIndex) {
    if (voidp(tRoomIndex)) {
      return 0;
    }
    const tPlayerData = this.getPlayerInfoByRoomIndex(tRoomIndex);
    if (tPlayerData == 0) {
      return 0;
    }
    tPlayerData.setaProp(Symbol.for("disconnected"), 1);
    return 1;
  }

  clear() {
    this.pData = propList();
    this.pPlayerData = propList();
    this.pRoomIndexIndex = propList();
  }

  getPlayerIdByRoomIndex(tRoomIndex) {
    if (voidp(tRoomIndex)) {
      return -1;
    }
    const tID = this.pRoomIndexIndex.getaProp(tRoomIndex);
    if (voidp(tID)) {
      return -1;
    }
    return tID;
  }

  getPlayerInfo(tPlayerId) {
    if (this.pPlayerData.getaProp(tPlayerId) == 0) {
      put("Not found!", `${this.pPlayerData}`);
    }
    if (voidp(tPlayerId)) {
      return 0;
    }
    return this.pPlayerData.getaProp(tPlayerId);
  }

  getPlayerInfoByRoomIndex(tRoomIndex) {
    return this.getPlayerInfo(this.getPlayerIdByRoomIndex(tRoomIndex));
  }

  dump() {
    put("* GAMEDATA DUMP:");
    put("pData:", `${this.pData}`);
    put("pPlayerData:", `${this.pPlayerData}`);
    put("* room indexes:", `${this.pRoomIndexIndex}`);
  }
}
