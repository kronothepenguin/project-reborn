import { castLib, on, puppetTempo } from "../../director";

function prepareMovie() {
  castLib(2).preLoadMode = 1;

  puppetTempo(15);
}

function stopMovie() {}

on("prepareMovie", prepareMovie);
on("stopMovie", stopMovie);
