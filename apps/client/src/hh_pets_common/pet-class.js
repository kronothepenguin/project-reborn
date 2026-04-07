// hh_pets_common/1_Pet Class.ls → pet-class.js
// Pet class - handles pet rendering, animation, and interaction in room

import {
  symbol,
  voidP,
  objectp,
  listp,
  integerp,
  stringp,
  integer,
  float as lingoFloat,
  random,
  call,
  value,
  replaceChunks,
  numToChar,
  offset,
  length,
  chars,
  point,
  rect,
  EMPTY,
  member,
  memberExists,
  getmemnum,
  createMember,
  removeMember,
  reserveSprite,
  releaseSprite,
  sprite,
  error,
  getVariable,
} from '../core/lingo-runtime.js'
import { setEventBroker } from '../fuse_client/sprite-api.js'
import { getText } from '../fuse_client/text-api.js'
import { connectionExists, getConnection } from '../fuse_client/connection-api.js'
import { getLocalFloat } from '../fuse_client/string-services-api.js'
import { getThread } from '../fuse_client/core-thread-api.js'

export class PetClass {
  constructor() {
    this.pName = EMPTY
    this.pClass = null
    this.pCustom = null
    this.pIDPrefix = EMPTY
    this.pBuffer = null
    this.pSprite = null
    this.pMatteSpr = null
    this.pMember = null
    this.pShadowSpr = null
    this.pShadowFix = 0
    this.pDefShadowMem = member(0)
    this.pPartList = []
    this.pPartIndex = {}
    this.pFlipList = [0, 1, 2, 3, 2, 1, 0, 7]
    this.pUpdateRect = rect(0, 0, 0, 0)
    this.pDirection = 0
    this.pLocX = 0
    this.pLocY = 0
    this.pLocH = 0
    this.pLocFix = point(0, -8)
    this.pXFactor = 0
    this.pYFactor = 0
    this.pHFactor = 0
    this.pScreenLoc = [0, 0, 0]
    this.pStartLScreen = [0, 0, 0]
    this.pDestLScreen = [0, 0, 0]
    this.pRestingHeight = 0.0
    this.pAnimCounter = 0
    this.pMoveStart = 0
    this.pMoveTime = 500
    this.pEyesClosed = 0
    this.pSync = 1
    this.pChanges = 1
    this.pAlphaColor = { r: 255, g: 255, b: 255 }
    this.pCanvasSize = null
    this.pMainAction = 'std'
    this.pWaving = 0
    this.pMoving = 0
    this.pTalking = 0
    this.pSniffing = 0
    this.pGeometry = null
    this.pInfoStruct = {}
    this.pCorrectLocZ = 0
    this.pPartClass = null
    this.pOffsetList = {}
    this.pOffsetListSmall = {}
    this.pMemberNamePrefix = null
    this.pPetDefinitions = null
    this.pRace = null
  }

  construct() {
    this.pGeometry = getThread(symbol('#room')).getInterface().getGeometry()
    this.pXFactor = this.pGeometry.pXFactor
    this.pYFactor = this.pGeometry.pYFactor
    this.pHFactor = this.pGeometry.pHFactor

    const tPetDefText = member(getmemnum('pet.definitions')).text
    this.pPetDefinitions = value(replaceChunks(tPetDefText, '\n', EMPTY))
    if (typeof this.pPetDefinitions !== 'object' || this.pPetDefinitions === null || Array.isArray(this.pPetDefinitions)) {
      this.pPetDefinitions = {}
      error(this, 'Pet definitions has invalid data!', this.getID(), symbol('#construct'), symbol('#major'))
    }

    if (this.pXFactor === 32) {
      this.pMemberNamePrefix = 's_p_'
      this.pCorrectLocZ = 0
    } else {
      this.pMemberNamePrefix = 'p_'
      this.pCorrectLocZ = 1
    }

    this.pPartClass = value(getThread(symbol('#room')).getComponent().getClassContainer().GET('petpart'))
    return true
  }

  deconstruct() {
    this.pGeometry = null
    this.pPartList = []
    this.pInfoStruct = {}
    if (this.pSprite && this.pSprite.spriteNum) {
      releaseSprite(this.pSprite.spriteNum)
    }
    if (this.pMatteSpr && this.pMatteSpr.spriteNum) {
      releaseSprite(this.pMatteSpr.spriteNum)
    }
    if (this.pShadowSpr && this.pShadowSpr.spriteNum) {
      releaseSprite(this.pShadowSpr.spriteNum)
    }
    if (memberExists(this.getCanvasName())) {
      removeMember(this.getCanvasName())
    }
    this.pShadowSpr = null
    this.pMatteSpr = null
    this.pSprite = null
    return true
  }

