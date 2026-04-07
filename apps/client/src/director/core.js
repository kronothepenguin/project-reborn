import { loadImage, loadModule, loadPromise } from "./loader";

export const _params = {};

export function setExternalParam(name, value) {
  _params[name] = value;
}

class Rect {}

class Member {
  fileName = "";
  media = new ArrayBuffer();
  name = "";
  regPoint = [0, 0];

  /** @type{any} */
  _obj = null;

  constructor(castLibNum, number, type, name, width, height, rect) {
    this._castLibNum = castLibNum;
    this._number = number;
    this._type = type;
    this.name = name;
    this._width = width;
    this._height = height;
    this._rect = rect;
  }

  get castLibNum() {
    return this._castLibNum;
  }

  get height() {
    return this._height;
  }

  get number() {
    return this._number;
  }

  get rect() {
    return this._rect;
  }

  get type() {
    // #animgif         #ole
    // #bitmap          #palette
    // #button          #picture
    // #cursor          #QuickTimeMedia
    // #digitalVideo    #realMedia
    // #DVD             #script
    // #empty           #shape
    // #field           #shockwave3D
    // #filmLoop        #sound
    // #flash           #swa
    // #flashcomponent  #text
    // #font            #transition
    // #havok           #vectorShape
    // #movie           #windowsMedia
    return this._type;
  }

  get width() {
    return this._width;
  }

  duplicate() {}

  erase() {}

  importFileInto() {}
}

class CastLibrary {
  name = "";
  // • 0. Load the cast library when needed. This is the default value.
  // • 1. Load the cast library before frame 1.
  // • 2. Load the cast library after frame 1.
  preLoadMode = 0;

  /** @type{Record<any, Member>} */
  _memberRegistry = {};
  _memberCount = 0;

  constructor(name, number) {
    this.name = name;
    this._number = number;
  }

  get fileName() {
    return "";
  }

  get member() {
    return { ...this._memberRegistry };
  }

  get number() {
    return this._number;
  }

  _registerMember(name, member) {
    const memNum = this._memberCount + 1;
    this._memberCount++;

    this._memberRegistry[name] = member;
    this._memberRegistry[memNum] = member;
  }
}

class Sprite {}

class Movie {
  keyboardFocusSprite = -1;

  /** @type{Record<any, CastLibrary>} */
  _castRegistry = {};
  _castCount = 0;

  constructor() {}

  get castLib() {
    return { ...this._castRegistry };
  }

  get lastChannel() {
    return 0;
  }

  puppetSprite(intTempo) {
    _player._tempo = intTempo;
  }

  puppetTempo() {}

  stopEvent() {}

  updateStage() {}

  _registerCast(name, members) {
    const castLibs = this._castRegistry;

    if (!!castLibs[name]) {
      return;
    }

    const castNum = _movie._castCount + 1;
    _movie._castCount++;

    const cast = new CastLibrary(name, castNum);

    for (const member of members) {
      member._castLibNum = castNum;
      member._number = cast._memberCount;

      const memberName = member.name;

      cast._registerMember(memberName, member);
    }

    castLibs[name] = cast;
    castLibs[castNum] = cast;
  }
}

export const _movie = new Movie();

class Player {
  /** @type{HTMLCanvasElement|null} */
  _canvas = null;

  _tempo = 60; // 60 FPS
  _start = 0;

  constructor() {}

  cursor() {}

  externalParamValue() {}

  getPref() {}

  setPref() {}

  _play() {
    this._canvas?.dispatchEvent(new CustomEvent("prepareMovie"));
    requestAnimationFrame(this._animationFrame);
  }

  _stop() {}

  _animationFrame = (timestamp) => {
    if (this._start === 0) {
      this._start = timestamp;
    }

    const delta = timestamp - this._start;
    const target = 1000 / this._tempo;

    if (Math.abs(target - delta) > 1 && delta < target) {
      requestAnimationFrame(this._animationFrame);
      return;
    }

    // TODO: frame

    this._start = timestamp;

    requestAnimationFrame(this._animationFrame);
  };
}

export const _player = new Player();

export function createBitmapMember(name, src) {
  const member = new Member(0, 0, Symbol.for("bitmap"), name, 0, 0, null);

  const img = loadImage(src);
  img.addEventListener("load", () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    context?.drawImage(img, 0, 0);

    const imageData = context?.getImageData(0, 0, img.width, img.height);
    if (imageData?.data.buffer) {
      member.media = imageData?.data.buffer;
    }
  });

  return member;
}

export function createScriptMember(name, src) {
  const member = new Member(0, 0, Symbol.for("script"), name, 0, 0, null);

  if (typeof src === "string") {
    src = loadModule(src);
  } else {
    loadPromise(src);
  }
  member._obj = src;

  return member;
}

/**
 *
 * @param {string} name
 * @param {Member[]} members
 * @returns
 */
export function registerCast(name, members) {
  _movie._registerCast(name, members);
}

export function on(event, callback) {
  _player._canvas?.addEventListener(event, callback);
}
