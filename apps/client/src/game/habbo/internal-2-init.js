export default class {
  exitFrame() {
    if (netDone()) {
      initCore();
    } else {
      go(the.frame);
    }
  }
}
