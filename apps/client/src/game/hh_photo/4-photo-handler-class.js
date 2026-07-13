export default class {
  construct() {
    registerListener(getVariable("connection.info.id"), this.getID(), propList(4, Symbol.for("handle_film")));
    getMultiuserManager().registerListener(getVariable("connection.mus.id"), this.getID(), propList("OK", Symbol.for("handle_ok"), "FILM", Symbol.for("handle_film_mus")));
    return 1;
  }

  deconstruct() {
    unregisterListener(getVariable("connection.info.id"), this.getID(), propList(4, Symbol.for("handle_film")));
    getMultiuserManager().unregisterListener(getVariable("connection.mus.id"), this.getID(), propList("OK", Symbol.for("handle_ok"), "FILM", Symbol.for("handle_film_mus")));
    return 1;
  }

  handle_ok() {
  }

  handle_film(tMsg) {
    let tFilmCnt = tMsg.getaProp(Symbol.for("connection")).GetIntFrom(tMsg);
    this.getComponent().setFilm(tFilmCnt);
    getObject(Symbol.for("session")).set("user_photo_film", tFilmCnt);
    executeMessage(Symbol.for("updateFilmCount"));
    return 1;
  }

  handle_film_mus(tMsg) {
    this.getComponent().setFilm(integer(tMsg.getaProp(Symbol.for("content"))));
    getObject(Symbol.for("session")).set("user_photo_film", integer(tMsg.getaProp(Symbol.for("content"))));
    executeMessage(Symbol.for("updateFilmCount"));
    return 1;
  }
}