  getID() {
    return this.pIDPrefix + this.pName
  }

  define(tdata) {
    this.setup(tdata)
    if (!memberExists(this.getCanvasName())) {
      createMember(this.getCanvasName(), 'bitmap')
    }
    this.pMember = member(getmemnum(this.getCanvasName()))
    this.pMember.image = new ImageData(this.pCanvasSize[0], this.pCanvasSize[1])
    this.pMember.regPoint = point(0, this.pMember.image.height + this.pCanvasSize[3])
    this.pBuffer = this.pMember.image.duplicate()
    this.pSprite = sprite(reserveSprite(this.getID()))
    this.pSprite.castNum = this.pMember.number
    this.pSprite.width = this.pMember.width
    this.pSprite.height = this.pMember.height
    this.pSprite.ink = 36
    this.pMatteSpr = sprite(reserveSprite(this.getID()))
    this.pMatteSpr.castNum = this.pMember.number
    this.pMatteSpr.ink = 8
    this.pMatteSpr.blend = 0
    this.pShadowSpr = sprite(reserveSprite(this.getID()))
    this.pShadowSpr.blend = 16
    this.pShadowSpr.ink = 8
    this.pShadowFix = 0
    this.pDefShadowMem = member(getmemnum(this.pMemberNamePrefix + 'std_sd_001_0_0'))
    const tTargetID = getThread(symbol('#room')).getInterface().getID()
    setEventBroker(this.pMatteSpr.spriteNum, this.getID())
    this.pMatteSpr.registerProcedure(symbol('#eventProcUserObj'), tTargetID, symbol('#mouseDown'))
    this.pMatteSpr.registerProcedure(symbol('#eventProcUserRollOver'), tTargetID, symbol('#mouseEnter'))
    this.pMatteSpr.registerProcedure(symbol('#eventProcUserRollOver'), tTargetID, symbol('#mouseLeave'))
    setEventBroker(this.pShadowSpr.spriteNum, this.getID())
    this.pShadowSpr.registerProcedure(symbol('#eventProcUserObj'), tTargetID, symbol('#mouseDown'))
    this.pInfoStruct[symbol('#name')] = this.pName
    this.pInfoStruct[symbol('#class')] = this.pClass
    this.pInfoStruct[symbol('#custom')] = this.pCustom
    this.pInfoStruct[symbol('#image')] = this.getPicture()
    return true
  }

  setup(tdata) {
    this.pName = tdata[symbol('#name')]
    this.pClass = tdata[symbol('#class')]
    this.pDirection = tdata[symbol('#direction')][0]
    this.pLocX = tdata[symbol('#x')]
    this.pLocY = tdata[symbol('#y')]
    this.pLocH = tdata[symbol('#h')]
    this.pRace = tdata[symbol('#figure')].word[0]
    this.pOffsetList = this.getOffsetList()
    this.pOffsetListSmall = this.getOffsetList(symbol('#small'))
    this.pCustom = getText('pet_race_' + this.pRace + '_' + tdata[symbol('#figure')].word[1], EMPTY)
    if (this.pName.includes(numToChar(4))) {
      this.pIDPrefix = this.pName.substring(0, offset(numToChar(4), this.pName))
      this.pName = this.pName.substring(offset(numToChar(4), this.pName))
    }
    this.pCanvasSize = [62, 62, 32, -18]
    if (!this.setPartLists(tdata[symbol('#figure')])) {
      return error(this, "Couldn't create part lists!", symbol('#setup'), symbol('#major'))
    }
    this.resetValues(this.pLocX, this.pLocY, this.pLocH, this.pDirection, this.pDirection)
    this.Refresh(this.pLocX, this.pLocY, this.pLocH)
    this.pSync = 0
  }

  update() {
    this.pSync = !this.pSync
    if (this.pSync) {
      this.prepare()
    } else {
      this.render()
    }
  }

  getWebID() {
    return 0
  }

  setUserTypingStatus(tStatus) {
    // nothing()
  }

