import { Point, point } from "./point.js";
import { Rect, rect } from "./rect.js";

export class MemberRef {
  #type;
  #name;
  #number = 0;
  #castLibNum = 0;
  #height = 0;
  #width = 0;
  #rect;
  #regPoint;
  #ink = 0;
  #text = "";
  #font = "";
  #fontSize = 0;
  #duration = 0;
  #loop = false;
  #volume = 255;
  #sound = true;
  #scale = 1.0;
  #percentStreamed = 0;
  #preLoad = false;
  #tracks = [];
  #fileName = "";
  #picture = null;

  constructor(type, name = "") {
    this.#type = type;
    this.#name = name;
    this.#rect = rect(0, 0, 0, 0);
    this.#regPoint = point(0, 0);
  }

  get type() {
    return this.#type;
  }

  set type(_value) {
    throw new Error("type is read-only");
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = String(value);
  }

  get number() {
    return this.#number;
  }

  set number(_value) {
    throw new Error("number is read-only");
  }

  get castLibNum() {
    return this.#castLibNum;
  }

  set castLibNum(_value) {
    throw new Error("castLibNum is read-only");
  }

  get height() {
    return this.#height;
  }

  set height(_value) {
    throw new Error("height is read-only");
  }

  get width() {
    return this.#width;
  }

  set width(_value) {
    throw new Error("width is read-only");
  }

  get rect() {
    return this.#rect;
  }

  set rect(value) {
    if (value instanceof Rect) {
      this.#rect = value;
    }
  }

  get regPoint() {
    return this.#regPoint;
  }

  set regPoint(value) {
    if (value instanceof Point) {
      this.#regPoint = value;
    }
  }

  get ink() {
    return this.#ink;
  }

  set ink(value) {
    this.#ink = Number(value);
  }

  get text() {
    return this.#text;
  }

  set text(value) {
    this.#text = String(value);
  }

  get font() {
    return this.#font;
  }

  set font(value) {
    this.#font = String(value);
  }

  get fontSize() {
    return this.#fontSize;
  }

  set fontSize(value) {
    this.#fontSize = Number(value);
  }

  get duration() {
    return this.#duration;
  }

  set duration(value) {
    this.#duration = Number(value);
  }

  get loop() {
    return this.#loop;
  }

  set loop(value) {
    this.#loop = Boolean(value);
  }

  get volume() {
    return this.#volume;
  }

  set volume(value) {
    this.#volume = Number(value);
  }

  get sound() {
    return this.#sound;
  }

  set sound(value) {
    this.#sound = Boolean(value);
  }

  get scale() {
    return this.#scale;
  }

  set scale(value) {
    this.#scale = Number(value);
  }

  get percentStreamed() {
    return this.#percentStreamed;
  }

  set percentStreamed(_value) {
    throw new Error("percentStreamed is read-only");
  }

  get preLoad() {
    return this.#preLoad;
  }

  set preLoad(value) {
    this.#preLoad = Boolean(value);
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

  get fileName() {
    return this.#fileName;
  }

  set fileName(value) {
    this.#fileName = String(value);
  }

  get picture() {
    return this.#picture;
  }

  set picture(value) {
    this.#picture = value;
  }

  _setNumber(value) {
    this.#number = value;
  }

  _setCastLibNum(value) {
    this.#castLibNum = value;
  }

  _setHeight(value) {
    this.#height = value;
  }

  _setWidth(value) {
    this.#width = value;
  }

  _setPercentStreamed(value) {
    this.#percentStreamed = value;
  }

  _setTracks(tracks) {
    this.#tracks = Array.isArray(tracks) ? tracks : [];
  }
}
