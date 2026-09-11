export default class {
  pUserList;
  pUserListFilter;
  pExcludeList;
  pTicketsLeft;

  construct() {
    this.pUserList = VOID;
    this.pExcludeList = list();
    this.pUserListFilter = 1;
    this.pTicketsLeft = 0;
    return 1;
  }

  deconstruct() {
    return this.ancestor.deconstruct();
  }

  getUserList() {
    if (this.pUserList == VOID) {
      return this.getHandler().send_LIST_POSSIBLE_INVITEES(this.pUserListFilter);
    }
    return this.pUserList;
  }

  changeUserListFilter(tFilter) {
    if (tFilter == VOID) {
      return 0;
    }
    if (tFilter == this.pUserListFilter) {
      return 1;
    }
    this.pUserListFilter = tFilter;
    return this.getHandler().send_LIST_POSSIBLE_INVITEES(this.pUserListFilter);
  }

  getUserListFilter() {
    return this.pUserListFilter;
  }

  sendInviteToListIndex(tIndex, tMessage) {
    put("* sendInviteToListIndex", `${tIndex} ${tMessage}`);
    if (tIndex == VOID) {
      return 0;
    }
    if (this.pUserList == VOID) {
      return 0;
    }
    if (this.pUserList.count < tIndex) {
      return 0;
    }
    const tUserName = this.pUserList[tIndex];
    this.getHandler().send_INVITE_USER(tUserName, tMessage);
    this.pExcludeList.append(tUserName);
    put("* TODO: how to exclude people..");
    return 1;
  }

  sendInviteToName(tUserName, tMessage) {
    put("* sendInviteToName", `${tUserName} ${tMessage}`);
    if (tUserName == EMPTY) {
      return 0;
    }
    this.getHandler().send_INVITE_USER(tUserName, tMessage);
    this.pExcludeList.append(tUserName);
    put("* TODO: how to exclude people..");
    return 1;
  }

  excludeListIndex(tIndex) {
    put("* TODO: excludeListIndex", `${tIndex}`);
    if (tIndex == VOID) {
      return 0;
    }
    if (this.pUserList == VOID) {
      return 0;
    }
    if (this.pUserList.count < tIndex) {
      return 0;
    }
    const tUserName = this.pUserList[tIndex];
    this.pExcludeList.append(tUserName);
    put("* TODO: how to exclude people..", `${tUserName}`);
    return 1;
  }

  saveInviteTicketCount(tNum) {
    this.pTicketsLeft = tNum;
    return 1;
  }

  getInviteTicketCount() {
    return this.pTicketsLeft;
  }

  showInviteResponse(tdata) {
    put(this.getID(), "* showInviteResponse", `${tdata}`);
    return 1;
  }

  saveInviteData(tdata) {
    this.pUserListFilter = tdata.getaProp(Symbol.for("list_type"));
    this.pUserList = tdata.getaProp(Symbol.for("invitee_list"));
    return 1;
  }

  update() {
  }

  render() {
  }
}
