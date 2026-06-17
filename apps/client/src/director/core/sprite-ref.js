import { Point, point } from "./point.js";
import { Rect, rect } from "./rect.js";

export class SpriteRef {
  #num;
  #member = null;
  #memberNum = 0;
  #castLibNum = 0;
  #locH = 0;
  #locV = 0;
  #ink = 0;
  #blend = 100;
  #visible = true;
  #foreColor = 0;
  #backColor = 0;
  #name = "";
  #currentTime = 0;
  #volume = 256;
  #tracks = [];

  constructor(num) {
    this.#num = num;
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
    return this.#locH;
  }

  set locH(value) {
    this.#locH = Number(value);
  }

  get locV() {
    return this.#locV;
  }

  set locV(value) {
    this.#locV = Number(value);
  }

  get loc() {
    return point(this.#locH, this.#locV);
  }

  set loc(value) {
    if (value instanceof Point) {
      this.#locH = value.locH;
      this.#locV = value.locV;
    }
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
    const w = this.#member?.width ?? 0;
    const h = this.#member?.height ?? 0;
    return rect(this.#locH, this.#locV, this.#locH + w, this.#locV + h);
  }

  set rect(value) {
    if (value instanceof Rect) {
      this.#locH = value.left;
      this.#locV = value.top;
    }
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

  _setTracks(tracks) {
    this.#tracks = Array.isArray(tracks) ? tracks : [];
  }
}
