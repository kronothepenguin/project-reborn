import {
  castLib,
  charOf,
  EMPTY,
  field,
  ilk,
  integerp,
  itemOf,
  length,
  lineOf,
  list,
  member,
  newMember,
  numberOfCastMembersOfCastLib,
  propList,
  put,
  RETURN,
  the,
  VOID,
  voidp,
} from "../../director";

export default function () {
  let tMemNum, tmember, tNameAlertFlag, tFirstCast, tLastCast;
  let tVarIndex, tVarIndex2, tAliasIndex, tClsIndex;
  let tAliasList, tItemDeLim, tAliasLines, tLine, tLineItems, tName, tNameTrimmed;
  let tNumber, tReplacingNum, tMemName, tMemberCount;
  let tTempNum, tLines, tMemberAmount;
  let tLibA, tLibB, tMemA, tMemB;

  return {
    pAllMemNumList: VOID,
    pDynMemNumList: VOID,
    pBmpMemNumList: VOID,
    pLegalDuplicates: VOID,
    pBin: VOID,

    construct() {
      this.pAllMemNumList = propList();
      this.pAllMemNumList.sort();
      this.pDynMemNumList = list();
      this.pDynMemNumList.sort();
      this.pBmpMemNumList = list();
      this.pBmpMemNumList.sort();
      this.pBin = _director.getVariable("dynamic.bin.cast", "bin");
      this.pLegalDuplicates = list();
      this.pLegalDuplicates.add(_director.getVariable("thread.index.field"));
      this.pLegalDuplicates.add(_director.getVariable("alias.index.field"));
      this.pLegalDuplicates.add(_director.getVariable("texts.index.field"));
      this.pLegalDuplicates.add(_director.getVariable("props.index.field"));
      if (the.runMode.includes("Author")) {
        this.emptyDynamicBin();
      }
      return 1;
    },

    deconstruct() {
      if (the.runMode.includes("Author")) {
        this.deleteDynamicMembers();
      }
      this.pAllMemNumList = propList();
      return 1;
    },

    getProperty(tPropID) {
      switch (tPropID) {
        case Symbol.for("memberCount"):
          return this.pAllMemNumList.count;
        case Symbol.for("dynMemCount"):
          return this.pDynMemNumList.count;
        default:
          return 0;
      }
    },

    setProperty(tPropID, tValue) {
      switch (tPropID) {
        default:
          return 0;
      }
    },

    createMember(tMemName, ttype, tForcedDuplicate) {
      if (!voidp(this.pAllMemNumList[tMemName]) && !tForcedDuplicate) {
        _director.error(this, "Member already exists: " + tMemName, Symbol.for("createMember"), Symbol.for("minor"));
        return this.getmemnum(tMemName);
      }
      if ((ttype === Symbol.for("bitmap")) && (this.pBmpMemNumList.count > 0)) {
        tmember = member(this.pBmpMemNumList[1]);
        this.pBmpMemNumList.deleteAt(1);
      } else {
        tmember = newMember(ttype, castLib(this.pBin));
        if (ilk(tmember) !== Symbol.for("member")) {
          return _director.error(this, "Failed to create member: " + tMemName + " " + ttype, Symbol.for("createMember"), Symbol.for("major"));
        }
      }
      tmember.name = tMemName;
      tMemNum = tmember.number;
      this.pAllMemNumList[tMemName] = tMemNum;
      if (this.pDynMemNumList.getPos(tMemNum) === 0) {
        this.pDynMemNumList.add(tMemNum);
      }
      return tMemNum;
    },

    removeMember(tMemName) {
      tMemNum = this.pAllMemNumList[tMemName];
      if (this.pDynMemNumList.getPos(tMemNum) < 1) {
        return _director.error(this, "Can't delete member: " + tMemName, Symbol.for("removeMember"), Symbol.for("minor"));
      }
      tmember = member(tMemNum);
      if (tmember.type === Symbol.for("bitmap")) {
        tmember.name = EMPTY;
        this.pBmpMemNumList.add(tMemNum);
      } else {
        tmember.erase();
      }
      this.pDynMemNumList.deleteOne(tMemNum);
      this.pAllMemNumList.deleteProp(tMemName);
      return 1;
    },

    getMember(tMemName) {
      tMemNum = this.pAllMemNumList[tMemName];
      if (voidp(tMemNum)) {
        return member(0);
      }
      return member(tMemNum);
    },

    updateMember(tMemName) {
      if (ilk(tMemName) !== Symbol.for("string")) {
        return _director.error(this, "Member's name required: " + tMemName, Symbol.for("updateMember"), Symbol.for("minor"));
      }
      if (!this.unregisterMember(tMemName)) {
        return 0;
      }
      if (!this.registerMember(tMemName)) {
        return 0;
      }
      return 1;
    },

    registerMember(tMemName, tMemberNum) {
      if (voidp(tMemberNum)) {
        tMemberNum = member(tMemName).number;
      }
      if (tMemberNum < 1) {
        return 0;
      }
      this.pAllMemNumList[tMemName] = tMemberNum;
      return tMemberNum;
    },

    unregisterMember(tMemName) {
      if (voidp(this.pAllMemNumList[tMemName])) {
        return 0;
      }
      this.pAllMemNumList.deleteProp(tMemName);
      return 1;
    },

    preIndexMembers(tCastNum) {
      if (integerp(tCastNum)) {
        tFirstCast = tCastNum;
        tLastCast = tCastNum;
      } else {
        this.pAllMemNumList = propList();
        this.pAllMemNumList.sort();
        tFirstCast = 1;
        tLastCast = the.numberOfCastLibs;
      }
      tNameAlertFlag = _director.getIntVariable("duplicate.name.alert");
      for (let tCastLib = tFirstCast; tCastLib <= tLastCast; tCastLib++) {
        tMemberCount = numberOfCastMembersOfCastLib(tCastLib);
        for (let i = 1; i <= tMemberCount; i++) {
          tmember = member(i, tCastLib);
          if (length(tmember.name) > 0) {
            if (tNameAlertFlag) {
              if (!voidp(this.pAllMemNumList[tmember.name])) {
                if (this.pLegalDuplicates.getPos(tmember.name) === 0) {
                  if (this.pAllMemNumList[tmember.name] !== tmember.number) {
                    tMemA = member(this.pAllMemNumList[tmember.name]);
                    tMemB = tmember;
                    if ((tMemA.name !== EMPTY) && (tMemB.name !== EMPTY)) {
                      tLibA = castLib(tMemA.castLibNum).name;
                      tLibB = castLib(tMemB.castLibNum).name;
                      _director.error(this, "Duplicate member names: " + tmember.name + " / " + tLibA + " / " + tLibB, Symbol.for("preIndexMembers"), Symbol.for("minor"));
                    }
                  }
                }
              }
            }
            this.pAllMemNumList[tmember.name] = tmember.number;
          }
        }
        tVarIndex = _director.getVariable("props.index.field");
        if (member(tVarIndex, tCastLib).number > 0) {
          _director.getVariableManager().dump(member(tVarIndex, tCastLib).number, RETURN, 0);
        }
        tVarIndex2 = _director.getVariable("override.props.index.field");
        if (member(tVarIndex2, tCastLib).number > 0) {
          _director.getVariableManager().dump(member(tVarIndex2, tCastLib).number, RETURN, 1);
        }
        tAliasIndex = _director.getVariable("alias.index.field");
        if (member(tAliasIndex, tCastLib).number > 0) {
          this.readAliasIndexesFromField(tAliasIndex, tCastLib);
        }
        tClsIndex = _director.getVariable("class.index.field");
        if (member(tClsIndex, tCastLib).number > 0) {
          _director.getObject(Symbol.for("classes")).dump(member(tClsIndex, tCastLib).number);
        }
      }
      return 1;
    },

    readAliasIndexesFromField(tAliasIndex, tCastlibNo) {
      tAliasList = field(tAliasIndex, tCastlibNo);
      tItemDeLim = the.itemDelimiter;
      the.itemDelimiter = "=";
      tAliasLines = lineOf(tAliasList);
      for (let i = 1; i <= tAliasLines.count; i++) {
        tLine = tAliasLines[i];
        if (length(tLine) > 2) {
          tLineItems = itemOf(tLine);
          tName = tLineItems.slice(2, tLineItems.count);
          if (charOf(tName)[charOf(tName).count] === "*") {
            tNameTrimmed = charOf(tName).slice(1, length(tName) - 1);
            tNumber = this.pAllMemNumList[tNameTrimmed];
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
            tMemName = itemOf(tLine)[1];
            this.pAllMemNumList[tMemName] = tReplacingNum;
          }
        }
      }
      the.itemDelimiter = tItemDeLim;
    },

    unregisterMembers(tCastNum) {
      if (voidp(tCastNum)) {
        return this.clearMemNumLists();
      }
      tMemberCount = numberOfCastMembersOfCastLib(tCastNum);
      for (let i = 1; i <= tMemberCount; i++) {
        tmember = member(i, tCastNum);
        tTempNum = this.pAllMemNumList[tmember.name];
        if (tTempNum !== VOID) {
          if (tTempNum === tmember.number) {
            this.pAllMemNumList.deleteProp(tmember.name);
          }
        }
        if (this.pDynMemNumList.getPos(tmember.name) > 0) {
          this.pDynMemNumList.deleteAt(this.pDynMemNumList.getPos(tmember.name));
        }
      }
      tAliasIndex = _director.getVariable("alias.index.field");
      if (member(tAliasIndex, tCastNum).number > 0) {
        tAliasList = field(tAliasIndex, tCastNum);
        tLines = lineOf(tAliasList);
        for (let i = 1; i <= tLines.count; i++) {
          tLine = tLines[i];
          if (length(tLine) > 2) {
            tLineItems = itemOf(tLine);
            tName = tLineItems.slice(2, tLineItems.count);
            if (charOf(tName)[charOf(tName).count] === "*") {
              tNameTrimmed = charOf(tName).slice(1, length(tName) - 1);
              if (!voidp(this.pAllMemNumList[tNameTrimmed])) {
                tMemName = itemOf(tLine)[1];
                if (!voidp(tMemName)) {
                  this.pAllMemNumList.deleteProp(tMemName);
                }
              }
            }
          }
        }
      }
      return 1;
    },

    replaceMember(tExistingMemName, tReplacingMemName) {
      if (voidp(this.pAllMemNumList[tReplacingMemName])) {
        return 0;
      }
      this.pAllMemNumList[tExistingMemName] = this.pAllMemNumList[tReplacingMemName];
      return 1;
    },

    exists(tMemName) {
      return !voidp(this.pAllMemNumList[tMemName]);
    },

    getmemnum(tMemName) {
      tMemNum = this.pAllMemNumList[tMemName];
      if (voidp(tMemNum)) {
        return 0;
      }
      return tMemNum;
    },

    print() {
      for (let i = 1; i <= this.pAllMemNumList.count; i++) {
        put(this.pAllMemNumList.getPropAt(i) + " -- " + this.pAllMemNumList[i]);
      }
      return 1;
    },

    clearMemNumLists() {
      this.pAllMemNumList = propList();
      this.pAllMemNumList.sort();
      return 1;
    },

    emptyDynamicBin() {
      tMemberAmount = numberOfCastMembersOfCastLib(this.pBin);
      for (let i = 1; i <= tMemberAmount; i++) {
        tmember = member(i, this.pBin);
        if (tmember.type !== Symbol.for("empty")) {
          tmember.erase();
        }
      }
      this.pDynMemNumList = list();
      this.pBmpMemNumList = list();
      return 1;
    },

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
    },
  };
}
