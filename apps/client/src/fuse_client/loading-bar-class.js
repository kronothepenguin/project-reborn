// fuse_client/68_Loading Bar Class.ls → loading-bar-class.js
// Loading bar - visual progress indicator for cast/file downloads

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  rect,
  error,
  getVariableValue,
  receivePrepare,
  removePrepare,
  removeObject,
  getCastLoadManager,
  getDownloadManager,
} from '../core/lingo-runtime.js'

export class LoadingBarClass {
  constructor() {
    this.pTaskId = ''
    this.pBuffer = null
    this.pBgColor = { r: 0, g: 0, b: 0 }
    this.pcolor = { r: 128, g: 128, b: 128 }
    this.pwidth = 128
    this.pheight = 16
    this.pBarRect = null
    this.pOffRect = null
    this.pTaskType = symbol('#cast')
    this.pPercent = 0.0
    this.pDrawPoint = 0
    this.pWindowID = ''
    this.pReadyFlag = false
    this.pID = null
  }

  construct() {
    const tProps = {
      bgColor: { r: 0, g: 0, b: 0 },
      color: { r: 128, g: 128, b: 128 },
      width: 128,
      height: 16,
    }
    const loadedProps = getVariableValue('loading.bar.props', tProps)
    const finalProps = loadedProps || tProps
    this.pTaskId = ''
    // this.pBuffer = (the stage).image
    this.pwidth = finalProps.width || 128
    this.pheight = finalProps.height || 16
    this.pBgColor = finalProps.bgColor || { r: 0, g: 0, b: 0 }
    this.pcolor = finalProps.color || { r: 128, g: 128, b: 128 }
    this.pTaskType = symbol('#cast')
    this.pDrawPoint = 0
    this.pWindowID = ''
    this.pReadyFlag = false
    return true
  }

  deconstruct() {
    this.pTaskId = null
    removePrepare(this.pID)
    if (this.pWindowID !== '') {
      // removeWindow(this.pWindowID)
      this.pWindowID = ''
    }
    return true
  }

  define(tLoadID, tProps) {
    if (!stringp(tLoadID) && !symbolp(tLoadID)) {
      return error(this, 'Invalid castload task ID: ' + tLoadID, symbol('#define'), symbol('#major'))
    }
    this.pTaskId = tLoadID
    this.pPercent = 0.0
    this.pDrawPoint = 0
    this.pReadyFlag = false

    if (tProps && typeof tProps === 'object') {
      if (tProps.buffer && typeof tProps.buffer === 'object' && tProps.buffer.width !== undefined) {
        this.pBuffer = tProps.buffer
      }
      if (integerp(tProps.width)) this.pwidth = tProps.width
      if (integerp(tProps.height)) this.pheight = tProps.height
      if (tProps.bgColor && typeof tProps.bgColor === 'object') this.pBgColor = tProps.bgColor
      if (tProps.color && typeof tProps.color === 'object') this.pcolor = tProps.color
      if (symbolp(tProps.type)) this.pTaskType = tProps.type
      if (tProps.buffer === symbol('#window')) {
        if (this.pWindowID !== '') {
          // removeWindow(this.pWindowID)
        }
        this.pWindowID = this.pID + '_' + Date.now()
        // createWindow(this.pWindowID, 'system.window')
        // tWndObj = getWindow(this.pWindowID)
        // tWndObj.resizeTo(this.pwidth, this.pheight)
        // tWndObj.center()
        // this.pBuffer = tWndObj.getElement('drag').getProperty(symbol('#buffer')).image
      }
    }

    if (this.pBuffer) {
      const tRect = this.pBuffer.rect || { left: 0, top: 0, right: 800, bottom: 600 }
      if (this.pwidth > (tRect.right - tRect.left)) this.pwidth = tRect.right - tRect.left
      if (this.pheight > (tRect.bottom - tRect.top)) this.pheight = tRect.bottom - tRect.top

      const centerX = (tRect.right - tRect.left) / 2
      const centerY = (tRect.bottom - tRect.top) / 2
      this.pBarRect = rect(
        centerX - this.pwidth / 2,
        centerY - this.pheight / 2,
        centerX + this.pwidth / 2,
        centerY + this.pheight / 2
      )
      this.pOffRect = rect(
        this.pBarRect.left + 2,
        this.pBarRect.top + 2,
        this.pBarRect.right - 2,
        this.pBarRect.bottom - 2
      )
      // this.pBuffer.fill(this.pBarRect, this.pBgColor)
      // this.pBuffer.draw(this.pBarRect, { color: this.pcolor, shapeType: symbol('#rect') })
    }
    return receivePrepare(this.pID)
  }

  prepare() {
    if (voidP(this.pTaskId) || this.pReadyFlag) {
      return removeObject(this.pID)
    }
    let tPercent
    switch (this.pTaskType) {
      case symbol('#cast'):
        tPercent = getCastLoadManager().getLoadPercent(this.pTaskId)
        break
      case symbol('#file'):
        tPercent = getDownloadManager().getLoadPercent(this.pTaskId)
        break
      default:
        tPercent = 0
    }
    this.pDrawPoint++
    if (this.pDrawPoint <= (this.pPercent * (this.pOffRect ? this.pOffRect.right - this.pOffRect.left : 0))) {
      const barWidth = this.pOffRect ? this.pOffRect.right - this.pOffRect.left : 0
      const tRect = rect(
        this.pOffRect.left + this.pDrawPoint - 1,
        this.pOffRect.top,
        this.pOffRect.left + this.pDrawPoint,
        this.pOffRect.bottom
      )
      // this.pBuffer.fill(tRect, this.pcolor)
    }
    if (this.pPercent === tPercent) return

    if (this.pBuffer) {
      // this.pBuffer.fill(this.pBarRect, this.pBgColor)
      // this.pBuffer.draw(this.pBarRect, { color: this.pcolor, shapeType: symbol('#rect') })
      const barWidth = this.pOffRect ? this.pOffRect.right - this.pOffRect.left : 0
      const tRect = rect(
        this.pOffRect.left,
        this.pOffRect.top,
        (this.pPercent * barWidth) + this.pOffRect.left,
        this.pOffRect.bottom
      )
      // this.pBuffer.fill(tRect, this.pcolor)
    }
    this.pDrawPoint = this.pPercent * (this.pOffRect ? this.pOffRect.right - this.pOffRect.left : 0)
    this.pPercent = tPercent
    if (this.pPercent >= 1.0) {
      // this.pBuffer.fill(this.pOffRect, this.pcolor)
      this.pReadyFlag = true
    }
  }
}
