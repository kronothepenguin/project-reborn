/**
 * Event Agent Class
 * Translated from: 67_Event Agent Class.ls
 * Invisible sprite that follows mouse and routes events.
 */
import { VOID, voidp } from '../../core/lingo-runtime.js';
import { ObjectBase } from './object-base-class.js';
import { ObjectManager } from './object-manager-class.js';
import { reserveSprite, releaseSprite } from './sprite-api.js';
import { receivePrepare, removePrepare } from './object-api.js';

export class EventAgent extends ObjectBase {
  constructor() {
    super();
    this.eventList = new Map();
    this.sprite = null;
  }

  construct() {
    this.eventList = new Map();
    const sprNum = reserveSprite(this.id);
    if (!sprNum) return 0;

    this.sprite = {
      channel: sprNum,
      member: null,
      rect: [-90, -90, -80, -80],
      locZ: 20000000,
      blend: 0,
      visible: false,
      locX: -90,
      locY: -90,
    };

    return 1;
  }

  deconstruct() {
    removePrepare(this.id);
    if (this.sprite?.channel) releaseSprite(this.sprite.channel);
    this.sprite = null;
    this.eventList.clear();
    return 1;
  }

  registerEvent(tObj, tEvent, tMethod) {
    this.eventList.set(tEvent, { obj: tObj, method: tMethod });

    if (this.sprite) {
      this.sprite.visible = true;
    }

    return receivePrepare(this.id);
  }

  unregisterEvent(tEvent) {
    this.eventList.delete(tEvent);

    if (this.eventList.size === 0) {
      removePrepare(this.id);
      if (this.sprite) {
        this.sprite.visible = false;
        this.sprite.rect = [-90, -90, -80, -80];
      }
    }
    return 1;
  }

  prepare() {
    // Follow mouse
    if (this.sprite) {
      this.sprite.locX = (globalThis.mouseX || 0) - 5;
      this.sprite.locY = (globalThis.mouseY || 0) - 5;
    }
  }

  eventProcDefault(tEvent, tSprID, tParam) {
    const target = this.eventList.get(tEvent);
    if (voidp(target)) {
      if (this.sprite) this.sprite.removeProcedure?.(tEvent);
      return;
    }

    if (target.obj && typeof target.obj[target.method] === 'function') {
      return target.obj[target.method]();
    }
  }

  null() {}
}

ObjectManager.registerClass('Event Agent Class', EventAgent);
