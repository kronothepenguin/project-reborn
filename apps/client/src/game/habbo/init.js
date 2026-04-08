import { on, go, theFrame, netDone } from "../../director";

function exitFrame() {
  if (netDone()) {
    _global.initCore();
  } else {
    go(theFrame());
  }
}

on("exitFrame", exitFrame);
