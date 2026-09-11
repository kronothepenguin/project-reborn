export default class {
  pBottomBarId;
  pFloodblocking;
  pFloodTimer;
  pMessengerFlash;
  pFloodEnterCount;
  pTextIsHelpTExt;
  pBouncerID;
  pIMFlashTimeoutID;
  pIMFlashState;
  pPopupControllerID;
  pTypingTimeoutName;
  pDisableRoomevents;
  pSignImg;
  pSignState;
  pOldPosH;
  pOldPosV;

  construct() {
    this.pBottomBarId = "RoomBarID";
    this.pFloodblocking = 0;
    this.pMessengerFlash = 0;
    this.pFloodTimer = 0;
    this.pFloodEnterCount = 0;
    this.pTextIsHelpTExt = 0;
    this.pBouncerID = Symbol.for("roombar_messenger_icon_bouncer");
    this.pIMFlashTimeoutID = Symbol.for("im_icon_flash_timeout");
    this.pPopupControllerID = Symbol.for("roombar_popup_controller");
    this.pTypingTimeoutName = "typing_state_timeout";
    this.pDisableRoomevents = 0;
    if (variableExists("disable.roomevents")) {
      this.pDisableRoomevents = getIntVariable("disable.roomevents");
    }
    registerMessage(Symbol.for("notify"), this.getID(), Symbol.for("notify"));
    registerMessage(Symbol.for("updateMessageCount"), this.getID(), Symbol.for("updateMessageCount"));
    registerMessage(Symbol.for("updateFriendListIcon"), this.getID(), Symbol.for("updateFriendListIcon"));
    registerMessage(Symbol.for("soundSettingChanged"), this.getID(), Symbol.for("updateSoundButton"));
    registerMessage(Symbol.for("IMStateChanged"), this.getID(), Symbol.for("updateIMIcon"));
    registerMessage(Symbol.for("setRollOverInfo"), this.getID(), Symbol.for("setRollOverInfo"));
    return 1;
  }

  deconstruct() {
    if (timeoutExists(this.pTypingTimeoutName)) {
      removeTimeout(this.pTypingTimeoutName);
    }
    getThread(Symbol.for("room")).getComponent().removeIconBarManager();
    unregisterMessage(Symbol.for("notify"), this.getID());
    unregisterMessage(Symbol.for("updateMessageCount"), this.getID());
    unregisterMessage(Symbol.for("updateFriendListIcon"), this.getID());
    unregisterMessage(Symbol.for("soundSettingChanged"), this.getID());
    unregisterMessage(Symbol.for("IMStateChanged"), this.getID());
    unregisterMessage(Symbol.for("setRollOverInfo"), this.getID());
    return 1;
  }

  showRoomBar(tLayout) {
    if (!windowExists(this.pBottomBarId)) {
      createWindow(this.pBottomBarId, "empty.window", 0, 487);
    }
    let tManager = getThread(Symbol.for("room")).getComponent().getIconBarManager();
    tManager.define(this.pBottomBarId);
    let tWndObj = getWindow(this.pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    tWndObj.lock(1);
    tWndObj.unmerge();
    if (!stringp(tLayout)) {
      if (getThread(Symbol.for("room")).getComponent().getSpectatorMode()) {
        tLayout = "room_bar_spectator.window";
      } else {
        tLayout = "room_bar.window";
      }
    }
    if (!tWndObj.merge(tLayout)) {
      return 0;
    }
    if (this.pDisableRoomevents) {
      let tEventsIcon = tWndObj.getElement("int_event_image");
      tEventsIcon.setProperty(Symbol.for("member"), getMember("event_icon_disabled"));
    }
    this.updateIMIcon();
    tWndObj.registerClient(this.getID());
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseUp"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("keyDown"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseEnter"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseLeave"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseDown"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseWithin"));
    tWndObj.registerProcedure(Symbol.for("eventProcRoomBar"), this.getID(), Symbol.for("mouseUpOutSide"));
    this.updateSoundButton();
    return 1;
  }

  hideRoomBar() {
    if (timeoutExists(Symbol.for("flash_messenger_icon"))) {
      removeTimeout(Symbol.for("flash_messenger_icon"));
    }
    if (windowExists(this.pBottomBarId)) {
      removeWindow(this.pBottomBarId);
    }
    if (objectExists(this.pBouncerID)) {
      removeObject(this.pBouncerID);
    }
    let tManager = getThread(Symbol.for("room")).getComponent().getIconBarManager();
    tManager.hideExtensions();
  }

  applyChatHelpText() {
    if (!windowExists(this.pBottomBarId)) {
      return 0;
    }
    if (windowExists(this.pBottomBarId)) {
      let tWindowObj = getWindow(this.pBottomBarId);
      if (tWindowObj.elementExists("chat_field")) {
        let tChatElem = tWindowObj.getElement("chat_field");
        tChatElem.setText(getText("NUH_chat"));
        this.pTextIsHelpTExt = 1;
      }
    }
  }

  setSpeechDropdown(tMode) {
    if (windowExists(this.pBottomBarId)) {
      let tWndObj = getWindow(this.pBottomBarId);
      if (tWndObj == 0) {
        return 1;
      }
      let tElem = tWndObj.getElement("int_speechmode_dropmenu");
      if (tElem == 0) {
        return 1;
      }
      tElem.setSelection(tMode, 1);
      return 1;
    }
  }

  setRollOverInfo(tInfo) {
    let tWndObj = getWindow(this.pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    if (tWndObj.elementExists("room_tooltip_text")) {
      tWndObj.getElement("room_tooltip_text").setText(tInfo);
    }
  }

  updateMessageCount(tCount) {
    if (tCount > 0) {
      this.updateFriendListIcon(1);
    } else {
      this.updateFriendListIcon(0);
    }
  }

  updateFriendListIcon(tActive) {
    let tWndObj = getWindow(this.pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    let tIconElem = tWndObj.getElement("friend_list_icon");
    if (!tIconElem) {
      return 0;
    }
    if (tActive) {
      tIconElem.setProperty(Symbol.for("member"), "friend_list_icon_notification");
    } else {
      tIconElem.setProperty(Symbol.for("member"), "friend_list_icon");
    }
  }

  bounceIMIcon(tstate) {
    if (variableExists("bounce.messenger.icon")) {
      if (!getVariable("bounce.messenger.icon")) {
        return 0;
      }
    }
    if (!objectExists(this.pBouncerID)) {
      createObject(this.pBouncerID, "Element Bouncer Class");
    }
    let tBouncer = getObject(this.pBouncerID);
    if (tstate == tBouncer.getState()) {
      return 1;
    }
    if (tstate) {
      tBouncer.registerElement(this.pBottomBarId, list("im_icon"));
      tBouncer.setBounce(1);
    } else {
      tBouncer.setBounce(0);
    }
  }

  updateSoundButton() {
    let tWndObj = getWindow(this.pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    let tstate = getSoundState();
    let tElem = tWndObj.getElement("int_sound_image");
    if (tElem != 0) {
      if (tstate) {
        let tMemNum = getmemnum("sounds_small_on_icon");
        if (tMemNum > 0) {
          tElem.feedImage(member(tMemNum).image);
        }
      } else {
        let tMemNum = getmemnum("sounds_small_off_icon");
        if (tMemNum > 0) {
          tElem.feedImage(member(tMemNum).image);
        }
      }
    }
  }

  setTypingState(tstate) {
    let tTimeoutTime = 2000;
    if (tstate == 0) {
      if (timeoutExists(this.pTypingTimeoutName)) {
        removeTimeout(this.pTypingTimeoutName);
      } else {
        this.sendTypingState(0);
      }
    } else {
      if (timeoutExists(this.pTypingTimeoutName)) {
        removeTimeout(this.pTypingTimeoutName);
      }
      createTimeout(this.pTypingTimeoutName, tTimeoutTime, Symbol.for("sendTypingState"), this.getID(), 1, 1);
    }
  }

  sendTypingState(tstate) {
    let tConn = getConnection(Symbol.for("Info"));
    if (tstate == 1) {
      tConn.send("USER_START_TYPING");
    } else {
      tConn.send("USER_CANCEL_TYPING");
    }
  }

  showVote() {
    let tWndObj = getWindow(this.pBottomBarId);
    if (tWndObj == 0) {
      return 0;
    }
    let tWidthLong = tWndObj.getElement("chat_field_bg_long").getProperty(Symbol.for("width"));
    let tWidthShort = tWndObj.getElement("chat_field_bg_short").getProperty(Symbol.for("width"));
    tWndObj.getElement("chat_field").resizeBy(tWidthShort - tWidthLong, 0, 1);
    tWndObj.getElement("chat_field_bg_long").hide();
    if (tWndObj.elementExists("int_drop_vote")) {
      tWndObj.getElement("int_drop_vote").feedImage(member(getmemnum("pelle_kyltti1")).image);
      this.pSignState = VOID;
      this.pOldPosH = -1;
      this.pOldPosV = -1;
      this.pSignImg = image(member(getmemnum("pelle_kyltti2")).width, member(getmemnum("pelle_kyltti2")).height, 16);
    }
  }

  updateIMIcon() {
    if (!windowExists(this.pBottomBarId)) {
      return 0;
    }
    if (!threadExists("instant_messenger")) {
      return 0;
    }
    let tstate = getThread("instant_messenger").getInterface().getState();
    if (voidp(tstate)) {
      tstate = Symbol.for("inactive");
    }
    let tWnd = getWindow(this.pBottomBarId);
    let tElem = tWnd.getElement("im_icon");
    if (tElem == 0) {
      return 0;
    }
    let tmember;
    switch (tstate) {
      case Symbol.for("Active"):
        tmember = getMember("im.icon.active");
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
        this.bounceIMIcon(0);
        this.flashIMIcon(Symbol.for("stop"));
        break;
      case Symbol.for("highlighted"):
        tmember = getMember("im.icon.highlighted");
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
        this.bounceIMIcon(1);
        this.flashIMIcon(Symbol.for("start"));
        break;
      case Symbol.for("inactive"):
        tmember = getMember("im.icon.inactive");
        tElem.setProperty(Symbol.for("cursor"), 0);
        this.bounceIMIcon(0);
        this.flashIMIcon(Symbol.for("stop"));
        break;
      default:
        return 0;
    }
    tElem.setProperty(Symbol.for("member"), tmember);
    return 1;
  }

  flashIMIcon(tstate) {
    switch (tstate) {
      case Symbol.for("start"):
        if (timeoutExists(this.pIMFlashTimeoutID)) {
          removeTimeout(this.pIMFlashTimeoutID);
        }
        if (!timeoutExists(this.pIMFlashTimeoutID)) {
          createTimeout(this.pIMFlashTimeoutID, 500, Symbol.for("flashIMIcon"), this.getID(), Symbol.for("flash"), 0);
        }
        break;
      case Symbol.for("stop"):
        if (timeoutExists(this.pIMFlashTimeoutID)) {
          removeTimeout(this.pIMFlashTimeoutID);
        }
        break;
      case Symbol.for("flash"):
        let tWnd = getWindow(this.pBottomBarId);
        if (!tWnd) {
          return 0;
        }
        let tElem = tWnd.getElement("im_icon");
        if (!objectp(tElem)) {
          return 0;
        }
        if (this.pIMFlashState == 1) {
          tElem.setProperty(Symbol.for("member"), "im.icon.highlighted.2");
        } else {
          tElem.setProperty(Symbol.for("member"), "im.icon.highlighted");
        }
        this.pIMFlashState = !this.pIMFlashState;
        break;
    }
  }

  eventProcRoomBar(tEvent, tSprID, tParam) {
    if ((tSprID == "chat_field") && ((tEvent == Symbol.for("keyDown")) || (tEvent == Symbol.for("mouseUp")))) {
      if (this.pTextIsHelpTExt) {
        let tChatField = getWindow(this.pBottomBarId).getElement(tSprID);
        tChatField.setText(EMPTY);
        this.pTextIsHelpTExt = 0;
      }
    }
    if ((tEvent == Symbol.for("keyDown")) && (tSprID == "chat_field")) {
      let tChatField = getWindow(this.pBottomBarId).getElement(tSprID);
      if (the.commandDown && ((the.keyCode == 8) || (the.keyCode == 9))) {
        if (!getObject(Symbol.for("session")).GET("user_rights").getOne("fuse_debug_window")) {
          tChatField.setText(EMPTY);
          return 1;
        }
      }
      let tKeyCode = the.keyCode;
      switch (tKeyCode) {
        case 36:
        case 76:
          if (tChatField.getText() == EMPTY) {
            return 1;
          }
          if (this.pFloodblocking) {
            if (the.milliSeconds < this.pFloodTimer) {
              return 0;
            } else {
              this.pFloodEnterCount = VOID;
            }
          }
          if (voidp(this.pFloodEnterCount)) {
            this.pFloodEnterCount = 0;
            this.pFloodblocking = 0;
            this.pFloodTimer = the.milliSeconds;
          } else {
            this.pFloodEnterCount = this.pFloodEnterCount + 1;
            let tFloodCountLimit = 2;
            let tFloodTimerLimit = 3000;
            let tFloodTimeout = 30000;
            let tExternalFloodTimeout = "client.flood.timeout";
            if (variableExists(tExternalFloodTimeout)) {
              if (getVariable(tExternalFloodTimeout) > tFloodTimeout) {
                tFloodTimeout = getVariable(tExternalFloodTimeout);
              }
            }
            if (this.pFloodEnterCount > tFloodCountLimit) {
              if (the.milliSeconds < (this.pFloodTimer + tFloodTimerLimit)) {
                tChatField.setText(EMPTY);
                createObject("FloodBlocking", "Flood Blocking Class");
                getObject("FloodBlocking").Init(this.pBottomBarId, tSprID, tFloodTimeout);
                this.pFloodblocking = 1;
                this.pFloodTimer = the.milliSeconds + tFloodTimeout;
              } else {
                this.pFloodEnterCount = VOID;
              }
            }
          }
          getThread(Symbol.for("room")).getComponent().sendChat(tChatField.getText());
          executeMessage(Symbol.for("NUH_close"), "chat");
          if (timeoutExists(this.pTypingTimeoutName)) {
            removeTimeout(this.pTypingTimeoutName);
          }
          tChatField.setText(EMPTY);
          return 1;
        case 51:
          if (tChatField.getText().length == 1) {
            this.setTypingState(0);
          }
          break;
        case 117:
          if (tChatField.getText() != EMPTY) {
            this.setTypingState(0);
          }
          tChatField.setText(EMPTY);
          break;
        default:
          if (tChatField.getText().length == 0) {
            this.setTypingState(1);
          }
          break;
      }
      return 0;
    }
    if (getWindow(this.pBottomBarId).getElement(tSprID).getProperty(Symbol.for("blend")) == 100) {
      let tInfo;
      switch (tSprID) {
        case "int_help_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("openGeneralDialog"), Symbol.for("help"));
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_help", "interface_icon_help");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_hand_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("NUH_close"), "hand");
            getThread(Symbol.for("room")).getInterface().getContainer().openClose();
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_hand", "interface_icon_hand");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_brochure_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("show_hide_catalogue"));
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_catalog", "interface_icon_catalog");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_purse_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("openGeneralDialog"), Symbol.for("purse"));
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_purse", "interface_icon_purse");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_controller_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("NUH_close"), "games");
            executeMessage(Symbol.for("toggle_ig"));
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_ig");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_event_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("NUH_close"), "events");
            if (this.pDisableRoomevents) {
              return 1;
            }
            executeMessage(Symbol.for("show_hide_roomevents"));
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_events");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_nav_image":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("show_hide_navigator"));
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_navigator", "interface_icon_navigator");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "get_credit_text":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("openGeneralDialog"), Symbol.for("purse"));
          }
          break;
        case "int_speechmode_dropmenu":
          if (tEvent == Symbol.for("mouseUp")) {
            getThread(Symbol.for("room")).getComponent().setChatMode(tParam);
          }
          break;
        case "int_tv_close":
          if (tEvent == Symbol.for("mouseUp")) {
            getThread(Symbol.for("room")).getComponent().setSpectatorMode(0);
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_tv_close");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_sound_image":
        case "int_sound_bg_image":
          if (tEvent == Symbol.for("mouseUp")) {
            setSoundState(!getSoundState());
            getThread(Symbol.for("room")).getComponent().getRoomConnection().send("SET_SOUND_SETTING", propList("integer", getSoundState()));
            this.updateSoundButton();
          }
          if (tEvent == Symbol.for("mouseEnter")) {
            tInfo = getText("interface_icon_sound", "interface_icon_sound");
            this.setRollOverInfo(tInfo);
          } else {
            if (tEvent == Symbol.for("mouseLeave")) {
              this.setRollOverInfo(EMPTY);
            }
          }
          break;
        case "int_drop_vote":
          this.eventProcVote(tEvent, tSprID, tParam);
          break;
        case "im_icon":
          switch (tEvent) {
            case Symbol.for("mouseUp"):
              return executeMessage(Symbol.for("toggle_im"));
            case Symbol.for("mouseEnter"):
              this.setRollOverInfo(getText("im_tooltip"));
              break;
            case Symbol.for("mouseLeave"):
              this.setRollOverInfo(EMPTY);
              break;
          }
          break;
        case "friend_list_icon":
          if (tEvent == Symbol.for("mouseUp")) {
            executeMessage(Symbol.for("toggle_friend_list"));
            executeMessage(Symbol.for("NUH_close"), "friends");
          } else {
            if (tEvent == Symbol.for("mouseEnter")) {
              tInfo = getText("friend_list_title");
              this.setRollOverInfo(tInfo);
            } else {
              if (tEvent == Symbol.for("mouseLeave")) {
                this.setRollOverInfo(EMPTY);
              }
            }
          }
          break;
      }
    }
    if ((tEvent == Symbol.for("mouseEnter")) || (tEvent == Symbol.for("mouseLeave"))) {
      if (!objectExists(this.pPopupControllerID)) {
        createObject(this.pPopupControllerID, "Popup Controller Class");
      }
      let tPopupController = getObject(this.pPopupControllerID);
      tPopupController.handleEvent(tEvent, tSprID, tParam);
    }
  }

  eventProcVote(tEvent, tSprID, tParam) {
    if (tSprID == "int_drop_vote") {
      let tWndObj = getWindow(this.pBottomBarId);
      if (tEvent == Symbol.for("mouseDown")) {
        let tSignMem = member(getmemnum("pelle_kyltti2"));
        let tDropElem = tWndObj.getElement("int_drop_vote");
        tDropElem.getProperty(Symbol.for("buffer")).image = tSignMem.image.duplicate();
        tDropElem.getProperty(Symbol.for("buffer")).regPoint = point(0, 120);
        tDropElem.setProperty(Symbol.for("height"), tSignMem.height);
        this.pSignState = 1;
      } else {
        if (tEvent == Symbol.for("mouseUp")) {
          let tSignMem = member(getmemnum("pelle_kyltti1"));
          let tDropElem = tWndObj.getElement("int_drop_vote");
          tDropElem.getProperty(Symbol.for("buffer")).image = tSignMem.image.duplicate();
          tDropElem.getProperty(Symbol.for("buffer")).regPoint = point(0, 0);
          tDropElem.setProperty(Symbol.for("height"), tSignMem.height);
          if (voidp(this.pSignState) || (this.pOldPosV < 7)) {
            let tSignMode = (this.pOldPosH * 7) + (this.pOldPosV + 1);
            if (tSignMode > 14) {
              tSignMode = 14;
            } else {
              if (tSignMode < 1) {
                tSignMode = 1;
              }
            }
            executeMessage(Symbol.for("sendVoteSign"), tSignMode);
          }
          this.pSignState = VOID;
        } else {
          if (tEvent == Symbol.for("mouseUpOutSide")) {
            let tSignMem = member(getmemnum("pelle_kyltti1"));
            let tDropElem = tWndObj.getElement("int_drop_vote");
            tDropElem.getProperty(Symbol.for("buffer")).image = tSignMem.image.duplicate();
            tDropElem.getProperty(Symbol.for("buffer")).regPoint = point(0, 0);
            tDropElem.setProperty(Symbol.for("height"), tSignMem.height);
            this.pSignState = VOID;
          } else {
            if (tEvent == Symbol.for("mouseWithin")) {
              if (voidp(this.pSignState)) {
                return;
              }
              if (voidp(this.pSignImg)) {
                return;
              }
              let w = 40;
              let h = 17;
              this.pSignState = 11;
              let tSignMem = member(getmemnum("pelle_kyltti2"));
              let tDropElem = tWndObj.getElement("int_drop_vote");
              let tSpr = tDropElem.getProperty(Symbol.for("sprite"));
              if ((this.pOldPosH != ((the.mouseH - tSpr.left) / w)) || (this.pOldPosV != ((the.mouseV - tSpr.top) / h))) {
                if (((the.mouseV - tSpr.top) / h) < 7) {
                  this.pOldPosH = (the.mouseH - tSpr.left) / w;
                  this.pOldPosV = (the.mouseV - tSpr.top) / h;
                  this.pSignImg.copyPixels(tSignMem.image, this.pSignImg.rect, this.pSignImg.rect);
                  let tSignHiliterImg = member(getmemnum("kyltti_hiliter")).image;
                  tSignHiliterImg = image(w, h, 16);
                  tSignHiliterImg.fill(tSignHiliterImg.rect, rgb(187, 187, 187));
                  let tdestrect = tSignHiliterImg.rect + rect((w * this.pOldPosH) + 1, (h * this.pOldPosV) + 1, (w * this.pOldPosH) + 1, (h * this.pOldPosV) + 1);
                  this.pSignImg.copyPixels(tSignHiliterImg, tdestrect, tSignHiliterImg.rect, propList("ink", 39));
                } else {
                  this.pOldPosH = (the.mouseH - tSpr.left) / w;
                  this.pOldPosV = (the.mouseV - tSpr.top) / h;
                  this.pSignImg.copyPixels(tSignMem.image, this.pSignImg.rect, this.pSignImg.rect);
                }
                tDropElem.getProperty(Symbol.for("buffer")).image = this.pSignImg;
                tDropElem.getProperty(Symbol.for("buffer")).regPoint = point(0, 120);
              }
            }
          }
        }
      }
    }
  }
}
