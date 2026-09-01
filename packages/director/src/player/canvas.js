// Canvas / stage rendering helpers.

let _canvas = null;
let _ctx = null;
let _movie = null;
let _width = 0;
let _height = 0;
let _bgColor = "#000000";

export function setCanvas(canvas, movie = null) {
  _canvas = canvas ?? null;
  _ctx = _canvas ? _canvas.getContext("2d") : null;
  _movie = movie ?? _movie;
  if (_canvas) {
    _width = _canvas.width;
    _height = _canvas.height;
  }
  return _canvas;
}

export function _setCanvas(canvas, movie = null) {
  return setCanvas(canvas, movie);
}

export function getCanvas() {
  return _canvas;
}

export function getContext() {
  return _ctx;
}

export function updateStage({ bgColor = _bgColor, sprites = null } = {}) {
  if (!_ctx || !_canvas) return;
  _ctx.fillStyle = bgColor;
  _ctx.fillRect(0, 0, _canvas.width, _canvas.height);

  const list = sprites ?? _movie?.sprites ?? [];
  for (const sprite of list) {
    _drawSprite(sprite);
  }
}

export function resizeCanvas(width, height) {
  if (!_canvas) return;
  _canvas.width = Number(width) || _canvas.width;
  _canvas.height = Number(height) || _canvas.height;
  _width = _canvas.width;
  _height = _canvas.height;
  if (_movie) {
    _movie.width = _width;
    _movie.height = _height;
  }
}

export function setBackgroundColor(color) {
  _bgColor = String(color ?? "#000000");
}

export function getStageSize() {
  return { width: _width, height: _height };
}

export function resetCanvas() {
  _canvas = null;
  _ctx = null;
  _movie = null;
  _width = 0;
  _height = 0;
  _bgColor = "#000000";
}

function _drawSprite(sprite) {
  if (!_ctx || !sprite) return;
  if (sprite.visible === false) return;
  const x = sprite.x ?? sprite.left ?? 0;
  const y = sprite.y ?? sprite.top ?? 0;
  const w = sprite.width ?? 0;
  const h = sprite.height ?? 0;

  if (sprite.text) {
    _ctx.fillStyle = sprite.color ?? "#ffffff";
    _ctx.font = sprite.font ?? "12px sans-serif";
    _ctx.fillText(sprite.text, x, y);
    return;
  }
  if (sprite.image) {
    _ctx.drawImage(sprite.image, x, y, w || sprite.image.width, h || sprite.image.height);
    return;
  }
  if (typeof sprite.color === "string") {
    _ctx.fillStyle = sprite.color;
    _ctx.fillRect(x, y, w, h);
  }
}
