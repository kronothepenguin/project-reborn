import { _params, Member, addFinishedListener, loadImage, loadModule } from "./core";
import { _movie } from "./api";

export const BEHAVIOR_SCRIPT = Symbol.for("behavior");
export const MOVIE_SCRIPT = Symbol.for("movie");
export const PARENT_SCRIPT = Symbol.for("parent");

globalThis._director = {};

/** Loop */

/** @type{HTMLCanvasElement|null} */
let canvas = null;
let last = 0;

export function setCanvas(c) {
  canvas = c;
}

export function setExternalParams(params) {
  let src = "";
  for (const [name, value] of Object.entries(params)) {
    _params[name] = value;

    if (name === "src") {
      src = value;
    }
  }
  if (src) {
    load(src);
  }
}

function load(moviePath) {
  if (moviePath.endsWith(".js")) {
    loadModule(moviePath);
  }

  addFinishedListener(start);
}

function registerGlobalHandlers(script) {
  for (const property in script) {
    _director[property] = script[property];
  }
}

function start() {
  for (const cast of Object.values(_movie._castRegistry)) {
    for (const member of Object.values(cast._memberRegistry)) {
      if (
        member.type === Symbol.for("script") &&
        member._scriptType === MOVIE_SCRIPT
      ) {
        const script = member._raw();
        member._scriptInstance = script;
        registerGlobalHandlers(script);
        if (typeof script.prepareMovie === "function") {
          canvas?.addEventListener("prepareMovie", script.prepareMovie);
        }
      }
    }
  }

  canvas?.dispatchEvent(new CustomEvent("prepareMovie"));
  requestAnimationFrame(animationFrame);
}

function animationFrame(timestamp) {
  if (last === 0) {
    last = timestamp;
  }

  const delta = timestamp - last;
  const target = 1000 / _movie._tempo;

  if (Math.abs(target - delta) > 1 && delta < target) {
    requestAnimationFrame(animationFrame);
    return;
  }

  last = timestamp;

  requestAnimationFrame(animationFrame);
}

function on(event, callback) {
  canvas?.addEventListener(event, callback);
}

/** Members */

export function createBitmapMember(name, src) {
  const member = new Member(Symbol.for("bitmap"), name);

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

export function createFieldMember(name, content) {
  const member = new Member(Symbol.for("field"), name);

  return member;
}

export function createScriptMember(name, type, factory) {
  const member = new Member(Symbol.for("script"), name);

  member._scriptType = type;
  member._raw = factory;

  return member;
}

/** Casts */

export function registerCast(name, members) {
  _movie._registerCast(name, members);
}
