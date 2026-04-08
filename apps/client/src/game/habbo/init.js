import { go, netDone, the } from "../../director";

export default function () {
  return {
    exitFrame() {
      if (netDone()) {
        _director.initCore();
      } else {
        go(the.frame);
      }
    },
  };
}
