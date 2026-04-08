export const _params = {};

class Rect {}

export class Member {
  fileName = "";
  media = new ArrayBuffer();
  name = "";
  regPoint = [0, 0];

  /** @type{any} */
  _raw = null;

  _scriptType = Symbol.for("empty");
  _scriptInstance = null;

  _castLibNum = 0;
  _number = 0;

  _width = 0;
  _height = 0;

  _rect = new Rect();

  constructor(type, name) {
    this._type = type;
    this.name = name;
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

export class CastLibrary {
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

export class Sprite {}

export class Movie {
  keyboardFocusSprite = -1;

  /** @type{Record<any, CastLibrary>} */
  _castRegistry = {};
  _castCount = 0;

  _tempo = 60; // 60 FPS

  constructor() {}

  get castLib() {
    return { ...this._castRegistry };
  }

  get lastChannel() {
    return 0;
  }

  puppetSprite(intTempo) {
    this._tempo = intTempo;
  }

  puppetTempo() {}

  stopEvent() {}

  updateStage() {}

  _registerCast(name, members) {
    const castLibs = this._castRegistry;

    if (!!castLibs[name]) {
      return;
    }

    const castNum = this._castCount + 1;
    this._castCount++;

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

export class Player {
  constructor(movie) {
    this._movie = movie;
  }

  cursor() {}

  externalParamValue() {}

  getPref() {}

  setPref() {}
}

export class List {
  constructor(...args) {}
}
