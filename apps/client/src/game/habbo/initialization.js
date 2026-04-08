import { castLib, puppetTempo } from "../../director";

export default function () {
  return {
    prepareMovie() {
      // the debugPlaybackEnabled = 0
      castLib(2).preLoadMode = 1;
      // preloadNetThing(castLib(2).fileName)
      // moveToFront(the stage)
      // set the exitLock to 1
      puppetTempo(15);
    },

    stopMovie() {},
  };
}
