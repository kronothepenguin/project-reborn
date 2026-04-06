// fuse_client/53_Layout Parser Class.ls → layout-parser-class.js
// Layout parser - parses XML-like layout definitions from field members

import {
  symbol,
  symbolp,
  stringp,
  integerp,
  voidP,
  objectp,
  listp,
  length,
  value,
  member,
  memberExists,
  rect,
  error,
  getResourceManager,
  getStructVariable,
  createPropList,
  EMPTY,
} from '../core/lingo-runtime.js'

export class LayoutParserClass {
  constructor() {
    this.pCache = createPropList()
  }

  construct() {
    this.pCache = createPropList()
    return true
  }

  parse(tFieldName) {
    if (memberExists(tFieldName)) {
      let tdata
      if (listp(this.pCache.getaProp(tFieldName))) {
        tdata = this.pCache.getaProp(tFieldName)
      } else {
        if (tFieldName.includes('.window')) {
          tdata = this.parse_window(tFieldName)
          this.pCache.setaProp(tFieldName, tdata)
        } else if (tFieldName.includes('.element')) {
          tdata = this.parse_element(tFieldName)
          this.pCache.setaProp(tFieldName, tdata)
        } else if (tFieldName.includes('.room')) {
          tdata = this.parse_visual(tFieldName)
        } else if (tFieldName.includes('.visual')) {
          tdata = this.parse_visual(tFieldName)
          this.pCache.setaProp(tFieldName, tdata)
        }
      }
      if (tdata) {
        return JSON.parse(JSON.stringify(tdata))
      }
    } else {
      return error(this, 'Member not found: ' + tFieldName, symbol('#parse'), symbol('#major'))
    }
  }

