class CastBuilder {
  members(...members) {
    return this;
  }

  build() {
    return {};
  }
}

function createCast(name) {
  return new CastBuilder();
}
