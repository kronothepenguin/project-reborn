export default class {
  getInfo() {
    return this.pInfoStruct;
  }

  action_taked() {
    this.pCarrying = 1;
    this.definePartListAction(this.pPartListSubSet["handRight"], "crr");
  }

  action_gived() {
    this.pCarrying = 1;
    this.definePartListAction(this.pPartListSubSet["handRight"], "crr");
  }

  getClass() {
    return "bot";
  }
}