  resetValues(tX, tY, tH, tDirHead, tDirBody) {
    this.pWaving = 0
    this.pMoving = 0
    this.pTalking = 0
    this.pSniffing = 0
    call(symbol('#reset'), this.pPartList)
    if (this.pCorrectLocZ) {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH + this.pRestingHeight)
    } else {
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(tX, tY, tH)
    }
    this.pMainAction = 'std'
    this.pLocX = tX
    this.pLocY = tY
    this.pLocH = tH
    this.pRestingHeight = 0.0
    call(symbol('#defineDir'), this.pPartList, tDirBody)
    if (tDirBody !== this.pFlipList[tDirBody + 1]) {
      if (tDirBody !== tDirHead) {
        switch (tDirHead) {
          case 4: tDirHead = 2; break
          case 5: tDirHead = 1; break
          case 6: tDirHead = 4; break
          case 7: tDirHead = 5; break
        }
      }
    }
    this.pPartList[this.pPartIndex['hd']].defineDir(tDirHead)
    this.pDirection = tDirBody
  }

  Refresh(tX, tY, tH, tDirHead, tDirBody) {
    this.arrangeParts()
    this.pChanges = 1
  }

  select() {
    // the doubleClick - handled by event broker in JS
    if (connectionExists(getVariable('connection.info.id', symbol('#Info')))) {
      getConnection(getVariable('connection.info.id', symbol('#Info'))).send('GETPETSTAT', [{ string: this.pIDPrefix + this.pName }])
    }
    return true
  }

  getClass() {
    return 'pet'
  }

  getName() {
    return this.pName
  }

  setPartModel(tPart, tmodel) {
    if (voidP(this.pPartIndex[tPart])) {
      return null
    }
    this.pPartList[this.pPartIndex[tPart]].setModel(tmodel)
  }

  setPartColor(tPart, tColor) {
    if (voidP(this.pPartIndex[tPart])) {
      return { r: 255, g: 199, b: 199 }
    }
    this.pPartList[this.pPartIndex[tPart]].setColor(tColor)
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case symbol('#loc'):
        return [this.pLocX, this.pLocY, this.pLocH]
      case symbol('#moving'):
        return this.pMoving
      default:
        return 0
    }
  }

  getCustom() {
    return this.pCustom
  }

  getLocation() {
    return [this.pLocX, this.pLocY, this.pLocH]
  }

  getScrLocation() {
    return this.pScreenLoc
  }

  getTileCenter() {
    return { locH: this.pScreenLoc[0] + (this.pXFactor / 2), locV: this.pScreenLoc[1] }
  }

  getPartLocation(tPart) {
    return this.getTileCenter()
  }

  getDirection() {
    return this.pDirection
  }

  getPartMember(tPart) {
    if (voidP(this.pPartIndex[tPart])) {
      return null
    }
    return this.pPartList[this.pPartIndex[tPart]].getCurrentMember()
  }

  getPartColor(tPart) {
    if (voidP(this.pPartIndex[tPart])) {
      return { r: 255, g: 199, b: 199 }
    }
    return this.pPartList[this.pPartIndex[tPart]].getColor()
  }

  getPicture(tImg) {
    if (voidP(tImg)) {
      // In Director: image(width, height, depth)
      // Placeholder: return null until canvas image system is implemented
      return null
    }
    if (voidP(this.pInfoStruct[symbol('#image')])) {
      const tPartDefinition = ['tl', 'bd', 'hd']
      const tTempPartList = []
      for (const tPartSymbol of tPartDefinition) {
        if (!voidP(this.pPartIndex[tPartSymbol])) {
          tTempPartList.push(this.pPartList[this.pPartIndex[tPartSymbol]])
        }
      }
      call(symbol('#copyPicture'), tTempPartList, tImg)
    } else {
      // tImg.copyPixels(pInfoStruct[#image], tCanvas.rect, tCanvas.rect)
    }
    return this.flipImage(tImg)
  }

  getInfo() {
    return this.pInfoStruct
  }

  getSprites() {
    return [this.pSprite, this.pShadowSpr, this.pMatteSpr]
  }

  closeEyes() {
    this.pPartList[this.pPartIndex['hd']].defineAct('eyb')
    this.pEyesClosed = 1
    this.pChanges = 1
  }

  openEyes() {
    this.pPartList[this.pPartIndex['hd']].defineAct('std')
    this.pEyesClosed = 0
    this.pChanges = 1
  }

  show() {
    if (this.pSprite) this.pSprite.visible = true
    if (this.pMatteSpr) this.pMatteSpr.visible = true
    if (this.pShadowSpr) this.pShadowSpr.visible = true
  }

  hide() {
    if (this.pSprite) this.pSprite.visible = false
    if (this.pMatteSpr) this.pMatteSpr.visible = false
    if (this.pShadowSpr) this.pShadowSpr.visible = false
  }

  draw(tRGB) {
    if (!tRGB || typeof tRGB !== 'object') {
      tRGB = { r: 255, g: 0, b: 0 }
    }
    // pMember.image.draw - placeholder
  }

  prepare() {
    this.pAnimCounter = (this.pAnimCounter + 1) % 4
    if (this.pEyesClosed) {
      this.openEyes()
    } else {
      if (random(30) === 3) {
        this.closeEyes()
      }
    }
    if (this.pTalking && (random(3) > 1)) {
      this.pPartList[this.pPartIndex['hd']].defineAct('spk')
      this.pChanges = 1
    }
    if (this.pWaving) {
      this.pPartList[this.pPartIndex['tl']].defineAct('wav')
      this.pChanges = 1
    }
    if (this.pSniffing) {
      this.pPartList[this.pPartIndex['hd']].defineAct('snf')
      this.pChanges = 1
    }
    if (this.pMainAction === 'scr') {
      this.pPartList[this.pPartIndex['bd']].defineAct('scr')
      this.pChanges = 1
    }
    if (this.pMainAction === 'bnd') {
      this.pPartList[this.pPartIndex['bd']].defineAct('bnd')
      this.pChanges = 1
    }
    if (this.pMainAction === 'jmp') {
      this.pPartList[this.pPartIndex['bd']].defineAct('jmp')
      this.pChanges = 1
    }
    if (this.pMainAction === 'pla') {
      this.pPartList[this.pPartIndex['bd']].defineAct('pla')
      this.pChanges = 1
    }
    if (this.pMoving) {
      const tFactor = lingoFloat(Date.now() - this.pMoveStart) / this.pMoveTime
      const tFactorClamped = tFactor > 1.0 ? 1.0 : tFactor
      this.pScreenLoc = [
        ((this.pDestLScreen[0] - this.pStartLScreen[0]) * tFactorClamped) + this.pStartLScreen[0],
        ((this.pDestLScreen[1] - this.pStartLScreen[1]) * tFactorClamped) + this.pStartLScreen[1],
        ((this.pDestLScreen[2] - this.pStartLScreen[2]) * tFactorClamped) + this.pStartLScreen[2],
      ]
      this.pChanges = 1
    }
  }

  render() {
    if (!this.pChanges) {
      return
    }
    this.pChanges = 0
    if (this.pShadowSpr.member !== this.pDefShadowMem) {
      this.pShadowSpr.member = this.pDefShadowMem
    }
    if ((this.pBuffer.width !== this.pCanvasSize[0]) || (this.pBuffer.height !== this.pCanvasSize[1])) {
      this.pMember.image = new ImageData(this.pCanvasSize[0], this.pCanvasSize[1])
      this.pMember.regPoint = point(0, this.pCanvasSize[1] + this.pCanvasSize[3])
      this.pSprite.width = this.pCanvasSize[0]
      this.pSprite.height = this.pCanvasSize[1]
      this.pMatteSpr.width = this.pCanvasSize[0]
      this.pMatteSpr.height = this.pCanvasSize[1]
      this.pBuffer = new ImageData(this.pCanvasSize[0], this.pCanvasSize[1])
    }
    let tFlip = false
    tFlip = tFlip || (this.pFlipList[this.pDirection + 1] !== this.pDirection)
    tFlip = tFlip || ((this.pDirection === 3) && (this.pPartList[this.pPartIndex['hd']].pDirection === 4))
    tFlip = tFlip || ((this.pDirection === 7) && (this.pPartList[this.pPartIndex['hd']].pDirection === 6))
    if (tFlip) {
      this.pMember.regPoint = point(this.pMember.image.width, this.pMember.regPoint[1])
      this.pShadowFix = this.pXFactor
      if (!this.pSprite.flipH) {
        this.pSprite.flipH = true
        this.pMatteSpr.flipH = true
        this.pShadowSpr.flipH = true
      }
    } else {
      this.pMember.regPoint = point(0, this.pMember.regPoint[1])
      this.pShadowFix = 0
      if (this.pSprite.flipH) {
        this.pSprite.flipH = false
        this.pMatteSpr.flipH = false
        this.pShadowSpr.flipH = false
      }
    }
    const tOffZ = this.pCorrectLocZ
      ? ((this.pLocH + this.pRestingHeight) * 1000) + 2
      : 2
    this.pSprite.locH = this.pScreenLoc[0]
    this.pSprite.locV = this.pScreenLoc[1]
    this.pSprite.locZ = this.pScreenLoc[2] + tOffZ
    this.pMatteSpr.loc = { locH: this.pSprite.locH, locV: this.pSprite.locV }
    this.pMatteSpr.locZ = this.pSprite.locZ + 1
    this.pShadowSpr.loc = { locH: this.pSprite.locH + this.pShadowFix, locV: this.pSprite.locV }
    this.pShadowSpr.locZ = this.pSprite.locZ - 3
    this.pUpdateRect = rect(0, 0, 0, 0)
    // pBuffer.fill - placeholder for canvas fill
    call(symbol('#update'), this.pPartList)
    // pMember.image.copyPixels - placeholder
  }

  reDraw() {
    // pBuffer.fill - placeholder
    call(symbol('#render'), this.pPartList)
    // pMember.image.copyPixels - placeholder
  }

  setPartLists(tFigure) {
    const tAction = this.pMainAction
    this.pPartList = []
    const tPartDefinition = ['tl', 'bd', 'hd']
    if (!tFigure.word || tFigure.word.length < 3) {
      tFigure = '0 4 AA98EF'
    }
    const tRaceNum = tFigure.word[0]
    let tPalette = tFigure.word[1]
    if (tPalette.length < 2) {
      tPalette = '00' + tPalette
    } else if (tPalette.length < 3) {
      tPalette = '0' + tPalette
    }
    const tPaletteType = this.pPetDefinitions[tRaceNum][symbol('#paletteid')]
    tPalette = 'Palette ' + tPaletteType + ' ' + tPalette
    const tColor = tFigure.word[2] // rgb() parsed as string
    for (let i = 0; i < tPartDefinition.length; i++) {
      const tPartSymbol = tPartDefinition[i]
      const tPartObj = { symbol: '#temp', class: this.pPartClass } // createObject placeholder
      const tmodel = this.pPetDefinitions[tRaceNum][symbol('#parts')][tPartSymbol]
      tPartObj.define(tPartSymbol, tmodel, tPalette, tColor, this.pDirection, tAction, this)
      this.pPartList.push(tPartObj)
    }
    this.pPartIndex = {}
    for (let i = 0; i < this.pPartList.length; i++) {
      this.pPartIndex[this.pPartList[i].pPart] = i + 1
    }
    return true
  }

  arrangeParts() {
    const tTailInd = this.pPartIndex['tl']
    const tHeadInd = this.pPartIndex['hd']
    const tBodyInd = this.pPartIndex['bd']
    const tTail = this.pPartList[tTailInd - 1]
    const tHead = this.pPartList[tHeadInd - 1]
    const tBody = this.pPartList[tBodyInd - 1]
    const tHeadDir = tHead.getDirection()
    if (tHeadDir === 7) {
      this.pPartList = [tHead, tBody, tTail]
      this.pPartIndex = { hd: 1, bd: 2, tl: 3 }
    } else if (this.pDirection === 6 || this.pDirection === 7 || this.pDirection === 0) {
      this.pPartList = [tBody, tHead, tTail]
      this.pPartIndex = { bd: 1, hd: 2, tl: 3 }
    } else {
      this.pPartList = [tTail, tBody, tHead]
      this.pPartIndex = { tl: 1, bd: 2, hd: 3 }
    }
  }

  flipImage(tImg_a) {
    // Image flip - placeholder
    return tImg_a
  }

  getOffsetList(tSize) {
    if (voidP(tSize)) {
      tSize = symbol('#large')
    }
    const tPetOffsetId = this.pPetDefinitions[this.pRace][symbol('#offsetid')]
    const tListMemName = tSize === symbol('#large')
      ? 'offset.' + tPetOffsetId + '.large'
      : 'offset.' + tPetOffsetId + '.small'
    if (!memberExists(tListMemName)) {
      return {}
    }
    const tListText = member(getmemnum(tListMemName)).text
    const tList = {}
    const tAliasList = {}
    const lines = tListText.split('\n')
    for (let tLineNo = 0; tLineNo < lines.length; tLineNo++) {
      const tLineText = lines[tLineNo]
      if (!tLineText.startsWith('#')) {
        const items = tLineText.split('=')
        if (items.length > 1) {
          const tKey = value(items[0])
          const tValue = value(items.slice(1).join('='))
          if (Array.isArray(tValue)) {
            tList[tKey] = tValue
            continue
          }
          tAliasList[tKey] = tValue
        }
      }
    }
    for (const tKey in tAliasList) {
      const tAliasKey = tAliasList[tKey]
      if (tList[tAliasKey] !== undefined) {
        tList[tKey] = tList[tAliasKey]
        continue
      }
      error(this, 'Invalid alias definition, no offset available: ' + tValue, this.getID(), symbol('#getOffsetList'), symbol('#minor'))
    }
    return tList
  }

  getCanvasName() {
    return this.pClass + ' ' + this.pIDPrefix + this.pName + this.getID() + ' Canvas'
  }

  action_mv(tProps) {
    this.pMainAction = 'wlk'
    this.pMoving = 1
    const tloc = tProps.word[1]
    const tLocX = integer(tloc[0])
    const tLocY = integer(tloc[1])
    const tLocH = getLocalFloat(tloc[2])
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH)
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH)
    this.pMoveStart = Date.now()
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('wlk')
  }

  action_sld(tProps) {
    this.pMoving = 1
    const tloc = tProps.word[1]
    const tLocX = integer(tloc[0])
    const tLocY = integer(tloc[1])
    const tLocH = getLocalFloat(tloc[2])
    this.pStartLScreen = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight)
    this.pDestLScreen = this.pGeometry.getScreenCoordinate(tLocX, tLocY, tLocH)
    this.pMoveStart = Date.now()
  }

  action_sit(tProps) {
    this.pMainAction = 'sit'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('sit')
    if (this.pCorrectLocZ) {
      this.pRestingHeight = getLocalFloat(tProps.word[1]) - this.pLocH
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight)
    } else {
      this.pRestingHeight = getLocalFloat(tProps.word[1])
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pRestingHeight)
    }
  }

  action_snf() {
    this.pSniffing = 1
    this.pPartList[this.pPartIndex['hd'] - 1].defineAct('snf')
  }

  action_scr() {
    this.pMainAction = 'scr'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('scr')
  }

  action_bnd() {
    this.pMainAction = 'bnd'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('bnd')
  }

  action_lay(tProps) {
    this.pMainAction = 'lay'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('lay')
    if (this.pCorrectLocZ) {
      this.pRestingHeight = getLocalFloat(tProps.word[1]) - this.pLocH
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pLocH + this.pRestingHeight)
    } else {
      this.pRestingHeight = getLocalFloat(tProps.word[1])
      this.pScreenLoc = this.pGeometry.getScreenCoordinate(this.pLocX, this.pLocY, this.pRestingHeight)
    }
  }

  action_slp(tProps) {
    this.action_lay(tProps)
    this.pMainAction = 'slp'
    this.pPartList[this.pPartIndex['hd'] - 1].defineAct('slp')
  }

  action_jmp(tProps) {
    this.pMainAction = 'jmp'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('jmp')
  }

  action_ded(tProps) {
    this.pMainAction = 'ded'
    this.pPartList[this.pPartIndex['hd'] - 1].defineAct('ded')
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('ded')
    this.pPartList[this.pPartIndex['tl'] - 1].defineAct('ded')
  }

  action_eat(tProps) {
    this.pPartList[this.pPartIndex['hd'] - 1].defineAct('eat')
  }

  action_beg(tProps) {
    this.pMainAction = 'beg'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('beg')
    this.pPartList[this.pPartIndex['hd'] - 1].defineAct('beg')
  }

  action_pla(tProps) {
    this.pMainAction = 'pla'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('pla')
  }

  action_rdy(tProps) {
    this.pMainAction = 'rdy'
    this.pPartList[this.pPartIndex['bd'] - 1].defineAct('rdy')
  }

  action_talk(tProps) {
    this.pTalking = 1
  }

  action_wav(tProps) {
    this.pWaving = 1
    this.pPartList[this.pPartIndex['tl'] - 1].defineAct('wav')
  }

  action_gst(tProps) {
    const tGesture = tProps.word[1]
    this.pPartList[this.pPartIndex['hd'] - 1].defineAct(tGesture)
    switch (tGesture) {
      case 'sml':
      case 'agr':
      case 'sad':
      case 'puz':
        this.pPartList[this.pPartIndex['tl'] - 1].defineAct(tGesture)
    }
  }
}
