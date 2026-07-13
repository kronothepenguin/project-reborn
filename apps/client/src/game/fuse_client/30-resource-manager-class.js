export default class {
  pAllMemNumList;
  pDynMemNumList;
  pBmpMemNumList;
  pLegalDuplicates;
  pBin;

  construct() {
    this.pAllMemNumList = propList();
    this.pAllMemNumList.sort();
    this.pDynMemNumList = list();
    this.pDynMemNumList.sort();
    this.pBmpMemNumList = list();
    this.pBmpMemNumList.sort();
    this.pBin = getVariable("dynamic.bin.cast", "bin");
    this.pLegalDuplicates = list();
    this.pLegalDuplicates.add(getVariable("thread.index.field"));
    this.pLegalDuplicates.add(getVariable("alias.index.field"));
    this.pLegalDuplicates.add(getVariable("texts.index.field"));
    this.pLegalDuplicates.add(getVariable("props.index.field"));
    if (the.runMode.contains("Author")) {
      this.emptyDynamicBin();
    }
    return 1;
  }

  deconstruct() {
    if (the.runMode.contains("Author")) {
      this.deleteDynamicMembers();
    }
    this.pAllMemNumList = propList();
    return 1;
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case Symbol.for("memberCount"):
        return this.pAllMemNumList.count();
      case Symbol.for("dynMemCount"):
        return this.pDynMemNumList.count();
      default:
        return 0;
    }
  }

  setProperty(tPropID, tValue) {
    switch (tPropID) {
      default:
        return 0;
    }
  }

  createMember(tMemName, ttype, tForcedDuplicate) {
    if (!voidp(this.pAllMemNumList[tMemName]) && !tForcedDuplicate) {
      error(this, `Member already exists: ${tMemName}`, Symbol.for("createMember"), Symbol.for("minor"));
      return this.getmemnum(tMemName);
    }
    let tmember;
    if ((ttype == Symbol.for("bitmap")) && (this.pBmpMemNumList.count > 0)) {
      tmember = member(this.pBmpMemNumList[1]);
      this.pBmpMemNumList.deleteAt(1);
    } else {
      tmember = new(ttype, castLib(this.pBin));
      if (!ilk(tmember, Symbol.for("member"))) {
        return error(this, `Failed to create member: ${tMemName} ${ttype}`, Symbol.for("createMember"), Symbol.for("major"));
      }
    }
    tmember.name = tMemName;
    const tMemNum = tmember.number;
    this.pAllMemNumList[tMemName] = tMemNum;
    if (this.pDynMemNumList.getPos(tMemNum) == 0) {
      this.pDynMemNumList.add(tMemNum);
    }
    return tMemNum;
  }

  removeMember(tMemName) {
    const tMemNum = this.pAllMemNumList[tMemName];
    if (this.pDynMemNumList.getPos(tMemNum) < 1) {
      return error(this, `Can't delete member: ${tMemName}`, Symbol.for("removeMember"), Symbol.for("minor"));
    }
    const tmember = member(tMemNum);
    if (tmember.type == Symbol.for("bitmap")) {
      tmember.name = EMPTY;
      this.pBmpMemNumList.add(tMemNum);
    } else {
      tmember.erase();
    }
    this.pDynMemNumList.deleteOne(tMemNum);
    this.pAllMemNumList.deleteProp(tMemName);
    return 1;
  }

  getMember(tMemName) {
    let tMemNum = this.pAllMemNumList[tMemName];
    if (voidp(tMemNum)) {
      tMemNum = 0;
    }
    return member(tMemNum);
  }

  updateMember(tMemName) {
    if (tMemName.ilk != Symbol.for("string")) {
      return error(this, `Member's name required: ${tMemName}`, Symbol.for("updateMember"), Symbol.for("minor"));
    }
    if (!this.unregisterMember(tMemName)) {
      return 0;
    }
    if (!this.registerMember(tMemName)) {
      return 0;
    }
    return 1;
  }

  registerMember(tMemName, tMemberNum) {
    if (voidp(tMemberNum)) {
      tMemberNum = member(tMemName).number;
    }
    if (tMemberNum < 1) {
      return 0;
    }
    this.pAllMemNumList[tMemName] = tMemberNum;
    return tMemberNum;
  }

  unregisterMember(tMemName) {
    if (voidp(this.pAllMemNumList[tMemName])) {
      return 0;
    }
    this.pAllMemNumList.deleteProp(tMemName);
    return 1;
  }

  preIndexMembers(tCastNum) {
    let tFirstCast;
    let tLastCast;
    if (integerp(tCastNum)) {
      tFirstCast = tCastNum;
      tLastCast = tCastNum;
    } else {
      this.pAllMemNumList = propList();
      this.pAllMemNumList.sort();
      tFirstCast = 1;
      tLastCast = the.numberOfCastLibs;
    }
    const tNameAlertFlag = getIntVariable("duplicate.name.alert");
    for (let tCastLib = tFirstCast; tCastLib <= tLastCast; tCastLib++) {
      const tMemberCount = the.numberOfCastMembersOfCastLib(tCastLib);
      for (let i = 1; i <= tMemberCount; i++) {
        const tmember = member(i, tCastLib);
        if (length(tmember.name) > 0) {
          if (tNameAlertFlag) {
            if (!voidp(this.pAllMemNumList[tmember.name])) {
              if (this.pLegalDuplicates.getPos(tmember.name) == 0) {
                if (this.pAllMemNumList[tmember.name] != tmember.number) {
                  const tMemA = member(this.pAllMemNumList[tmember.name]);
                  const tMemB = tmember;
                  if ((tMemA.name != EMPTY) && (tMemB.name != EMPTY)) {
                    const tLibA = castLib(tMemA.castLibNum).name;
                    const tLibB = castLib(tMemB.castLibNum).name;
                    error(this, `Duplicate member names: ${tmember.name} / ${tLibA} / ${tLibB}`, Symbol.for("preIndexMembers"), Symbol.for("minor"));
                  }
                }
              }
            }
          }
          this.pAllMemNumList[tmember.name] = tmember.number;
        }
      }
      let tVarIndex = getVariable("props.index.field");
      if (member(tVarIndex, tCastLib).number > 0) {
        getVariableManager().dump(member(tVarIndex, tCastLib).number, RETURN, 0);
      }
      tVarIndex = getVariable("override.props.index.field");
      if (member(tVarIndex, tCastLib).number > 0) {
        getVariableManager().dump(member(tVarIndex, tCastLib).number, RETURN, 1);
      }
      const tAliasIndex = getVariable("alias.index.field");
      if (member(tAliasIndex, tCastLib).number > 0) {
        this.readAliasIndexesFromField(tAliasIndex, tCastLib);
      }
      const tClsIndex = getVariable("class.index.field");
      if (member(tClsIndex, tCastLib).number > 0) {
        getObject(Symbol.for("classes")).dump(member(tClsIndex, tCastLib).number);
      }
    }
    return 1;
  }

  readAliasIndexesFromField(tAliasIndex, tCastlibNo) {
    const tAliasList = field(tAliasIndex, tCastlibNo);
    const tItemDeLim = the.itemDelimiter;
    the.itemDelimiter = "=";
    for (let i = 1; i <= tAliasList.line.count; i++) {
      const tLine = tAliasList.line[i];
      if (length(tLine) > 2) {
        let tName = item(2).to(the.numberOfItemsIn(tLine)).of(tLine);
        let tNumber;
        let tReplacingNum;
        if (the.lastCharIn(tName) == "*") {
          tName = tName.char[`1..${length(tName) - 1}`];
          tNumber = this.pAllMemNumList[tName];
          if (tNumber > 0) {
            tReplacingNum = -tNumber;
          } else {
            tReplacingNum = tNumber;
          }
        } else {
          tNumber = this.pAllMemNumList[tName];
          tReplacingNum = tNumber;
        }
        if (tNumber > 0) {
          const tMemName = item(1).of(tLine);
          this.pAllMemNumList[tMemName] = tReplacingNum;
        }
      }
    }
    the.itemDelimiter = tItemDeLim;
  }

  unregisterMembers(tCastNum) {
    if (voidp(tCastNum)) {
      return this.clearMemNumLists();
    }
    const tMemberCount = the.numberOfCastMembersOfCastLib(tCastNum);
    for (let i = 1; i <= tMemberCount; i++) {
      const tmember = member(i, tCastNum);
      const tTempNum = this.pAllMemNumList[tmember.name];
      if (tTempNum != VOID) {
        if (tTempNum == tmember.number) {
          this.pAllMemNumList.deleteProp(tmember.name);
        }
      }
      if (this.pDynMemNumList.getPos(tmember.name) > 0) {
        this.pDynMemNumList.deleteAt(this.pDynMemNumList.getPos(tmember.name));
      }
    }
    const tAliasIndex = getVariable("alias.index.field");
    if (member(tAliasIndex, tCastNum).number > 0) {
      const tAliasList = field(tAliasIndex, tCastNum);
      for (let i = 1; i <= the.numberOfLinesIn(tAliasList); i++) {
        const tLine = tAliasList.line[i];
        if (length(tLine) > 2) {
          let tName = item(2).to(the.numberOfItemsIn(tLine)).of(tLine);
          if (the.lastCharIn(tName) == "*") {
            tName = tName.char[`1..${length(tName) - 1}`];
          }
          if (!voidp(this.pAllMemNumList[tName])) {
            const tMemName = item(1).of(tLine);
            if (!voidp(tMemName)) {
              this.pAllMemNumList.deleteProp(tMemName);
            }
          }
        }
      }
    }
    return 1;
  }

  replaceMember(tExistingMemName, tReplacingMemName) {
    if (voidp(this.pAllMemNumList[tReplacingMemName])) {
      return 0;
    }
    this.pAllMemNumList[tExistingMemName] = this.pAllMemNumList[tReplacingMemName];
    return 1;
  }

  exists(tMemName) {
    return !voidp(this.pAllMemNumList[tMemName]);
  }

  getmemnum(tMemName) {
    let tMemNum = this.pAllMemNumList[tMemName];
    if (voidp(tMemNum)) {
      tMemNum = 0;
    }
    return tMemNum;
  }

  print() {
    for (let i = 1; i <= this.pAllMemNumList.count; i++) {
      put(`${this.pAllMemNumList.getPropAt(i)} -- ${this.pAllMemNumList[i]}`);
    }
    return 1;
  }

  clearMemNumLists() {
    this.pAllMemNumList = propList();
    this.pAllMemNumList.sort();
    return 1;
  }

  emptyDynamicBin() {
    const tMemberAmount = the.numberOfCastMembersOfCastLib(this.pBin);
    for (let i = 1; i <= tMemberAmount; i++) {
      const tmember = member(i, this.pBin);
      if (tmember.type != Symbol.for("empty")) {
        tmember.erase();
      }
    }
    this.pDynMemNumList = list();
    this.pBmpMemNumList = list();
    return 1;
  }

  deleteDynamicMembers() {
    for (const tMemNum of this.pDynMemNumList) {
      member(tMemNum).erase();
    }
    for (const tMemNum of this.pBmpMemNumList) {
      member(tMemNum).erase();
    }
    this.pDynMemNumList = list();
    this.pBmpMemNumList = list();
    return 1;
  }
}
