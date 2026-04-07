import { _movie, _player } from "./core";

export function castLib(castNameOrNum) {
  return _movie.castLib[castNameOrNum];
}

export function puppetTempo(intTempo) {
  _player._tempo = intTempo;
}
