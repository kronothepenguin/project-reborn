// fuse_client/38_Visualizer Manager Class.ls → visualizer-manager-class.js
// Visualizer manager - handles visualizer instances, positioning, and activation

import {
  symbol,
  symbolp,
  integerp,
  voidP,
  objectp,
  listp,
  createPropList,
  rect,
  error,
  call,
} from '../core/lingo-runtime.js'
import { getObjectManager, objectExists, createObject } from './object-api.js'
import { getClassVariable, getIntVariable, getVariableValue } from './variable-api.js'
import { ManagerTemplateClass } from './manager-template-class.js'

export class VisualizerManagerClass extends ManagerTemplateClass {
  constructor() {
    super()
    this.pInstanceClass = null
    this.pActiveItem = ''
    this.pDefaultLocZ = -20000000
    this.pAvailableLocZ = -20000000
    this.pPosCache = createPropList()
    this.pHideList = []
    this.pBoundary = rect(0, 0, 800, 600)
  }

  construct() {
    this.pInstanceClass = getClassVariable('visualizer.instance.class')
    this.pActiveItem = ''
    this.pPosCache = createPropList()
    this.pHideList = []
    this.pDefaultLocZ = getIntVariable('visualizer.default.locz', -20000000)
    this.pAvailableLocZ = this.pDefaultLocZ
    // pBoundary = rect(0, 0, stage width, stage height) + boundary limit
    this.pBoundary = rect(0, 0, 800, 600)
    if (!objectExists(symbol('#layout_parser'))) {
      createObject(symbol('#layout_parser'), getClassVariable('layout.parser.class'))
    }
    return true
  }

  create(tID, tLayout, tLocX, tLocY) {
    if (!integerp(tLocX)) tLocX = 0
    if (!integerp(tLocY)) tLocY = 0
    if (this.exists(tID)) {
      this.Remove(tID)
    }
    const tItem = getObjectManager().create(tID, this.pInstanceClass)
    if (!tItem) {
      return error(this, 'Item creation failed: ' + tID, symbol('#create'), symbol('#major'))
    }
    const tProps = {
      locX: tLocX,
      locY: tLocY,
      locZ: this.pAvailableLocZ,
      layout: tLayout,
      boundary: this.pBoundary,
    }
    if (!tItem.define(tProps)) {
      getObjectManager().Remove(tID)
      return false
    }
    this.pItemList.push(tID)
    this.pAvailableLocZ = this.pAvailableLocZ + tItem.getProperty(symbol('#sprCount'))
    return true
  }

  Remove(tID) {
    if (!this.exists(tID)) {
      return false
    }
    const tItem = this.GET(tID)
    this.pAvailableLocZ = this.pAvailableLocZ - tItem.getProperty(symbol('#sprCount'))
    this.pPosCache.setaProp(tID, [tItem.getProperty(symbol('#locX')), tItem.getProperty(symbol('#locY'))])
    const idx = this.pItemList.indexOf(tID)
    if (idx >= 0) this.pItemList.splice(idx, 1)
    if (this.pActiveItem === tID) {
      this.pActiveItem = this.pItemList[this.pItemList.length - 1]
    }
    getObjectManager().Remove(tID)
    this.Activate(this.pItemList[this.pItemList.length - 1])
    return true
  }

  Activate(tID) {
    if (this.exists(tID)) {
      this.pActiveItem = tID
      this.GET(tID).setActive()
      return true
    } else {
      return false
    }
  }

  deactivate(tID) {
    if (this.exists(tID)) {
      this.GET(tID).setDeactive()
      return true
    } else {
      return false
    }
  }

  hideAll() {
    for (const tItem of this.pItemList) {
      const tObj = this.GET(tItem)
      if (tObj.getProperty(symbol('#visible'))) {
        tObj.hide()
        this.pHideList.push(tItem)
      }
    }
    return true
  }

  showAll() {
    for (const tItem of this.pHideList) {
      const tObj = this.GET(tItem)
      if (tObj !== 0) {
        tObj.show()
      }
    }
    this.pHideList = []
    return true
  }

  getProperty(tProp) {
    switch (tProp) {
      case symbol('#defaultLocZ'):
        return this.pDefaultLocZ
      case symbol('#boundary'):
        return this.pBoundary
      case symbol('#count'):
        return this.pItemList.length
      default:
        return 0
    }
  }

  setProperty(tProp, tValue) {
    switch (tProp) {
      case symbol('#defaultLocZ'):
        return this.setDefaultLocZ(tValue)
      case symbol('#boundary'):
        return this.setBoundary(tValue)
      default:
        return 0
    }
  }

  setDefaultLocZ(tValue) {
    if (!integerp(tValue)) {
      return error(this, 'integer expected: ' + tValue, symbol('#setDefaultLocZ'), symbol('#minor'))
    }
    this.pDefaultLocZ = tValue
    return this.Activate(this.pItemList[this.pItemList.length - 1])
  }

  setBoundary(tValue) {
    if (!listp(tValue) && typeof tValue !== 'symbol') {
      return error(this, 'List or rect expected: ' + tValue, symbol('#setBoundary'), symbol('#minor'))
    }
    this.pBoundary.left = tValue.left || tValue[0]
    this.pBoundary.top = tValue.top || tValue[1]
    this.pBoundary.right = tValue.right || tValue[2]
    this.pBoundary.bottom = tValue.bottom || tValue[3]
    call(symbol('#moveBy'), this.pItemList, 0, 0)
    return true
  }
}
