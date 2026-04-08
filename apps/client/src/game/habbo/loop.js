import { on, go, theFrame } from "../../director";

function exitFrame() {
  go(theFrame());
}

on("exitFrame", exitFrame);
