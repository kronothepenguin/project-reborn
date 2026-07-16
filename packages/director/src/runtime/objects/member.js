import { Point, point } from "../types/point.js";
import { Rect, rect } from "../types/rect.js";

export class MemberObject {
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
  #tracks = [];
  #fileName = "";
  #picture = null;
  #comments = "";
  #creationDate = "";
  #hilite = false;
  #linked = false;
  #loaded = false;
  #media = null;
  #mediaReady = false;
  #modified = false;
  #modifiedBy = "";
  #modifiedDate = "";
  #purgePriority = 0;
  #scriptText = "";
  #size = 0;
  #thumbNail = null;

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

  get comments() {
    return this.#comments;
  }

  set comments(value) {
    this.#comments = String(value ?? "");
  }

  get creationDate() {
    return this.#creationDate;
  }

  set creationDate(_value) {
    throw new Error("creationDate is read-only");
  }

  get hilite() {
    return this.#hilite;
  }

  set hilite(value) {
    this.#hilite = Boolean(value);
  }

  get linked() {
    return this.#linked;
  }

  set linked(_value) {
    throw new Error("linked is read-only");
  }

  get loaded() {
    return this.#loaded;
  }

  set loaded(value) {
    this.#loaded = Boolean(value);
  }

  get media() {
    return this.#media;
  }

  set media(value) {
    this.#media = value ?? null;
  }

  get mediaReady() {
    return this.#mediaReady;
  }

  set mediaReady(value) {
    this.#mediaReady = Boolean(value);
  }

  get modified() {
    return this.#modified;
  }

  set modified(value) {
    this.#modified = Boolean(value);
  }

  get modifiedBy() {
    return this.#modifiedBy;
  }

  set modifiedBy(value) {
    this.#modifiedBy = String(value ?? "");
  }

  get modifiedDate() {
    return this.#modifiedDate;
  }

  set modifiedDate(value) {
    this.#modifiedDate = String(value ?? "");
  }

  get purgePriority() {
    return this.#purgePriority;
  }

  set purgePriority(value) {
    this.#purgePriority = Number(value);
  }

  get scriptText() {
    return this.#scriptText;
  }

  set scriptText(value) {
    this.#scriptText = String(value ?? "");
  }

  get size() {
    return this.#size;
  }

  set size(value) {
    this.#size = Number(value);
  }

  get thumbNail() {
    return this.#thumbNail;
  }

  set thumbNail(value) {
    this.#thumbNail = value ?? null;
  }

  copyToClipBoard() {
    return this;
  }

  duplicate() {
    return this;
  }

  erase() {
    return true;
  }

  importFileInto() {
    return true;
  }

  move(_destination) {
    return true;
  }

  pasteClipBoardInto() {
    return true;
  }

  preLoad() {
    this.#loaded = true;
  }

  unLoad() {
    this.#loaded = false;
    return true;
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

  _setCreationDate(value) {
    this.#creationDate = value;
  }
}
