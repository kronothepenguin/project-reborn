export default class {
  getLevelHighscore() {
    const tScoreData = this.getProperty(Symbol.for("top_level_scores"));
    if (listp(tScoreData)) {
      return tScoreData;
    }
    this.requestHallOfFame();
    return 0;
  }

  getLevelTeamHighscore() {
    const tScoreData = this.getProperty(Symbol.for("level_team_scores"));
    if (listp(tScoreData)) {
      return tScoreData;
    }
    this.requestHallOfFame();
    return 0;
  }

  requestHallOfFame() {
    if (this.getProperty(Symbol.for("score_data_pending"))) {
      return 0;
    }
    this.setProperty(Symbol.for("score_data_pending"), 1);
    const tService = this.getOwnerIGComponent();
    if (tService == 0) {
      return 0;
    }
    return tService.getHandler().send_GET_LEVEL_HALL_OF_FAME(this.getProperty(Symbol.for("id")));
  }
}
