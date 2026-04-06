// fuse_client/30_Resource Manager Class.ls → resource-manager-class.js
// Resource manager - handles member registration, indexing, and lookups

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  length,
  createPropList,
  member,
  castLib,
  field,
  error,
  getObject,
  getIntVariable,
  getVariable,
  getVariableManager,
  getItemDelimiter,
  setItemDelimiter,
} from '../core/lingo-runtime.js'

export class ResourceManagerClass {
  constructor() {
    this.pAllMemNumList = createPropList()
    this.pDynMemNumList = []
    this.pBmpMemNumList = []
    this.pLegalDuplicates = []
    this.pBin = 'bin'
  }

  construct() {
    this.pAllMemNumList = createPropList()
    this.pAllMemNumList._map // sort placeholder
    this.pDynMemNumList = []
    this.pBmpMemNumList = []
    this.pBin = getVariable('dynamic.bin.cast', 'bin')
    this.pLegalDuplicates = []
    this.pLegalDuplicates.push(getVariable('thread.index.field'))
    this.pLegalDuplicates.push(getVariable('alias.index.field'))
    this.pLegalDuplicates.push(getVariable('texts.index.field'))
    this.pLegalDuplicates.push(getVariable('props.index.field'))
    return true
  }

  deconstruct() {
    this.pAllMemNumList = createPropList()
    return true
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case symbol('#memberCount'):
        return this.pAllMemNumList.count
      case symbol('#dynMemCount'):
        return this.pDynMemNumList.length
      default:
        return 0
    }
  }

  setProperty(tPropID, tValue) {
    return 0
  }

  createMember(tMemName, ttype, tForcedDuplicate) {
    if (!voidP(this.pAllMemNumList.getaProp(tMemName)) && !tForcedDuplicate) {
      error(this, 'Member already exists: ' + tMemName, symbol('#createMember'), symbol('#minor'))
      return this.getmemnum(tMemName)
    }
    // In Director: tmember = new(ttype, castLib(pBin))
    // For JS, we create a placeholder member
    const tMemNum = this.pAllMemNumList.count + 1
    this.pAllMemNumList.setaProp(tMemName, tMemNum)
    if (this.pDynMemNumList.indexOf(tMemNum) < 0) {
      this.pDynMemNumList.push(tMemNum)
    }
    return tMemNum
  }

  removeMember(tMemName) {
    const tMemNum = this.pAllMemNumList.getaProp(tMemName)
    if (this.pDynMemNumList.indexOf(tMemNum) < 0) {
      return error(this, "Can't delete member: " + tMemName, symbol('#removeMember'), symbol('#minor'))
    }
    const idx = this.pDynMemNumList.indexOf(tMemNum)
    if (idx >= 0) this.pDynMemNumList.splice(idx, 1)
    this.pAllMemNumList.deleteProp(tMemName)
    return true
  }

  getMember(tMemName) {
    let tMemNum = this.pAllMemNumList.getaProp(tMemName)
    if (voidP(tMemNum)) {
      tMemNum = 0
    }
    return member(tMemNum)
  }

  updateMember(tMemName) {
    if (!stringp(tMemName)) {
      return error(this, "Member's name required: " + tMemName, symbol('#updateMember'), symbol('#minor'))
    }
    if (!this.unregisterMember(tMemName)) {
      return false
    }
    if (!this.registerMember(tMemName)) {
      return false
    }
    return true
  }

  registerMember(tMemName, tMemberNum) {
    if (voidP(tMemberNum)) {
      tMemberNum = member(tMemName).number
    }
    if (tMemberNum < 1) {
      return false
    }
    this.pAllMemNumList.setaProp(tMemName, tMemberNum)
    return tMemberNum
  }

  unregisterMember(tMemName) {
    if (voidP(this.pAllMemNumList.getaProp(tMemName))) {
      return false
    }
    this.pAllMemNumList.deleteProp(tMemName)
    return true
  }

  preIndexMembers(tCastNum) {
    let tFirstCast, tLastCast
    if (integerp(tCastNum)) {
      tFirstCast = tCastNum
      tLastCast = tCastNum
    } else {
      this.pAllMemNumList = createPropList()
      tFirstCast = 1
      // tLastCast = the number of castLibs
      tLastCast = 1
    }
    const tNameAlertFlag = getIntVariable('duplicate.name.alert')
    // Simplified - in Director this iterates castLibs and members
    return true
  }

  readAliasIndexesFromField(tAliasIndex, tCastlibNo) {
    const tAliasList = field(tAliasIndex, tCastlibNo)
    const tItemDeLim = getItemDelimiter()
    setItemDelimiter('=')
    const lines = tAliasList.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const tLine = lines[i]
      if (length(tLine) > 2) {
        const parts = tLine.split('=')
        let tName = parts[1] || ''
        if (tName[tName.length - 1] === '*') {
          tName = tName.substring(0, tName.length - 1)
          const tNumber = this.pAllMemNumList.getaProp(tName)
          if (tNumber > 0) {
            var tReplacingNum = -tNumber
          } else {
            var tReplacingNum = tNumber
          }
        } else {
          var tNumber = this.pAllMemNumList.getaProp(tName)
          var tReplacingNum = tNumber
        }
        if (tNumber > 0) {
          const tMemName = parts[0]
          this.pAllMemNumList.setaProp(tMemName, tReplacingNum)
        }
      }
    }
    setItemDelimiter(tItemDeLim)
  }

  unregisterMembers(tCastNum) {
    if (voidP(tCastNum)) {
      return this.clearMemNumLists()
    }
    // Simplified - Director iterates cast members
    return true
  }

  replaceMember(tExistingMemName, tReplacingMemName) {
    if (voidP(this.pAllMemNumList.getaProp(tReplacingMemName))) {
      return false
    }
    this.pAllMemNumList.setaProp(tExistingMemName, this.pAllMemNumList.getaProp(tReplacingMemName))
    return true
  }

  exists(tMemName) {
    return !voidP(this.pAllMemNumList.getaProp(tMemName))
  }

  getmemnum(tMemName) {
    let tMemNum = this.pAllMemNumList.getaProp(tMemName)
    if (voidP(tMemNum)) {
      tMemNum = 0
    }
    return tMemNum
  }

  print() {
    for (let i = 1; i <= this.pAllMemNumList.count; i++) {
      console.log(this.pAllMemNumList.getPropAt(i), '--', this.pAllMemNumList.getAt(i))
    }
    return true
  }

  clearMemNumLists() {
    this.pAllMemNumList = createPropList()
    return true
  }

  emptyDynamicBin() {
    this.pDynMemNumList = []
    this.pBmpMemNumList = []
    return true
  }

  deleteDynamicMembers() {
    this.pDynMemNumList = []
    this.pBmpMemNumList = []
    return true
  }
}
