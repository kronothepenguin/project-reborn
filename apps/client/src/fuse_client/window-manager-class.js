// fuse_client/39_Window Manager Class.ls → window-manager-class.js
// Window manager - handles window creation, activation, modal windows, and layering

import {
  symbol,
  symbolp,
  integerp,
  voidP,
  objectp,
  listp,
  createPropList,
  rect,
  member,
  memberExists,
  createMember,
  error,
  getObjectManager,
  objectExists,
  createObject,
  getClassVariable,
  getIntVariable,
  getVariableValue,
} from '../core/lingo-runtime.js'
import { ManagerTemplateClass } from './manager-template-class.js'

export class WindowManagerClass extends ManagerTemplateClass {
  constructor() {
    super()
    this.pLockLocZ = 0
    this.pDefLocX = 100
    this.pDefLocY = 100
    this.pClsList = createPropList()
    this.pModalID = symbol('#modal')
    this.pLastEventData = createPropList()
    this.pHideList = []
    this.pPosCache = createPropList()
    this.pActiveItem = null
    this.pAvailableLocZ = 0
    this.pDefaultLocZ = 0
    this.pBoundary = rect(0, 0, 800, 600)
    this.pInstanceClass = null
  }

  construct() {
    this.pLastEventData = createPropList()
    this.pLockLocZ = 0
    this.pDefLocX = getIntVariable('window.default.locx', 100)
    this.pDefLocY = getIntVariable('window.default.locy', 100)
    this.pItemList = []
    this.pHideList = []
    this.pDefaultLocZ = getIntVariable('window.default.locz', 0)
    this.pAvailableLocZ = this.pDefaultLocZ
    this.pBoundary = rect(0, 0, 800, 600)
    this.pInstanceClass = getClassVariable('window.instance.class')
    this.pClsList = createPropList()
    this.pModalID = symbol('#modal')
    this.pClsList.setaProp(symbol('#wrapper'), getClassVariable('window.wrapper.class'))
    this.pClsList.setaProp(symbol('#unique'), getClassVariable('window.unique.class'))
    this.pClsList.setaProp(symbol('#grouped'), getClassVariable('window.grouped.class'))
    if (!memberExists('null')) {
      const tNull = member(createMember('null', symbol('#bitmap')))
      // tNull.image = image(1, 1, 8) - placeholder for Canvas
    }
    if (!objectExists(symbol('#layout_parser'))) {
      createObject(symbol('#layout_parser'), getClassVariable('layout.parser.class'))
    }
    return true
  }

  create(tID, tLayout, tLocX, tLocY, tSpecial) {
    switch (tSpecial) {
      case symbol('#modal'):
        return this.modal(tID, tLayout)
      case symbol('#modalcorner'):
        return this.modal(tID, tLayout, symbol('#corner'))
    }
    if (voidP(tLayout)) {
      tLayout = 'empty.window'
    }
    if (this.exists(tID)) {
      if (voidP(tLocX)) {
        tLocX = this.GET(tID).getProperty(symbol('#locX'))
      }
      if (voidP(tLocY)) {
        tLocY = this.GET(tID).getProperty(symbol('#locY'))
      }
      this.Remove(tID)
    }
    let tX, tY
    if (integerp(tLocX) && integerp(tLocY)) {
      tX = tLocX
      tY = tLocY
    } else if (!voidP(this.pPosCache.getaProp(tID))) {
      const cached = this.pPosCache.getaProp(tID)
      tX = cached[0]
      tY = cached[1]
    } else {
      tX = this.pDefLocX
      tY = this.pDefLocY
    }
    const tItem = getObjectManager().create(tID, this.pInstanceClass)
    if (!tItem) {
      return error(this, 'Failed to create window object: ' + tID, symbol('#create'), symbol('#major'))
    }
    const tProps = {
      locX: tX,
      locY: tY,
      locZ: this.pAvailableLocZ,
      boundary: this.pBoundary,
      elements: this.pClsList,
      manager: this,
    }
    if (!tItem.define(tProps)) {
      getObjectManager().Remove(tID)
      return false
    }
    if (!tItem.merge(tLayout)) {
      getObjectManager().Remove(tID)
      return false
    }
    this.pItemList.push(tID)
    this.pAvailableLocZ = this.pAvailableLocZ + tItem.getProperty(symbol('#sprCount'))
    this.Activate()
    return true
  }

