// DirectorContext
// Owns the singleton instances for one movie. `activate()` installs them into
// the module-level singleton slots (`runtime/singletons.js`) so any code that
// imports `_movie` / `_player` / etc. sees this context's instances. Each
// worker has its own module graph → its own slot bindings → per-movie
// isolation. On the main thread, sequential contexts must call `activate()`
// to swap slots. `activate()` also clears the static registries on
// CastLibraryObject / WindowObject so the new context starts clean.

import { MovieObject } from "./objects/movie.js";
import { PlayerObject } from "./objects/player.js";
import { SoundObject } from "./objects/sound.js";
import { KeyObject } from "./objects/key.js";
import { MouseObject } from "./objects/mouse.js";
import { SystemObject } from "./objects/system.js";
import { createGlobalProxy } from "./objects/global.js";
import { CastLibraryObject } from "./objects/cast-library.js";
import { WindowObject } from "./objects/window.js";
import { _installSingletons } from "./singletons.js";

export class DirectorContext {
  constructor(options = {}) {
    this.movie = new MovieObject();
    this.player = new PlayerObject();
    this.sound = new SoundObject();
    this.key = new KeyObject();
    this.mouse = new MouseObject();
    this.system = new SystemObject();
    this.global = createGlobalProxy();

    this.name = options.name ?? "";
    this.src = options.src ?? "";
    this.tempo = options.tempo ?? 30;
    this.width = options.width ?? 640;
    this.height = options.height ?? 480;

    this.canvas = null;
    this.eventLoopHandle = null;
    this.score = null;
    this.destroyed = false;
  }

  activate() {
    _installSingletons(this);
    CastLibraryObject._reset();
    WindowObject._reset();
    return this;
  }

  destroy() {
    if (this.eventLoopHandle) {
      this.eventLoopHandle.stop?.();
      this.eventLoopHandle = null;
    }
    this.canvas = null;
    this.destroyed = true;
  }
}