// main.js - Entry point for Habbo Hotel client
// Creates canvas, initializes runtime, starts game loop

import {
  setStage,
  setMouseLoc,
  setKeyDown,
  registerMovieHandler,
  getMovieHandlers,
  theMilliSeconds,
  externalParamValue,
  registerExternalParam,
  clearMovieHandlers,
  renderSprites,
  preloadMemberImages,
} from './core/lingo-runtime.js'

// Import casts (side-effects register handlers and members)
import './habbo/index.js'
import './fuse_client/index.js'

const STAGE_WIDTH = 720
const STAGE_HEIGHT = 540

let canvas = null
let ctx = null
let animFrameId = null
let running = false

// ── Mount API ──────────────────────────────────────────────────────────────

export function mount(element, params = {}) {
  if (canvas) {
    unmount()
  }

  // Setup external params
  for (const [key, value] of Object.entries(params)) {
    registerExternalParam(key, value)
  }

  // Dev mode: read from .env
  if (import.meta.env.DEV) {
    if (!params.serverHost && import.meta.env.VITE_SERVER_HOST) {
      registerExternalParam('serverHost', import.meta.env.VITE_SERVER_HOST)
    }
    if (!params.serverPort && import.meta.env.VITE_SERVER_PORT) {
      registerExternalParam('serverPort', import.meta.env.VITE_SERVER_PORT)
    }
    if (!params.debug && import.meta.env.VITE_DEBUG_MODE === 'true') {
      registerExternalParam('debug', true)
    }
  }

  // Create canvas
  canvas = document.createElement('canvas')
  canvas.width = STAGE_WIDTH
  canvas.height = STAGE_HEIGHT
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.cursor = 'default'

  // Clear element and append canvas
  element.innerHTML = ''
  element.appendChild(canvas)

  ctx = canvas.getContext('2d')
  setStage({ canvas, ctx, width: STAGE_WIDTH, height: STAGE_HEIGHT })

  // Setup event listeners
  setupEvents()

  // Call prepareMovie handlers
  for (const handler of getMovieHandlers('prepareMovie')) {
    handler.fn()
  }

  // Preload member images
  preloadMemberImages()

  // Start game loop
  running = true
  gameLoop()

  return { canvas, ctx, unmount }
}

export function unmount() {
  running = false
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  // Call stopMovie handlers
  for (const handler of getMovieHandlers('stopMovie')) {
    handler.fn()
  }

  clearMovieHandlers()

  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas)
  }
  canvas = null
  ctx = null
}

// ── Event Handling ─────────────────────────────────────────────────────────

function setupEvents() {
  if (!canvas) return

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = STAGE_WIDTH / rect.width
    const scaleY = STAGE_HEIGHT / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    setMouseLoc(x, y)
  })

  canvas.addEventListener('mousedown', (e) => {
    setMouseLocFromEvent(e)
    // TODO: dispatch to sprite handlers
  })

  canvas.addEventListener('mouseup', (e) => {
    setMouseLocFromEvent(e)
    // TODO: dispatch to sprite handlers
  })

  canvas.addEventListener('mouseenter', () => {
    // TODO: dispatch to sprite handlers
  })

  canvas.addEventListener('mouseleave', () => {
    setMouseLoc(-1, -1)
    // TODO: dispatch to sprite handlers
  })

  window.addEventListener('keydown', (e) => {
    setKeyDown(true)
    // TODO: dispatch to sprite handlers
  })

  window.addEventListener('keyup', (e) => {
    setKeyDown(false)
    // TODO: dispatch to sprite handlers
  })
}

function setMouseLocFromEvent(e) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = STAGE_WIDTH / rect.width
  const scaleY = STAGE_HEIGHT / rect.height
  const x = Math.floor((e.clientX - rect.left) * scaleX)
  const y = Math.floor((e.clientY - rect.top) * scaleY)
  setMouseLoc(x, y)
}

// ── Game Loop ──────────────────────────────────────────────────────────────

function gameLoop() {
  if (!running) return

  // Call exitFrame handlers
  for (const handler of getMovieHandlers('exitFrame')) {
    handler.fn()
  }

  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

  // Render sprites to canvas
  renderSprites(ctx, STAGE_WIDTH, STAGE_HEIGHT)

  animFrameId = requestAnimationFrame(gameLoop)
}

// ── Dev mode auto-mount ────────────────────────────────────────────────────

if (import.meta.env.DEV) {
  window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game')
    if (container) {
      mount(container)
    }
  })
}
