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
} from '../core/lingo-runtime.js'

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
  // preloadNetThing(castLib(2).fileName) - handled by Vite import

  moveToFront(theStage())
  setExitLock(true)
  puppetTempo(15)
}

function stopMovie() {
  // stopClient() - will be implemented when connection system is translated
  // go(1) - go to frame 1
}

// Register as Director movie handlers (not regular exports)
registerMovieHandler('prepareMovie', prepareMovie, 'habbo')
registerMovieHandler('stopMovie', stopMovie, 'habbo')