  Remove(tID) {
    const tWndObj = this.GET(tID)
    if (tWndObj === 0) {
      return false
    }
    this.pPosCache.setaProp(tID, [tWndObj.getProperty(symbol('#locX')), tWndObj.getProperty(symbol('#locY'))])
    getObjectManager().Remove(tID)
    const idx = this.pItemList.indexOf(tID)
    if (idx >= 0) this.pItemList.splice(idx, 1)
    let tNextActive
    if (this.pActiveItem === tID) {
      tNextActive = this.pItemList[this.pItemList.length - 1]
    } else {
      tNextActive = this.pActiveItem
    }
    if (this.exists(this.pModalID)) {
      let tModals = 0
      for (let i = this.pItemList.length - 1; i >= 0; i--) {
        const itemID = this.pItemList[i]
        if (this.GET(itemID).getProperty(symbol('#modal'))) {
          tModals = 1
          tNextActive = itemID
          break
        }
      }
      if (!tModals) {
        this.Remove(this.pModalID)
      }
    }
    this.Activate(tNextActive)
    return true
  }

  Activate(tID) {
    if (this.pLockLocZ) {
      return false
    }
    if (this.pItemList.length === 0) {
      return false
    }
    if (this.exists(this.pActiveItem)) {
      if (this.GET(this.pActiveItem).getProperty(symbol('#modal'))) {
        tID = this.pActiveItem
        if (this.exists(this.pModalID)) {
          const modalIdx = this.pItemList.indexOf(this.pModalID)
          if (modalIdx >= 0) this.pItemList.splice(modalIdx, 1)
          this.pItemList.push(this.pModalID)
        }
      }
    }
    if (voidP(tID)) {
      tID = this.pItemList[this.pItemList.length - 1]
    } else {
      if (!this.exists(tID)) {
        return false
      }
    }
    const activeIdx = this.pItemList.indexOf(tID)
    if (activeIdx >= 0) this.pItemList.splice(activeIdx, 1)
    this.pItemList.push(tID)
    this.pAvailableLocZ = this.pDefaultLocZ
    for (const tCurrID of this.pItemList) {
      const tWndObj = this.GET(tCurrID)
      tWndObj.setDeactive()
      const spriteList = tWndObj.getProperty(symbol('#spriteList'))
      if (spriteList) {
        for (const tSpr of spriteList) {
          tSpr.locZ = this.pAvailableLocZ
          this.pAvailableLocZ = this.pAvailableLocZ + 1
        }
      }
    }
    this.pActiveItem = tID
    return this.GET(tID).setActive()
  }

  reorder(tNewOrder) {
    if (tNewOrder === this.pItemList) {
      return true
    }
    this.pItemList = tNewOrder
    this.pAvailableLocZ = this.pDefaultLocZ
    for (const tCurrID of this.pItemList) {
      const tWndObj = this.GET(tCurrID)
      const spriteList = tWndObj.getProperty(symbol('#spriteList'))
      if (spriteList) {
        for (const tSpr of spriteList) {
          tSpr.locZ = this.pAvailableLocZ
          this.pAvailableLocZ = this.pAvailableLocZ + 1
        }
      }
    }
  }

  deactivate(tID) {
    if (this.exists(tID)) {
      if (!this.GET(tID).getProperty(symbol('#modal'))) {
        const idx = this.pItemList.indexOf(tID)
        if (idx >= 0) this.pItemList.splice(idx, 1)
        this.pItemList.unshift(tID)
        this.Activate()
        return true
      }
    }
    return false
  }

  lock() {
    this.pLockLocZ = 1
    return true
  }

  unlock() {
    this.pLockLocZ = 0
    return true
  }

  modal(tID, tLayout, tPosition) {
    if (voidP(tPosition)) {
      tPosition = symbol('#center')
    }
    if (!this.create(tID, tLayout)) {
      return false
    }
    const tWndObj = this.GET(tID)
    switch (tPosition) {
      case symbol('#center'):
        tWndObj.center()
        break
      case symbol('#corner'):
        tWndObj.moveTo(0, 0)
        break
    }
    tWndObj.lock()
    tWndObj.setProperty(symbol('#modal'), 1)
    if (!this.exists(this.pModalID)) {
      if (this.create(this.pModalID, 'modal.window')) {
        const tModal = this.GET(this.pModalID)
        tModal.moveTo(0, 0)
        tModal.resizeTo(800, 600)
        tModal.lock()
        const modalElement = tModal.getElement('modal')
        if (modalElement) modalElement.setProperty(symbol('#blend'), 40)
      } else {
        error(this, 'Failed to create modal window layer!', symbol('#modal'), symbol('#major'))
      }
    }
    // the keyboardFocusSprite = 0
    this.pActiveItem = tID
    this.Activate(tID)
    return true
  }

  registerWindowEvent(tTitle, tSprID, tEvent) {
    this.pLastEventData.setaProp(symbol('#title'), tTitle)
    this.pLastEventData.setaProp(symbol('#sprite'), tSprID)
    this.pLastEventData.setaProp(symbol('#Event'), tEvent)
  }

  getLastEvent() {
    return this.pLastEventData.getaProp(symbol('#title')) + '-' +
           this.pLastEventData.getaProp(symbol('#sprite')) + '-' +
           this.pLastEventData.getaProp(symbol('#Event'))
  }
}
