// habbo/Internal_1_Initialization.ls → initialization.js
// prepareMovie and stopMovie - Director movie-level handlers

import {
  voidP,
  externalParamValue,
  getItemDelimiter,
  setItemDelimiter,
  postNetText,
  setDebugPlaybackEnabled,
  castLib,
  moveToFront,
  theStage,
  setExitLock,
  puppetTempo,
  registerMovieHandler,
  reserveSprite,
  sprite,
  member,
  getmemnum,
  memberExists,
} from '../core/lingo-runtime.js'

let logoSpriteNum = null

function prepareMovie() {
  const runMode = 'Plugin'

  if (!runMode.includes('Author')) {
    let tProcessLogURL = ''
    let tAccountID = ''
    const tDelim = getItemDelimiter()

    for (let i = 1; i <= 9; i++) {
      const tParamBundle = externalParamValue('sw' + i)
      if (!voidP(tParamBundle)) {
        setItemDelimiter(';')
        const items = tParamBundle.split(';')
        for (let j = 0; j < items.length; j++) {
          const tParam = items[j]
          setItemDelimiter('=')
          const parts = tParam.split('=')
          if (parts.length > 1) {
            const tKey = parts[0]
            const tValue = parts.slice(1).join('=')
            if (tKey === 'processlog.url') {
              tProcessLogURL = tValue
            } else if (tKey === 'account_id') {
              tAccountID = tValue
            }
          }
          setItemDelimiter(';')
        }
      }
    }
    setItemDelimiter(tDelim)

    if (tProcessLogURL !== '') {
      postNetText(tProcessLogURL, { step: 8, account_id: tAccountID })
    }
  }

  setDebugPlaybackEnabled(false)
  castLib(2).preloadMode = 1

  moveToFront(theStage())
  setExitLock(true)
  puppetTempo(15)

  // Show logo sprite
  if (memberExists('Logo')) {
    logoSpriteNum = reserveSprite('habbo')
    if (logoSpriteNum) {
      const sp = sprite(logoSpriteNum)
      const tmember = member(getmemnum('Logo'))
      if (tmember) {
        sp.member = tmember
        sp.locH = 360  // center of 720
        sp.locV = 270  // center of 540
        sp.width = tmember._img?.width || 170
        sp.height = tmember._img?.height || 179
        sp.visible = true
        sp.blend = 90
        sp.locZ = -20000001
      }
    }
  }
}

function stopMovie() {
  // Hide logo sprite
  if (logoSpriteNum) {
    const sp = sprite(logoSpriteNum)
    if (sp) sp.visible = false
  }
}

// Register as Director movie handlers (not regular exports)
registerMovieHandler('prepareMovie', prepareMovie, 'habbo')
registerMovieHandler('stopMovie', stopMovie, 'habbo')
