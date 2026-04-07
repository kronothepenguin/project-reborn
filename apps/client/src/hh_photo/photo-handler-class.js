// hh_photo/4_Photo Handler Class.ls → photo-handler-class.js
// Photo handler - handles film count updates from server

import { symbol, integer } from '../core/lingo-runtime.js'
import { getVariable } from '../fuse_client/variable-api.js'
import { registerListener, unregisterListener } from '../fuse_client/connection-api.js'
import { getMultiuserManager } from '../fuse_client/multiuser-api.js'
import { executeMessage } from '../fuse_client/broker-manager-api.js'
import { getObject } from '../fuse_client/object-api.js'

export class PhotoHandlerClass {
  constructor() {
    this.pComponent = null
  }

  construct() {
    registerListener(getVariable('connection.info.id'), this.getID(), { 4: symbol('#handle_film') })
    getMultiuserManager().registerListener(getVariable('connection.mus.id'), this.getID(), { OK: symbol('#handle_ok'), FILM: symbol('#handle_film_mus') })
    return true
  }

  deconstruct() {
    unregisterListener(getVariable('connection.info.id'), this.getID(), { 4: symbol('#handle_film') })
    getMultiuserManager().unregisterListener(getVariable('connection.mus.id'), this.getID(), { OK: symbol('#handle_ok'), FILM: symbol('#handle_film_mus') })
    return true
  }

  getID() {
    return 'hh_photo.handler'
  }

  getComponent() {
    return this.pComponent
  }

  setComponent(tComp) {
    this.pComponent = tComp
  }

  handle_ok(tMsg) {
    // no-op
  }

  handle_film(tMsg) {
    const tFilmCnt = tMsg.connection.GetIntFrom()
    this.getComponent().setFilm(tFilmCnt)
    getObject(symbol('#session')).set('user_photo_film', tFilmCnt)
    executeMessage(symbol('#updateFilmCount'))
    return true
  }

  handle_film_mus(tMsg) {
    const tContent = integer(tMsg.content)
    this.getComponent().setFilm(tContent)
    getObject(symbol('#session')).set('user_photo_film', tContent)
    executeMessage(symbol('#updateFilmCount'))
    return true
  }
}
