import { Point, point } from "../types/point.js";
import { Rect, rect } from "../types/rect.js";

export class SpriteObject {
  #num;
  #member = null;
  #memberNum = 0;
  #castLibNum = 0;
  #locH = 0;
  #locV = 0;
  #locZ = 0;
  #ink = 0;
  #blend = 100;
  #visible = true;
  #foreColor = 0;
  #backColor = 0;
  #name = "";
  #currentTime = 0;
  #volume = 256;
  #tracks = [];
  #width = 0;
  #height = 0;
  #top = 0;
  #left = 0;
  #right = 0;
  #bottom = 0;
  #constraint = 0;
  #cursor = 0;
  #editable = false;
  #endFrame = 0;
  #flipH = false;
  #flipV = false;
  #quad = 0;
  #rotation = 0;
  #skew = 0;
  #spriteNum = 0;
  #startFrame = 0;

  constructor(num) {
    this.#num = num;
    this.#spriteNum = Number(num);
  }

  get num() {
    return this.#num;
  }

  set num(_value) {
    throw new Error("num is read-only");
  }

  get member() {
    return this.#member;
  }

  set member(value) {
    this.#member = value;
  }

  get memberNum() {
    return this.#memberNum;
  }

  set memberNum(value) {
    this.#memberNum = Number(value);
  }

  get castLib() {
    return this.#castLibNum;
  }

  set castLib(value) {
    this.#castLibNum = Number(value);
  }

  get locH() {
    return this.#left;
  }

  set locH(value) {
    this.#left = Number(value);
    this.#locH = this.#left;
    this.#right = this.#left + this.#width;
  }

  get locV() {
    return this.#top;
  }

  set locV(value) {
    this.#top = Number(value);
    this.#locV = this.#top;
    this.#bottom = this.#top + this.#height;
  }

  get loc() {
    return point(this.#left, this.#top);
  }

  set loc(value) {
    if (value instanceof Point) {
      this.#left = value.locH;
      this.#top = value.locV;
      this.#locH = this.#left;
      this.#locV = this.#top;
      this.#right = this.#left + this.#width;
      this.#bottom = this.#top + this.#height;
    }
  }

  get left() {
    return this.#left;
  }

  set left(value) {
    this.#left = Number(value);
    this.#locH = this.#left;
    this.#right = this.#left + this.#width;
  }

  get top() {
    return this.#top;
  }

  set top(value) {
    this.#top = Number(value);
    this.#locV = this.#top;
    this.#bottom = this.#top + this.#height;
  }

  get right() {
    return this.#right;
  }

  set right(value) {
    this.#right = Number(value);
    this.#width = this.#right - this.#left;
  }

  get bottom() {
    return this.#bottom;
  }

  set bottom(value) {
    this.#bottom = Number(value);
    this.#height = this.#bottom - this.#top;
  }

  get width() {
    return this.#width;
  }

  set width(value) {
    this.#width = Number(value);
    this.#right = this.#left + this.#width;
  }

  get height() {
    return this.#height;
  }

  set height(value) {
    this.#height = Number(value);
    this.#bottom = this.#top + this.#height;
  }

  get locZ() {
    return this.#locZ;
  }

  set locZ(value) {
    this.#locZ = Number(value);
  }

  get ink() {
    return this.#ink;
  }

  set ink(value) {
    this.#ink = Number(value);
  }

  get blend() {
    return this.#blend;
  }

  set blend(value) {
    this.#blend = Number(value);
  }

  get visible() {
    return this.#visible;
  }

  set visible(value) {
    this.#visible = Boolean(value);
  }

  get foreColor() {
    return this.#foreColor;
  }

  set foreColor(value) {
    this.#foreColor = Number(value);
  }

  get backColor() {
    return this.#backColor;
  }

  set backColor(value) {
    this.#backColor = Number(value);
  }

  get rect() {
    return rect(this.#left, this.#top, this.#right, this.#bottom);
  }

  set rect(value) {
    if (value instanceof Rect) {
      this.#left = value.left;
      this.#top = value.top;
      this.#right = value.right;
      this.#bottom = value.bottom;
      this.#locH = this.#left;
      this.#locV = this.#top;
      this.#width = this.#right - this.#left;
      this.#height = this.#bottom - this.#top;
    }
  }

  get constraint() {
    return this.#constraint;
  }

  set constraint(value) {
    this.#constraint = Number(value);
  }

  get cursor() {
    return this.#cursor;
  }

  set cursor(value) {
    this.#cursor = Number(value);
  }

  get editable() {
    return this.#editable;
  }

  set editable(value) {
    this.#editable = Boolean(value);
  }

  get endFrame() {
    return this.#endFrame;
  }

  set endFrame(value) {
    this.#endFrame = Number(value);
  }

  get flipH() {
    return this.#flipH;
  }

  set flipH(value) {
    this.#flipH = Boolean(value);
  }

  get flipV() {
    return this.#flipV;
  }

  set flipV(value) {
    this.#flipV = Boolean(value);
  }

  get quad() {
    return this.#quad;
  }

  set quad(value) {
    this.#quad = Number(value);
  }

  get rotation() {
    return this.#rotation;
  }

  set rotation(value) {
    this.#rotation = Number(value);
  }

  get skew() {
    return this.#skew;
  }

  set skew(value) {
    this.#skew = Number(value);
  }

  get spriteNum() {
    return this.#spriteNum;
  }

  set spriteNum(_value) {
    throw new Error("spriteNum is read-only");
  }

  get startFrame() {
    return this.#startFrame;
  }

  set startFrame(value) {
    this.#startFrame = Number(value);
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = String(value);
  }

  get currentTime() {
    return this.#currentTime;
  }

  set currentTime(value) {
    this.#currentTime = Number(value);
  }

  get volume() {
    return this.#volume;
  }

  set volume(value) {
    this.#volume = Number(value);
  }

  trackCount() {
    return this.#tracks.length;
  }

  trackStartTime(whichTrack) {
    const track = this.#tracks[whichTrack - 1];
    return track?.startTime ?? 0;
  }

  trackStopTime(whichTrack) {
    const track = this.#tracks[whichTrack - 1];
    return track?.stopTime ?? 0;
  }

  trackType(whichTrack) {
    const track = this.#tracks[whichTrack - 1];
    return track?.type ?? null;
  }

  callFrame(flashFrameNameOrNum) {
    this.#currentTime = Number(flashFrameNameOrNum) || 0;
  }

  goToFrame(frameNameOrNum) {
    this.#currentTime = Number(frameNameOrNum) || 0;
  }

  hitTest(_point) {
    return "background";
  }

  flashToStage(point) {
    return point;
  }

  _setTracks(tracks) {
    this.#tracks = Array.isArray(tracks) ? tracks : [];
  }
}