  parse_window(tFieldName) {
    const tdata = member(getResourceManager().getmemnum(tFieldName)).text
    const tSupportedTags = {
      elements: { open: '<elements>', close: '</elements>' },
      rect: { open: '<rect>', close: '</rect>' },
      border: { open: '<border>', close: '</border>' },
      clientrect: { open: '<clientrect>', close: '</clientrect>' },
    }
    const tLayDefinition = createPropList()
    for (const tTag of Object.keys(tSupportedTags)) {
      const tOpen = tSupportedTags[tTag].open
      const tClose = tSupportedTags[tTag].close
      const tList = []
      const lines = tdata.split('\n')
      let inTag = false
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === tOpen) {
          inTag = true
          continue
        }
        if (line === tClose) {
          inTag = false
          continue
        }
        if (inTag && line) {
          tList.push(value(line))
        }
      }
      tLayDefinition.setaProp(tTag, tList)
    }

    const tElements = createPropList()
    const elements = tLayDefinition.getaProp('elements')
    if (Array.isArray(elements)) {
      for (const tElem of elements) {
        const tSymbol = tElem.id || 'null'
        if (voidP(tElements.getaProp(tSymbol))) {
          tElements.setaProp(tSymbol, [])
        }
        tElements.getaProp(tSymbol).push(tElem)
      }
    }

    const tResMngr = getResourceManager()
    if (Array.isArray(elements)) {
      for (const tElem of elements) {
        if (stringp(tElem.txtColor)) {
          tElem.txtColor = this._parseColor(tElem.txtColor)
        }
        if (stringp(tElem.txtBgColor)) {
          tElem.txtBgColor = this._parseColor(tElem.txtBgColor)
        }
        if (voidP(tElem.color)) {
          tElem.color = '#000000'
        }
        if (voidP(tElem.bgColor)) {
          tElem.bgColor = '#FFFFFF'
        }
        tElem.color = this._parseColor(tElem.color)
        tElem.bgColor = this._parseColor(tElem.bgColor)
        const tPalette = tElem.palette
        if (stringp(tPalette)) {
          if (!tResMngr.exists(tPalette + 'Duplicate')) {
            const tPalMemNum = tResMngr.getmemnum(tPalette)
            if (tPalMemNum > 0) {
              // member(tPalMemNum).duplicate(...)
            } else {
              tResMngr.createMember(tPalette + 'Duplicate', symbol('#palette'))
              error(this, 'Palette member missing: ' + tPalette, symbol('#parse_window'), symbol('#minor'))
            }
          }
          tElem.palette = tPalette + 'Duplicate'
        }
        if (tElem.type === 'text') {
          const tFontStruct = getStructVariable('struct.font.plain')
          if (voidP(tElem.wordWrap)) tElem.wordWrap = true
          if (voidP(tElem.alignment)) tElem.alignment = symbol('#left')
          if (voidP(tElem.font)) tElem.font = tFontStruct.getaProp(symbol('#font'))
          if (voidP(tElem.fontSize)) tElem.fontSize = tFontStruct.getaProp(symbol('#fontSize'))
          if (voidP(tElem.fontStyle)) tElem.fontStyle = tFontStruct.getaProp(symbol('#fontStyle'))
          if (voidP(tElem.txtColor)) tElem.txtColor = tFontStruct.getaProp(symbol('#color'))
          if (voidP(tElem.txtBgColor)) tElem.txtBgColor = { r: 255, g: 255, b: 255 }
          if (voidP(tElem.fixedLineSpace)) tElem.fixedLineSpace = tElem.fontSize
        }
        if (!voidP(tElem.strech)) {
          tElem.scaleH = symbol('#fixed')
          tElem.scaleV = symbol('#fixed')
          const stretchMap = {
            moveH: { scaleH: symbol('#move') },
            moveV: { scaleV: symbol('#move') },
            strechH: { scaleH: symbol('#scale') },
            strechV: { scaleV: symbol('#scale') },
            centerH: { scaleH: symbol('#center') },
            centerV: { scaleV: symbol('#center') },
            moveHV: { scaleH: symbol('#move'), scaleV: symbol('#move') },
            strechHV: { scaleH: symbol('#scale'), scaleV: symbol('#scale') },
            centerHV: { scaleH: symbol('#center'), scaleV: symbol('#center') },
            moveHstrechV: { scaleH: symbol('#move'), scaleV: symbol('#scale') },
            moveVstrechH: { scaleH: symbol('#scale'), scaleV: symbol('#move') },
            moveHcenterV: { scaleH: symbol('#move'), scaleV: symbol('#center') },
            moveVcenterH: { scaleH: symbol('#center'), scaleV: symbol('#move') },
          }
          const mapping = stretchMap[tElem.strech]
          if (mapping) {
            Object.assign(tElem, mapping)
          }
          delete tElem.strech
        }
      }
    }

    // Calculate rect if not defined
    const rectList = tLayDefinition.getaProp('rect')
    if (!Array.isArray(rectList) || rectList.length === 0) {
      const tRect = { left: 10000, top: 10000, right: -10000, bottom: -10000 }
      if (Array.isArray(elements)) {
        for (const tElement of elements) {
          if (Array.isArray(tElement)) {
            for (const tItem of tElement) {
              if (tItem.locH < tRect.left) tRect.left = tItem.locH
              if (tItem.locV < tRect.top) tRect.top = tItem.locV
              if ((tItem.locH + tItem.width) > tRect.right) tRect.right = tItem.locH + tItem.width
              if ((tItem.locV + tItem.height) > tRect.bottom) tRect.bottom = tItem.locV + tItem.height
            }
          }
        }
      }
      tLayDefinition.setaProp('rect', [tRect])
      // Adjust element positions
      if (Array.isArray(elements)) {
        for (const tElement of elements) {
          if (Array.isArray(tElement)) {
            for (const tItem of tElement) {
              tItem.locH = tItem.locH - tRect.left
              tItem.locV = tItem.locV - tRect.top
            }
          }
        }
      }
    } else {
      const tList = rectList[0]
      if (Array.isArray(tList)) {
        rectList[0] = rect(tList[0], tList[1], tList[2], tList[3])
      }
    }

    const tOffX = rectList[0].left || rectList[0][0]
    const tOffY = rectList[0].top || rectList[0][1]
    rectList[0] = {
      left: (rectList[0].left || rectList[0][0]) - tOffX,
      top: (rectList[0].top || rectList[0][1]) - tOffY,
      right: (rectList[0].right || rectList[0][2]) - tOffX,
      bottom: (rectList[0].bottom || rectList[0][3]) - tOffY,
    }

    // Border calculation
    const borderList = tLayDefinition.getaProp('border')
    if (!Array.isArray(borderList) || borderList.length === 0) {
      const clientRectList = tLayDefinition.getaProp('clientrect')
      if (Array.isArray(clientRectList) && clientRectList.length > 0) {
        const tClientRect = clientRectList[0]
        const tWinWidth = rectList[0].right
        const tWinHeight = rectList[0].bottom
        const tBorder = [tClientRect.left, tClientRect.top, tWinWidth - tClientRect.right, tWinHeight - tClientRect.bottom]
        tLayDefinition.setaProp('border', [tBorder])
      } else {
        tLayDefinition.setaProp('border', [[0, 0, 0, 0]])
      }
    }

    tLayDefinition.setaProp('elements', tElements)
    return tLayDefinition
  }

  parse_element(tFieldName) {
    const tProps = createPropList()
    const tdata = member(getResourceManager().getmemnum(tFieldName)).text
    const lines = tdata.split('\n')
    for (const tLine of lines) {
      if (tLine[0] !== '#' && tLine.length > 1) {
        const tValue = value(tLine)
        if (tValue && tValue.state) {
          tProps.setaProp(tValue.state, tValue)
        }
      }
    }
    return tProps
  }

  parse_visual(tFieldName) {
    const tdata = member(getResourceManager().getmemnum(tFieldName)).text
    const tSupportedTags = {
      roomdata: { open: '<roomdata>', close: '</roomdata>' },
      rect: { open: '<rect>', close: '</rect>' },
      version: { open: '<version>', close: '</version>' },
      elements: { open: '<elements>', close: '</elements>' },
    }
    const tLayDefinition = createPropList()
    for (const tTag of Object.keys(tSupportedTags)) {
      const tOpen = tSupportedTags[tTag].open
      const tClose = tSupportedTags[tTag].close
      const tList = []
      const lines = tdata.split('\n')
      let inTag = false
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === tOpen) {
          inTag = true
          continue
        }
        if (trimmed === tClose) {
          inTag = false
          continue
        }
        if (inTag && trimmed) {
          const val = value(trimmed)
          if (!voidP(val)) {
            tList.push(val)
          }
        }
      }
      if (tList.length > 0) {
        tLayDefinition.setaProp(tTag, tList)
      }
    }

    if (voidP(tLayDefinition.getaProp('version'))) {
      error(this, 'Old visualizer definition: ' + tFieldName, symbol('#parse_room'), symbol('#minor'))
      const elements = tLayDefinition.getaProp('elements')
      if (Array.isArray(elements)) {
        for (const tElem of elements) {
          if ((tElem.media === symbol('#field')) || (tElem.media === symbol('#text'))) {
            tElem.txtColor = tElem.color
            tElem.txtBgColor = tElem.bgColor
            tElem.color = '#000000'
            tElem.bgColor = '#FFFFFF'
          }
          delete tElem.foreColor
          delete tElem.backColor
        }
      }
    }

    const elements = tLayDefinition.getaProp('elements')
    if (Array.isArray(elements)) {
      for (const tElem of elements) {
        if (voidP(tElem.color)) tElem.color = '#000000'
        if (voidP(tElem.bgColor)) tElem.bgColor = '#FFFFFF'
        if (tElem.type === 'button') tElem.Active = 1
      }
    }

    return {
      name: tLayDefinition.getaProp('name'),
      roomdata: tLayDefinition.getaProp('roomdata'),
      rect: tLayDefinition.getaProp('rect'),
      elements: tLayDefinition.getaProp('elements'),
    }
  }

  _parseColor(colorStr) {
    // Parse hex color string like "#FF0000" to {r, g, b}
    if (typeof colorStr === 'string' && colorStr.startsWith('#')) {
      const hex = colorStr.substring(1)
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      }
    }
    return { r: 0, g: 0, b: 0 }
  }
}
