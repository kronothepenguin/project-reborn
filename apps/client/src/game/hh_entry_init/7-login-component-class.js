export default class {
  pOkToLogin;
  pLatencyTestID;
  pLatencyValueList;
  pLatencyTestTimeStampList;
  pLatencyTotalValue;
  pLatencyValueCount;
  pLatencyClearedValue;
  pLatencyClearedCount;
  pLatencyReportIndex;
  pLatencyReported;
  pLatencyReportDelta;
  pLatencyTestInterval;
  pLatencyTestTimeoutID;
  pDisconnectErrorState;

  construct() {
    this.pOkToLogin = 0;
    this.pLatencyTestID = 1;
    this.pLatencyValueList = list();
    this.pLatencyTestTimeStampList = propList();
    this.pLatencyTotalValue = 0;
    this.pLatencyValueCount = 0;
    this.pLatencyClearedValue = 0;
    this.pLatencyClearedCount = 0;
    this.pLatencyTestTimeoutID = "latency.test.timeout";
    this.pLatencyTestInterval = 0;
    this.pLatencyReportIndex = 0;
    this.pLatencyReportDelta = 0;

    if (variableExists("latencytest.interval")) {
      this.pLatencyTestInterval = getVariable("latencytest.interval");
    }
    if (variableExists("latencytest.report.index")) {
      this.pLatencyReportIndex = getVariable("latencytest.report.index");
    }
    if (variableExists("latencytest.report.delta")) {
      this.pLatencyReportDelta = getVariable("latencytest.report.delta");
    }

    this.pLatencyReported = 0;

    if (variableExists("stats.tracking.javascript")) {
      createObject(Symbol.for("statsBrokerJs"), "Statistics Broker Javascript Class");
    }
    if (variableExists("stats.tracking.url")) {
      createObject(Symbol.for("statsBroker"), "Statistics Broker Class");
    }
    if (!objectExists(Symbol.for("dateFormatter"))) {
      createObject(Symbol.for("dateFormatter"), list("Date Class"));
    }

    if (!objectExists("Figure_System")) {
      if (createObject("Figure_System", list("Figure System Class")) != 0) {
        let tURL = getVariable("external.figurepartlist.txt");
        getObject("Figure_System").define(propList("type", "url", "source", tURL));
      }
    }

    if (!objectExists("Figure_Preview")) {
      createObject("Figure_Preview", list("Figure Preview Class"));
    }

    getObject(Symbol.for("session")).set("user_rights", list());
    registerMessage(Symbol.for("Initialize"), this.getID(), Symbol.for("initA"));

    if (!objectExists("Help_Tooltip_Manager")) {
      createObject("Help_Tooltip_Manager", "Help Tooltip Manager Class");
    }
    if (!objectExists("Ticket_Window_Manager")) {
      createObject("Ticket_Window_Manager", "Ticket Window Manager Class");
    }
    if (!objectExists("Oneclick_Buy_Window_Manager")) {
      createObject("Oneclick_Buy_Window_Manager", "Game Oneclick Buy Window Manager Class");
    }
    this.pDisconnectErrorState = "socket_init";
    registerMessage(Symbol.for("openConnection"), this.getID(), Symbol.for("openConnection"));
    registerMessage(Symbol.for("closeConnection"), this.getID(), Symbol.for("disconnect"));
    registerMessage(Symbol.for("performLogin"), this.getID(), Symbol.for("sendLogin"));
    registerMessage(Symbol.for("loginIsOk"), this.getID(), Symbol.for("setLoginOk"));
    return 1;
  }

  deconstruct() {
    this.pOkToLogin = 0;
    if (objectExists("Figure_System")) {
      removeObject("Figure_System");
    }
    if (objectExists("Figure_Preview")) {
      removeObject("Figure_Preview");
    }
    if (objectExists("nav_problem_obj")) {
      removeObject("nav_problem_obj");
    }
    if (objectExists(Symbol.for("statsBroker"))) {
      removeObject(Symbol.for("statsBroker"));
    }
    if (objectExists(Symbol.for("statsBrokerJs"))) {
      removeObject(Symbol.for("statsBrokerJs"));
    }
    if (objectExists(Symbol.for("getServerDate"))) {
      removeObject(Symbol.for("getServerDate"));
    }
    if (objectExists("Help_Tooltip_Manager")) {
      removeObject("Help_Tooltip_Manager");
    }
    unregisterMessage(Symbol.for("openConnection"), this.getID());
    unregisterMessage(Symbol.for("closeConnection"), this.getID());
    if (connectionExists(getVariable("connection.info.id", Symbol.for("Info")))) {
      return this.disconnect();
    } else {
      return 1;
    }
  }

  initA() {
    if (getIntVariable("figurepartlist.loaded", 1) == 0) {
      return this.delay(250, Symbol.for("initA"));
    }
    return this.delay(1000, Symbol.for("initB"));
  }

  initB() {
    let tUseSSO = 0;
    if (variableExists("use.sso.ticket")) {
      tUseSSO = getVariable("use.sso.ticket");
      if (variableExists("sso.ticket") && tUseSSO) {
        let tSsoTicket = string(getVariable("sso.ticket"));
        if (tSsoTicket.length > 1) {
          getObject(Symbol.for("session")).set(Symbol.for("SSO_ticket"), tSsoTicket);
          return this.openConnection();
        }
      }
    }
    if (tUseSSO == 0) {
      return this.getInterface().showLogin();
    } else {
      executeMessage(Symbol.for("alert"), propList("Msg", "Alert_generic_login_error"));
    }
  }

  sendLogin(tConnection) {
    this.SetDisconnectErrorState("login");
    if (voidp(tConnection)) {
      tConnection = getConnection(getVariable("connection.info.id"));
    }
    if (objectExists("nav_problem_obj")) {
      removeObject("nav_problem_obj");
    }
    if (this.getComponent().isOkToLogin()) {
      let tSsoTicket = 0;
      if (getObject(Symbol.for("session")).exists("SSO_ticket")) {
        tSsoTicket = getObject(Symbol.for("session")).GET("SSO_ticket");
      }
      if (tSsoTicket != 0) {
        sendProcessTracking(15);
        return tConnection.send("SSO", propList("string", tSsoTicket));
      } else {
        let tUserName = getObject(Symbol.for("session")).GET(Symbol.for("userName"));
        let tPassword = getObject(Symbol.for("session")).GET(Symbol.for("Password"));
        if (!stringp(tUserName) || !stringp(tPassword)) {
          return removeConnection(tConnection.getID());
        }
        if ((tUserName == EMPTY) || (tPassword == EMPTY)) {
          return removeConnection(tConnection.getID());
        }
        return tConnection.send("TRY_LOGIN", propList("string", tUserName, "string", tPassword));
      }
    }
    return 1;
  }

  openConnection() {
    this.setaProp(Symbol.for("pOkToLogin"), 1);
    this.connect();
  }

  connect() {
    let tHost = getVariable("connection.info.host");
    let tPort = getIntVariable("connection.info.port");
    let tConn = getVariable("connection.info.id", Symbol.for("Info"));
    if (voidp(tHost) || voidp(tPort)) {
      return error(this, "Server port/host data not found!", Symbol.for("connect"), Symbol.for("major"));
    }
    if (!createConnection(tConn, tHost, tPort)) {
      return error(this, "Failed to create connection!", Symbol.for("connect"), Symbol.for("major"));
    }
    if (!objectExists(Symbol.for("getServerDate"))) {
      createObject(Symbol.for("getServerDate"), "Server Date Class");
    }
    if (!objectExists("nav_problem_obj")) {
      createObject("nav_problem_obj", "Connection Problem Class");
    }
    if (!threadExists(Symbol.for("hobba"))) {
      initThread("thread.hobba");
    }
    return 1;
  }

  disconnect() {
    let tConn = getVariable("connection.info.id", Symbol.for("Info"));
    if (connectionExists(tConn)) {
      return removeConnection(tConn);
    } else {
      return error(this, "Connection not found!", Symbol.for("disconnect"), Symbol.for("minor"));
    }
  }

  setAllowLogin() {
    this.pOkToLogin = 1;
  }

  isOkToLogin() {
    return this.pOkToLogin;
  }

  initLatencyTest() {
    if (this.pLatencyTestInterval <= 0) {
      return 0;
    }
    if (!timeoutExists(this.pLatencyTestTimeoutID)) {
      createTimeout(this.pLatencyTestTimeoutID, this.pLatencyTestInterval, Symbol.for("sendLatencyTest"), this.getID(), VOID, 0);
    }
    return 1;
  }

  sendLatencyTest() {
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    let tConnection = getConnection(getVariable("connection.info.id"));
    if (tConnection.send("TEST_LATENCY", propList("integer", this.pLatencyTestID))) {
      this.pLatencyTestTimeStampList.addProp(string(this.pLatencyTestID), the.milliSeconds);
      this.pLatencyTestID = this.pLatencyTestID + 1;
      return 1;
    }
    return 0;
  }

  sendGetBadges() {
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    let tConnection = getConnection(getVariable("connection.info.id"));
    return tConnection.send("GETSELECTEDBADGES");
  }

  handleLatencyTest(tID) {
    if (voidp(this.pLatencyTestTimeStampList[string(tID)])) {
      return 0;
    }
    if (!connectionExists(getVariable("connection.info.id"))) {
      return 0;
    }
    let tConnection = getConnection(getVariable("connection.info.id"));
    let tDelta = the.milliSeconds - this.pLatencyTestTimeStampList[string(tID)];
    this.pLatencyTestTimeStampList.deleteProp(string(tID));
    this.pLatencyValueList.add(tDelta);
    this.pLatencyValueCount = this.pLatencyValueCount + 1;
    if ((this.pLatencyValueList.count == this.pLatencyReportIndex) && (this.pLatencyReportIndex > 0)) {
      for (let i = 1; i <= this.pLatencyValueList.count; i++) {
        this.pLatencyTotalValue = this.pLatencyTotalValue + this.pLatencyValueList[i];
      }
      let tLatency = this.pLatencyTotalValue / this.pLatencyValueCount;
      for (let i = 1; i <= this.pLatencyValueList.count; i++) {
        if (this.pLatencyValueList[i] < (tLatency * 2)) {
          this.pLatencyClearedValue = this.pLatencyClearedValue + this.pLatencyValueList[i];
          this.pLatencyClearedCount = this.pLatencyClearedCount + 1;
        }
      }
      let tLatencyCleared = this.pLatencyClearedValue / this.pLatencyClearedCount;
      if ((abs(tLatency - this.pLatencyReported) > this.pLatencyReportDelta) || (this.pLatencyReported == 0)) {
        this.pLatencyReported = tLatency;
        tConnection.send("REPORT_LATENCY", propList("integer", tLatency, "integer", tLatencyCleared, "integer", this.pLatencyValueCount));
      }
      this.pLatencyValueList = list();
    }
    return 1;
  }

  SetDisconnectErrorState(tError) {
    this.pDisconnectErrorState = tError;
  }

  GetDisconnectErrorState() {
    return this.pDisconnectErrorState;
  }
}
