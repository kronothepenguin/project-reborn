export default class {
  render() {
    return this.ancestor.render(Symbol.for("change"));
  }
}
