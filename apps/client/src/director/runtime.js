import { _movie, _player } from "./core";

export function castLib(castNameOrNum) {
  return _movie.castLib[castNameOrNum];
}

export function puppetTempo(intTempo) {
  _player._tempo = intTempo;
}

export function go(frameNum) {
  // TODO: needs _currentFrame in core.js — ask user
}

export function theFrame() {
  // TODO: needs _currentFrame in core.js — ask user
  return 1;
}

export function netDone() {
  // TODO: implement when netLingo is translated
  return true;
}
