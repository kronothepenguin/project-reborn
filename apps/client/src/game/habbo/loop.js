import { go, the } from "../../director";

export default function () {
  return {
    exitFrame() {
      go(the.frame);
    },
  };
}
