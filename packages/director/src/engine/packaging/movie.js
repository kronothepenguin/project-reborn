class MovieBuilder {
  casts(...casts) {
    return this;
  }

  build() {
    return {};
  }
}

function createMovie(name) {
  return new MovieBuilder();
}
