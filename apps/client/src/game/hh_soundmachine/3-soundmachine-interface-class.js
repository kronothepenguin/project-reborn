export default class {
  pSoundMachineWindowID;
  pPlaylistWindowID;
  pSoundMachineConfirmWindowID;
  pSaveSongWindowID;
  pJukeboxWindowID;
  pJukeboxDiskWindowID;
  pSoundSetSlotWd;
  pSoundSetSlotHt;
  pSoundSetSlotMarginWd;
  pSoundSetSlotMarginHt;
  pSoundSetSampleMemberList;
  pSoundSetSampleMemberName;
  pTimeLineSlotWd;
  pTimeLineSlotHt;
  pTimeLineSlotMarginWd;
  pTimeLineSlotMarginHt;
  pTimeLineScrollStep;
  pSoundSetIconUpdateTimer;
  pPlayHeadUpdateTimer;
  pJukeboxListUpdateTimer;
  pPlayHeadEventAgentID;
  pPlayHeadDrag;
  pJukeboxSongStr;
  pJukeboxAuthorStr;
  pJukeboxLengthStr;
  pJukeboxRemainingStr;

  construct() {
    this.pJukeboxSongStr = getText("jukebox_song_name");
    this.pJukeboxAuthorStr = getText("jukebox_song_author");
    this.pJukeboxLengthStr = getText("jukebox_song_length");
    this.pJukeboxRemainingStr = getText("jukebox_song_remaining");
    this.pSoundSetIconUpdateTimer = "sound_machine_icon_timer";
    this.pPlayHeadUpdateTimer = "sound_machine_playhead_timer";
    this.pJukeboxListUpdateTimer = "jukebox_list_timer";
    this.pSoundMachineWindowID = getText("sound_machine_window");
    this.pPlaylistWindowID = getText("sound_machine_playlist_window");
    this.pSoundMachineConfirmWindowID = getText("sound_machine_confirm_window");
    this.pSaveSongWindowID = getText("sound_machine_save_window");
    this.pJukeboxWindowID = getText("sound_machine_jukebox_window");
    this.pJukeboxDiskWindowID = getText("sound_machine_jukebox_disk_window");
    registerMessage(Symbol.for("show_select_disk"), this.getID(), Symbol.for("showSelectDisk"));
    registerMessage(Symbol.for("get_jukebox_song_info"), this.getID(), Symbol.for("getJukeboxNowPlayingText"));
    registerMessage(Symbol.for("s_machine"), this.getID(), Symbol.for("showJukebox"));
    this.pSoundSetSlotWd = 25;
    this.pSoundSetSlotHt = 25;
    this.pSoundSetSlotMarginWd = -1;
    this.pSoundSetSlotMarginHt = -1;
    this.pTimeLineScrollStep = 10;
    this.pSoundSetSampleMemberList = list("sound_system_ui_sample_g_", "sound_system_ui_sample_y_", "sound_system_ui_sample_p_", "sound_system_ui_sample_b_");
    this.pSoundSetSampleMemberName = "sound_system_ui_sample_";
    this.pTimeLineSlotWd = 23;
    this.pTimeLineSlotHt = 25;
    this.pTimeLineSlotMarginWd = -1;
    this.pTimeLineSlotMarginHt = 1;
    this.pPlayHeadEventAgentID = `${this.getID()} ${the.milliSeconds}`;
    createObject(this.pPlayHeadEventAgentID, getClassVariable("event.agent.class"));
    return 1;
  }

  deconstruct() {
    unregisterMessage(Symbol.for("show_select_disk"), this.getID());
    unregisterMessage(Symbol.for("get_jukebox_song_info"), this.getID());
    unregisterMessage(Symbol.for("s_machine"), this.getID());
    if (timeoutExists(this.pSoundSetIconUpdateTimer)) {
      removeTimeout(this.pSoundSetIconUpdateTimer);
    }
    if (timeoutExists(this.pPlayHeadUpdateTimer)) {
      removeTimeout(this.pPlayHeadUpdateTimer);
    }
    if (timeoutExists(this.pJukeboxListUpdateTimer)) {
      removeTimeout(this.pJukeboxListUpdateTimer);
    }
    removeObject(this.pPlayHeadEventAgentID);
    return 1;
  }

  showSelectAction(tIsOn) {
    if (!windowExists(this.pSoundMachineWindowID)) {
      if (!createWindow(this.pSoundMachineWindowID, "habbo_full.window")) {
        return error(this, "Failed to open Sound Machine window!!!", Symbol.for("showSelectAction"), Symbol.for("major"));
      } else {
        const tWndObj = getWindow(this.pSoundMachineWindowID);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcSelectAction"), this.getID(), Symbol.for("mouseUp"));
        if (!tWndObj.merge("sound_machine_action.window")) {
          return tWndObj.close();
        }
        let tElem = tWndObj.getElement("sound_machine_onoff");
        if (tElem != 0) {
          let tText;
          if (tIsOn) {
            tText = getText("sound_machine_turn_off");
          } else {
            tText = getText("sound_machine_turn_on");
          }
          tElem.setText(tText);
        }
        tWndObj.center();
        tWndObj.moveBy(0, -30);
      }
    } else {
      const tWndObj = getWindow(this.pSoundMachineWindowID);
      const tElem = tWndObj.getElement("sound_machine_onoff");
      if (tElem != 0) {
        let tText;
        if (tIsOn) {
          tText = getText("sound_machine_turn_off");
        } else {
          tText = getText("sound_machine_turn_on");
        }
        tElem.setText(tText);
      }
    }
    return 1;
  }

  showPlaylist() {
    if (!windowExists(this.pPlaylistWindowID)) {
      if (!createWindow(this.pPlaylistWindowID, "sound_machine_window.window", VOID, VOID, Symbol.for("modal"))) {
        return error(this, "Failed to open Sound Machine window!!!", Symbol.for("showPlaylist"), Symbol.for("major"));
      } else {
        const tWndObj = getWindow(this.pPlaylistWindowID);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcPlaylist"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcPlaylist"), this.getID(), Symbol.for("mouseWithin"));
        tWndObj.registerProcedure(Symbol.for("eventProcPlaylist"), this.getID(), Symbol.for("mouseLeave"));
        if (!tWndObj.merge("sound_machine_playlist.window")) {
          return tWndObj.close();
        }
        const tElemList = list("sound_machine_edit_text", "sound_machine_new_text", "sound_machine_list_save_text", "sound_machine_burn_text");
        for (const tElemName of tElemList) {
          const tElem = tWndObj.getElement(tElemName);
          if (tElem != 0) {
            const tsprite = tElem.getProperty(Symbol.for("sprite"));
            if (ilk(tsprite) == Symbol.for("sprite")) {
              removeEventBroker(tsprite.spriteNum);
            }
          }
        }
        tWndObj.center();
        tWndObj.moveBy(0, -30);
        const tPlaylistManager = this.getComponent().getPlaylistManager();
        if (tPlaylistManager != 0) {
          tPlaylistManager.getSongListData();
        }
        this.updatePlaylists();
      }
    }
    return 1;
  }

  showSoundMachine() {
    if (!windowExists(this.pSoundMachineWindowID)) {
      if (!createWindow(this.pSoundMachineWindowID, "sound_machine_window.window", VOID, VOID, Symbol.for("modal"))) {
        return error(this, "Failed to open Sound Machine window!!!", Symbol.for("showSoundMachine"), Symbol.for("major"));
      } else {
        const tWndObj = getWindow(this.pSoundMachineWindowID);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcSoundMachine"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcSoundMachine"), this.getID(), Symbol.for("mouseDown"));
        tWndObj.registerProcedure(Symbol.for("eventProcSoundMachine"), this.getID(), Symbol.for("mouseEnter"));
        tWndObj.registerProcedure(Symbol.for("eventProcSoundMachine"), this.getID(), Symbol.for("mouseWithin"));
        tWndObj.registerProcedure(Symbol.for("eventProcSoundMachine"), this.getID(), Symbol.for("mouseLeave"));
        if (!tWndObj.merge("sound_machine_ui.window")) {
          return tWndObj.close();
        }
        this.getComponent().initializeEdit();
        this.updateSoundSetVisualizations();
        this.renderTimeLine();
        this.updatePlayHead();
        this.updatePlayButton();
        const tElem = tWndObj.getElement("sound_timeline_playhead");
        if (tElem != 0) {
          const tsprite = tElem.getProperty(Symbol.for("sprite"));
          if (ilk(tsprite) == Symbol.for("sprite")) {
            removeEventBroker(tsprite.spriteNum);
          }
        }
        this.pPlayHeadDrag = 0;
        tWndObj.center();
        tWndObj.moveBy(0, -30);
      }
    }
    return 1;
  }

  showSaveSong() {
    if (!windowExists(this.pSaveSongWindowID)) {
      if (!this.getComponent().getCanSaveSong()) {
        this.ShowAlert("song_not_ready");
        return 1;
      }
      if (!createWindow(this.pSaveSongWindowID, "sound_machine_window.window", VOID, VOID, Symbol.for("modal"))) {
        return error(this, "Failed to open song save window!!!", Symbol.for("showPlaylist"), Symbol.for("major"));
      } else {
        const tWndObj = getWindow(this.pSaveSongWindowID);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcSaveSong"), this.getID(), Symbol.for("mouseUp"));
        if (!tWndObj.merge("sound_machine_save.window")) {
          return tWndObj.close();
        }
        const tElemList = list("sound_machine_edit_text", "sound_machine_song_save_text", "sound_machine_save_cancel_text");
        for (const tElemName of tElemList) {
          const tElem = tWndObj.getElement(tElemName);
          if (tElem != 0) {
            const tsprite = tElem.getProperty(Symbol.for("sprite"));
            if (ilk(tsprite) == Symbol.for("sprite")) {
              removeEventBroker(tsprite.spriteNum);
            }
          }
        }
        const tElem = tWndObj.getElement("sound_machine_song_name");
        if (tElem != 0) {
          const tSongName = this.getComponent().getEditorSongName();
          if (tSongName != EMPTY) {
            tElem.setText(tSongName);
          } else {
            tElem.setText(getText("sound_machine_song_name"));
          }
        }
        tWndObj.center();
        tWndObj.moveBy(0, -30);
        this.updatePlaylists();
      }
    }
    return 1;
  }

  showJukebox() {
    if (!windowExists(this.pJukeboxWindowID)) {
      if (!createWindow(this.pJukeboxWindowID, "sound_machine_jukebox.window", VOID, VOID, Symbol.for("modal"))) {
        return error(this, "Failed to open jukebox window!!!", Symbol.for("showJukebox"), Symbol.for("major"));
      } else {
        this.renderJukebox();
        const tWndObj = getWindow(this.pJukeboxWindowID);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcJukebox"), this.getID(), Symbol.for("mouseUp"));
        tWndObj.registerProcedure(Symbol.for("eventProcJukebox"), this.getID(), Symbol.for("mouseEnter"));
        tWndObj.registerProcedure(Symbol.for("eventProcJukebox"), this.getID(), Symbol.for("mouseWithin"));
        tWndObj.registerProcedure(Symbol.for("eventProcJukebox"), this.getID(), Symbol.for("mouseLeave"));
        if (!timeoutExists(this.pJukeboxListUpdateTimer)) {
          createTimeout(this.pJukeboxListUpdateTimer, 500, Symbol.for("renderJukeboxPlaylist"), this.getID(), VOID, 0);
        }
        const tElemList = list("jukebox_reset_text");
        for (const tElemName of tElemList) {
          const tElem = tWndObj.getElement(tElemName);
          if (tElem != 0) {
            const tsprite = tElem.getProperty(Symbol.for("sprite"));
            if (ilk(tsprite) == Symbol.for("sprite")) {
              removeEventBroker(tsprite.spriteNum);
            }
          }
        }
        const tJukeBoxManager = this.getComponent().getJukeBoxManager();
        if (tJukeBoxManager != 0) {
          if (!tJukeBoxManager.getOwner()) {
            const tElemList = list("jukebox_reset_button", "jukebox_reset_text");
            for (const tElemName of tElemList) {
              const tElem = tWndObj.getElement(tElemName);
              if (tElem != 0) {
                tElem.setProperty(Symbol.for("visible"), 0);
              }
            }
          }
        }
        this.getComponent().getUserDisks();
      }
    }
    return 1;
  }

  showSelectDisk() {
    if (!windowExists(this.pJukeboxDiskWindowID)) {
      if (!this.getComponent().getCanInsertDisk()) {
        this.ShowAlert("no_disks");
        return 1;
      }
      if (!createWindow(this.pJukeboxDiskWindowID, "sound_machine_jukebox_disklist.window", VOID, VOID, Symbol.for("modal"))) {
        return error(this, "Failed to open select disk window!!!", Symbol.for("showSelectDisk"), Symbol.for("major"));
      } else {
        this.renderUserDiskList(1);
        const tWndObj = getWindow(this.pJukeboxDiskWindowID);
        tWndObj.registerClient(this.getID());
        tWndObj.registerProcedure(Symbol.for("eventProcJukeboxDisk"), this.getID(), Symbol.for("mouseUp"));
        const tElemList = list("jukebox_disk_add_text", "jukebox_disk_cancel_text");
        for (const tElemName of tElemList) {
          const tElem = tWndObj.getElement(tElemName);
          if (tElem != 0) {
            const tsprite = tElem.getProperty(Symbol.for("sprite"));
            if (ilk(tsprite) == Symbol.for("sprite")) {
              removeEventBroker(tsprite.spriteNum);
            }
          }
        }
      }
    }
    return 1;
  }

  getJukeboxNowPlayingText(tArray) {
    if (ilk(tArray) != Symbol.for("propList")) {
      return 0;
    }
    const tPlaylistManager = this.getComponent().getPlaylistManager();
    if (tPlaylistManager == 0) {
      return 0;
    }
    if (tPlaylistManager.getPlaylistCount() == 0) {
      return 0;
    }
    const tSongName = tPlaylistManager.getPlaylistSongName(1);
    const tAuthor = tPlaylistManager.getPlaylistSongAuthor(1);
    let tSongStr = this.pJukeboxSongStr;
    let tAuthorStr = this.pJukeboxAuthorStr;
    tSongStr = replaceChunks(tSongStr, "%name%", tSongName);
    tAuthorStr = replaceChunks(tAuthorStr, "%author%", tAuthor);
    tArray[Symbol.for("songName")] = tSongStr;
    tArray[Symbol.for("author")] = tAuthorStr;
    return tArray;
  }

  hideWindows() {
    this.hideSelectAction();
    this.hidePlaylist();
    this.hideSoundMachine();
    this.hideSaveSong();
    this.hideJukebox();
    this.hideJukeboxDisk();
    this.hideConfirm();
  }

  hideSelectAction() {
    if (windowExists(this.pSoundMachineWindowID)) {
      return removeWindow(this.pSoundMachineWindowID);
    } else {
      return 0;
    }
  }

  hidePlaylist() {
    if (windowExists(this.pPlaylistWindowID)) {
      return removeWindow(this.pPlaylistWindowID);
    } else {
      return 0;
    }
  }

  hideSoundMachine() {
    if (windowExists(this.pSoundMachineWindowID)) {
      this.getComponent().closeEdit();
      return removeWindow(this.pSoundMachineWindowID);
    } else {
      return 0;
    }
  }

  hideSaveSong() {
    if (windowExists(this.pSaveSongWindowID)) {
      return removeWindow(this.pSaveSongWindowID);
    } else {
      return 0;
    }
  }

  hideJukebox() {
    if (timeoutExists(this.pJukeboxListUpdateTimer)) {
      removeTimeout(this.pJukeboxListUpdateTimer);
    }
    if (windowExists(this.pJukeboxWindowID)) {
      return removeWindow(this.pJukeboxWindowID);
    } else {
      return 0;
    }
  }

  hideJukeboxDisk() {
    if (windowExists(this.pJukeboxDiskWindowID)) {
      return removeWindow(this.pJukeboxDiskWindowID);
    } else {
      return 0;
    }
  }

  confirmAction(tAction, tParameter) {
    const tResult = this.getComponent().confirmAction(tAction, tParameter);
    if (tResult) {
      if (!windowExists(this.pSoundMachineConfirmWindowID)) {
        if (!createWindow(this.pSoundMachineConfirmWindowID, "habbo_full.window", VOID, VOID, Symbol.for("modal"))) {
          return error(this, "Failed to open Sound Machine confirm window!!!", Symbol.for("confirmAction"), Symbol.for("major"));
        } else {
          const tWndObj = getWindow(this.pSoundMachineConfirmWindowID);
          tWndObj.registerClient(this.getID());
          tWndObj.registerProcedure(Symbol.for("eventProcConfirm"), this.getID(), Symbol.for("mouseUp"));
          if (!tWndObj.merge("habbo_decision_dialog.window")) {
            return tWndObj.close();
          }
          let tElem = tWndObj.getElement("habbo_decision_text_a");
          if (tElem != 0) {
            const tText = getText(`sound_machine_confirm_${tAction}`);
            tElem.setText(tText);
          }
          tElem = tWndObj.getElement("habbo_decision_text_b");
          if (tElem != 0) {
            const tText = getText(`sound_machine_confirm_${tAction}_long`);
            tElem.setText(tText);
          }
          tWndObj.center();
          tWndObj.moveBy(0, -30);
        }
      }
    }
    return tResult;
  }

  hideConfirm() {
    if (windowExists(this.pSoundMachineConfirmWindowID)) {
      return removeWindow(this.pSoundMachineConfirmWindowID);
    } else {
      return 0;
    }
  }

  ShowAlert(ttype, tExtra) {
    if (voidp(tExtra)) {
      tExtra = EMPTY;
    }
    const tText = getText(`sound_machine_alert_${ttype}`);
    executeMessage(Symbol.for("alert"), propList("Msg", `${tText}${tExtra}`, "modal", 1));
  }

  showAlertWithCount(ttype, tCount) {
    let tText = getText(`sound_machine_alert_${ttype}`);
    tText = replaceChunks(tText, "%count%", tCount);
    executeMessage(Symbol.for("alert"), propList("Msg", tText, "modal", 1));
  }

  showSongSaved(tName) {
    let tText = getText("sound_machine_alert_song_saved");
    tText = replaceChunks(tText, "%name%", tName);
    executeMessage(Symbol.for("alert"), propList("Msg", tText, "modal", 1));
  }

  renderSoundSets() {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    for (let tIndex = this.getComponent().getSoundSetLimit(); tIndex >= 1; tIndex--) {
      let tNameBase;
      if (this.pSoundSetSampleMemberList.count >= tIndex) {
        tNameBase = this.pSoundSetSampleMemberList[tIndex];
      } else {
        tNameBase = this.pSoundSetSampleMemberList[1];
      }
      const tElem = tWndObj.getElement(`sound_set_samples_${tIndex}`);
      if (tElem != 0) {
        const tImg = this.getComponent().renderSoundSet(tIndex, this.pSoundSetSlotWd, this.pSoundSetSlotHt, this.pSoundSetSlotMarginWd, this.pSoundSetSlotMarginHt, tNameBase, this.pSoundSetSampleMemberName);
        if (tImg != 0) {
          tElem.feedImage(tImg);
          continue;
        }
        tElem.feedImage(image(0, 0, 32));
      }
    }
    return 1;
  }

  renderSongList() {
    const tWndObj = getWindow(this.pPlaylistWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tPlaylistManager = this.getComponent().getPlaylistManager();
    if (tPlaylistManager != 0) {
      let tElem = tWndObj.getElement("song_list");
      if (tElem != 0) {
        const tImg = tPlaylistManager.renderSongList();
        if (tImg != 0) {
          tElem.feedImage(tImg);
        }
      }
      tElem = tWndObj.getElement("song_name_text");
      if (tElem != 0) {
        tElem.setText(tPlaylistManager.getSongName());
      }
      tElem = tWndObj.getElement("song_length_text");
      if (tElem != 0) {
        let tLength = tPlaylistManager.getSongLength();
        if (tLength < 0) {
          tLength = 0;
        }
        tLength = tLength * this.getComponent().getTimeLineSlotLength() / 1000;
        const tStr = this.getComponent().getTimeString(tLength);
        tElem.setText(string(tStr));
      }
    }
    const tElem = tWndObj.getElement("song_date_text");
    if (tElem != 0) {
    }
  }

  renderPlaylist() {
    const tWndObj = getWindow(this.pPlaylistWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tPlaylistManager = this.getComponent().getPlaylistManager();
    if (tPlaylistManager != 0) {
      let tElem = tWndObj.getElement("playlist");
      if (tElem != 0) {
        const tImg = tPlaylistManager.renderPlaylist();
        if (tImg != 0) {
          tElem.feedImage(tImg);
        }
      }
      tElem = tWndObj.getElement("playlist_arrows");
      if (tElem != 0) {
        const tImg = tPlaylistManager.renderPlaylistArrows();
        if (tImg != 0) {
          tElem.feedImage(tImg);
        }
      }
    }
  }

  renderJukebox() {
    this.renderJukeboxDiskList();
    this.renderJukeboxPlaylist();
  }

  renderJukeboxPlaylist() {
    const tWndObj = getWindow(this.pJukeboxWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tPlaylistManager = this.getComponent().getPlaylistManager();
    const tJukeBoxManager = this.getComponent().getJukeBoxManager();
    if ((tPlaylistManager != 0) && (tJukeBoxManager != 0)) {
      const tSongName = tPlaylistManager.getPlaylistSongName(1);
      const tAuthor = tPlaylistManager.getPlaylistSongAuthor(1);
      const tPlayTime = tPlaylistManager.getPlayTime() / 10;
      const tSongLength = tPlaylistManager.getPlaylistSongLength(1) * this.getComponent().getTimeLineSlotLength() / 1000;
      let tSongStr = this.pJukeboxSongStr;
      let tAuthorStr = this.pJukeboxAuthorStr;
      let tLengthStr = this.pJukeboxLengthStr;
      let tRemainStr = this.pJukeboxRemainingStr;
      tSongStr = replaceChunks(tSongStr, "%name%", tSongName);
      tAuthorStr = replaceChunks(tAuthorStr, "%author%", tAuthor);
      tLengthStr = replaceChunks(tLengthStr, "%time%", this.getComponent().getTimeStringBasic(tSongLength));
      tRemainStr = replaceChunks(tRemainStr, "%time%", this.getComponent().getTimeStringBasic(tSongLength - tPlayTime));
      if (tPlaylistManager.getPlaylistCount() == 0) {
        tSongStr = EMPTY;
        tAuthorStr = EMPTY;
        tLengthStr = EMPTY;
        tRemainStr = EMPTY;
      }
      const tTextList = list(tSongStr, tAuthorStr, tLengthStr, tRemainStr);
      const tElemList = list("now_playing_name", "now_playing_author", "now_playing_length", "now_playing_remaining");
      for (let i = min(tTextList.count, tElemList.count); i >= 1; i--) {
        const tTextElem = tWndObj.getElement(tElemList[i]);
        if (tTextElem != 0) {
          tTextElem.setText(tTextList[i]);
        }
      }
      const tElem = tWndObj.getElement("next_up_panel");
      if (tElem != 0) {
        const tSongList = list();
        for (let i = 2; i <= tPlaylistManager.getPlaylistCount(); i++) {
          const tSongName = tPlaylistManager.getPlaylistSongName(i);
          tSongList.add(tSongName);
        }
        const tImg = tJukeBoxManager.renderPlaylist(tSongList);
        if (tImg != 0) {
          tElem.feedImage(tImg);
        }
      }
    }
    return 1;
  }

  renderJukeboxDiskList() {
    const tWndObj = getWindow(this.pJukeboxWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tJukeBoxManager = this.getComponent().getJukeBoxManager();
    if (tJukeBoxManager != 0) {
      const tElem = tWndObj.getElement("disk_list");
      if (tElem != 0) {
        const tImg = tJukeBoxManager.renderDiskList();
        if (tImg != 0) {
          tElem.feedImage(tImg);
        }
      }
    }
    return 1;
  }

  renderUserDiskList(tInitialRender) {
    const tWndObj = getWindow(this.pJukeboxDiskWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("disk_list");
    if (tElem != 0) {
      const tImg = this.getComponent().renderUserDiskList(tInitialRender);
      if (tImg != 0) {
        tElem.feedImage(tImg);
      }
    }
    return 1;
  }

  renderTimeLine() {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tElem = tWndObj.getElement("sound_timeline");
    if (tElem != 0) {
      const tImg = this.getComponent().renderTimeLine(this.pTimeLineSlotWd, this.pTimeLineSlotHt, this.pTimeLineSlotMarginWd, this.pTimeLineSlotMarginHt, this.pSoundSetSampleMemberList, this.pSoundSetSampleMemberName, "sound_system_ui_timeline_bg2");
      if (tImg != 0) {
        tElem.feedImage(tImg);
      } else {
        tElem.feedImage(image(0, 0, 32));
      }
    }
    tElem = tWndObj.getElement("sound_timeline_stamps");
    if (tElem != 0) {
      const tBarHt = 15;
      const tImg = this.getComponent().renderTimeLineBar(this.pTimeLineSlotWd, tBarHt, this.pTimeLineSlotMarginWd, this.pSoundSetSampleMemberList, this.pSoundSetSampleMemberName, "sound_system_ui_timeline_bg2");
      if (tImg != 0) {
        tElem.feedImage(tImg);
      } else {
        tElem.feedImage(image(0, 0, 32));
      }
    }
    this.updatePlayHead(1);
    tElem = tWndObj.getElement("sound_left_button");
    if (tElem != 0) {
      const tVisible = this.getComponent().getScrollPossible(-1);
      tElem.setProperty(Symbol.for("visible"), tVisible);
    }
    tElem = tWndObj.getElement("sound_right_button");
    if (tElem != 0) {
      const tVisible = this.getComponent().getScrollPossible(1);
      tElem.setProperty(Symbol.for("visible"), tVisible);
    }
    return 1;
  }

  updateSoundSetTabs() {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tHooveredTab = this.getComponent().getSoundSetHooveredTab();
    for (let tIndex = this.getComponent().getSoundSetLimit(); tIndex >= 1; tIndex--) {
      let tVisible = 1;
      const tID = this.getComponent().getSoundSetID(tIndex);
      if (tID != 0) {
        const tElem = tWndObj.getElement(`sound_set_tab_text_${tIndex}`);
        if (tElem != 0) {
          tElem.setProperty(Symbol.for("visible"), 1);
          let tText;
          if (tIndex != tHooveredTab) {
            tText = this.getComponent().getSoundSetName(tID);
          } else {
            tText = getText("sound_machine_eject");
          }
          tElem.setText(tText);
        }
      } else {
        tVisible = 0;
      }
      const tElemList = list(`sound_set_tab_${tIndex}`, `sound_set_tab_text_${tIndex}`);
      for (const tElemName of tElemList) {
        const tElem = tWndObj.getElement(tElemName);
        if (tElem != 0) {
          tElem.setProperty(Symbol.for("visible"), tVisible);
        }
      }
    }
    return 1;
  }

  updateSoundSetSlots() {
    this.updateSoundSetTabs();
    this.renderSoundSets();
    this.renderTimeLine();
  }

  updateSoundSetList() {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    let tSetsReady = 1;
    for (let tIndex = this.getComponent().getSoundSetListPageSize(); tIndex >= 1; tIndex--) {
      const tID = this.getComponent().getSoundSetListID(tIndex);
      if (tID != 0) {
        let tElem = tWndObj.getElement(`set_list_text_${tIndex}`);
        if (tElem != 0) {
          const tText = this.getComponent().getSoundSetName(tID);
          tElem.setText(tText);
        }
        tElem = tWndObj.getElement(`set_list_icon_${tIndex}`);
        if (tElem != 0) {
          let tIcon;
          if (objectExists("Preview_renderer")) {
            const tSoundSetName = `sound_set_${tID}`;
            const tdata = propList("class", tSoundSetName, "type", Symbol.for("Active"));
            executeMessage(Symbol.for("downloadObject"), tdata);
            if (tdata[Symbol.for("ready")] == 0) {
              tSetsReady = 0;
            }
            tIcon = getObject("Preview_renderer").renderPreviewImage(VOID, VOID, VOID, tSoundSetName);
            tIcon = tIcon.trimWhiteSpace();
          } else {
            tIcon = image(0, 0, 32);
          }
          const tWd = tElem.getProperty(Symbol.for("width"));
          const tHt = tElem.getProperty(Symbol.for("height"));
          const tCenteredImage = image(tWd, tHt, 32);
          const tMatte = tIcon.createMatte();
          const tXchange = (tCenteredImage.width - tIcon.width) / 2;
          const tYchange = (tCenteredImage.height - tIcon.height) / 2;
          const tRect1 = tIcon.rect + rect(tXchange, tYchange, tXchange, tYchange);
          tCenteredImage.copyPixels(tIcon, tRect1, tIcon.rect, propList("maskImage", tMatte, "ink", 41));
          tElem.feedImage(tCenteredImage);
        }
      } else {
        let tElem = tWndObj.getElement(`set_list_text_${tIndex}`);
        if (tElem != 0) {
          tElem.setText(EMPTY);
        }
        tElem = tWndObj.getElement(`set_list_icon_${tIndex}`);
        if (tElem != 0) {
          const tIcon = image(0, 0, 32);
          tElem.feedImage(tIcon);
        }
      }
      const tElem = tWndObj.getElement(`set_list_text2_${tIndex}`);
      if (tElem != 0) {
        tElem.setText(EMPTY);
      }
    }
    const tElem = tWndObj.getElement("set_list_index");
    if (tElem != 0) {
      const tText = `${this.getComponent().getSoundListPage()}/${this.getComponent().getSoundListPageCount()}`;
      tElem.setText(tText);
    }
    if (!tSetsReady) {
      if (!timeoutExists(this.pSoundSetIconUpdateTimer)) {
        createTimeout(this.pSoundSetIconUpdateTimer, 500, Symbol.for("updateSoundSetList"), this.getID(), VOID, 1);
      }
    }
    let tVisible;
    if (this.getComponent().getSoundListPageCount() == 1) {
      tVisible = 0;
    } else {
      tVisible = 1;
    }
    const tElemList = list("set_list_left", "set_list_right");
    for (const tName of tElemList) {
      const tElem = tWndObj.getElement(tName);
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), tVisible);
      }
    }
  }

  updateSoundSetVisualizations() {
    this.updateSoundSetList();
    this.updateSoundSetSlots();
  }

  scrollTimeLine(tDX) {
    if (this.getComponent().scrollTimeLine(tDX)) {
      this.renderTimeLine();
    }
  }

  scrollTimeLineTo(tX) {
    if (this.getComponent().scrollTimeLineTo(tX)) {
      this.renderTimeLine();
    }
  }

  updatePlaylists() {
    this.renderSongList();
    this.renderPlaylist();
  }

  soundSetEvent(tSetID, tPos, tEvent) {
    let tX, tY;
    if (tEvent != Symbol.for("mouseLeave")) {
      if ((tPos.locH < 0) || (tPos.locV < 0)) {
        return 0;
      }
      tX = 1 + (tPos.locH / (this.pSoundSetSlotWd + this.pSoundSetSlotMarginWd));
      tY = 1 + (tPos.locV / (this.pSoundSetSlotHt + this.pSoundSetSlotMarginHt));
    } else {
      tX = 1;
      tY = 1;
    }
    if (this.getComponent().soundSetEvent(tSetID, tX, tY, tEvent)) {
      this.renderSoundSets();
      return 1;
    }
    return 0;
  }

  soundSetTabEvent(tSetID, tEvent) {
    if (this.getComponent().soundSetTabEvent(tSetID, tEvent)) {
      this.updateSoundSetVisualizations();
    }
    return 1;
  }

  timeLineEvent(tPos, tRect, tEvent) {
    if (this.pPlayHeadDrag) {
      return 1;
    }
    let tX = 1 + (tPos.locH / (this.pTimeLineSlotWd + this.pTimeLineSlotMarginWd));
    let tY = 1 + (tPos.locV / (this.pTimeLineSlotHt + this.pTimeLineSlotMarginHt));
    if ((tEvent == Symbol.for("mouseLeave")) || (tEvent == Symbol.for("mouseWithin"))) {
      if (tEvent == Symbol.for("mouseLeave")) {
        tX = -1;
        tY = -1;
      }
      if ((tPos.locH < 0) || (tPos.locV < 0) || (tPos.locH > (tRect[3] - tRect[1])) || (tPos.locV > (tRect[4] - tRect[2]))) {
        tX = -1;
        tY = -1;
        tEvent = Symbol.for("mouseLeave");
      }
    }
    if (this.getComponent().timeLineEvent(tX, tY, tEvent)) {
      this.renderTimeLine();
    }
    return 1;
  }

  updatePlayHead(tManualUpdate) {
    if (voidp(tManualUpdate)) {
      tManualUpdate = 0;
    }
    const tPlayTime = this.getComponent().getEditorPlayTime();
    const tSlotLength = this.getComponent().getTimeLineSlotLength();
    const tBehind = tPlayTime % tSlotLength;
    if (tPlayTime) {
      if (!timeoutExists(this.pPlayHeadUpdateTimer)) {
        createTimeout(this.pPlayHeadUpdateTimer, tSlotLength - tBehind, Symbol.for("updatePlayHead"), this.getID(), VOID, 1);
      }
    }
    let tPos = this.getComponent().getPlayHeadPosition();
    let tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tPos > 0) {
      tPos = tPos - 1;
      const tElem = tWndObj.getElement("sound_timeline");
      if (tElem != 0) {
        const tLocX = tElem.getProperty(Symbol.for("locX"));
        const tNameList = list("sound_timeline_playhead", "sound_timeline_playhead_drag");
        for (const tName of tNameList) {
          const tElem = tWndObj.getElement(tName);
          if (tElem != 0) {
            tElem.setProperty(Symbol.for("visible"), 1);
            const tWd = tElem.getProperty(Symbol.for("width"));
            tElem.setProperty(Symbol.for("locX"), tLocX + ((this.pTimeLineSlotWd - tWd) / 2) + (this.pTimeLineSlotWd * tPos) + (this.pTimeLineSlotMarginWd * tPos));
          }
        }
      }
      return 1;
    } else {
      tWndObj = getWindow(this.pSoundMachineWindowID);
      if (tWndObj == 0) {
        return 0;
      }
      const tNameList = list("sound_timeline_playhead", "sound_timeline_playhead_drag");
      for (const tName of tNameList) {
        const tElem = tWndObj.getElement(tName);
        if (tElem != 0) {
          tElem.setProperty(Symbol.for("visible"), 0);
        }
      }
      if (!tManualUpdate) {
        this.scrollTimeLineTo(-tPos - 1);
      }
    }
    return 0;
  }

  initPlayHeadEventAgent(tBoolean) {
    const tAgent = getObject(this.pPlayHeadEventAgentID);
    if (tBoolean) {
      tAgent.registerEvent(this, Symbol.for("mouseUp"), Symbol.for("playHeadMouseUp"));
      tAgent.registerEvent(this, Symbol.for("mouseWithin"), Symbol.for("playHeadMouseWithin"));
    } else {
      tAgent.unregisterEvent(Symbol.for("mouseUp"));
      tAgent.unregisterEvent(Symbol.for("mouseWithin"));
    }
    this.pPlayHeadDrag = tBoolean;
  }

  playHeadMouseUp() {
    this.initPlayHeadEventAgent(0);
  }

  playHeadMouseWithin() {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    const tElem = tWndObj.getElement("sound_timeline");
    if (tElem != 0) {
      const tRect = tElem.getProperty(Symbol.for("rect"));
      const tPos = point(the.mouseH - tRect[1], the.mouseV - tRect[2]);
      let tX = 1 + (tPos.locH / (this.pTimeLineSlotWd + this.pTimeLineSlotMarginWd));
      if (tPos < 0) {
        tX = 0;
      }
      if (this.getComponent().movePlayHead(tX)) {
        this.renderTimeLine();
      }
    }
  }

  soundMachineSelected(tIsOn) {
    if (windowExists(this.pSoundMachineWindowID)) {
      const tWndObj = getWindow(this.pSoundMachineWindowID);
      const tElem = tWndObj.getElement("sound_machine_onoff");
      if (tElem == 0) {
        return 0;
      }
    }
    return this.showSelectAction(tIsOn);
  }

  updatePlayButton() {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (this.getComponent().getEditorPlayTime() == 0) {
      let tElem = tWndObj.getElement("sound_play_button");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 1);
      }
      tElem = tWndObj.getElement("sound_stop_button");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 0);
      }
    } else {
      let tElem = tWndObj.getElement("sound_play_button");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 0);
      }
      tElem = tWndObj.getElement("sound_stop_button");
      if (tElem != 0) {
        tElem.setProperty(Symbol.for("visible"), 1);
      }
    }
  }

  getEditorWindowExists() {
    if (windowExists(this.pSoundMachineWindowID)) {
      const tWndObj = getWindow(this.pSoundMachineWindowID);
      const tElem = tWndObj.getElement("sound_machine_onoff");
      if (tElem == 0) {
        return 1;
      }
    }
    return 0;
  }

  eventProcSoundMachine(tEvent, tSprID, tParam, tWndID) {
    const tWndObj = getWindow(this.pSoundMachineWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (offset("sound_set_samples_", tSprID) == 1) {
      const tSoundSetID = value(tSprID.char[`${"sound_set_samples_".length + 1}..${tSprID.length}`]);
      const tElem = tWndObj.getElement(tSprID);
      const tRect = tElem.getProperty(Symbol.for("rect"));
      this.soundSetEvent(tSoundSetID, point(the.mouseH - tRect[1], the.mouseV - tRect[2]), tEvent);
      if (!this.getComponent().getHooveredSampleReady()) {
        tElem.setProperty(Symbol.for("cursor"), 4);
      } else {
        tElem.setProperty(Symbol.for("cursor"), "cursor.finger");
      }
    } else {
      if (offset("sound_set_tab_text_", tSprID) == 1) {
        const tSoundSetID = value(tSprID.char[`${"sound_set_tab_text_".length + 1}..${tSprID.length}`]);
        this.soundSetTabEvent(tSoundSetID, tEvent);
      } else {
        if ((tSprID == "sound_timeline") || (tSprID == "sound_timeline_bg")) {
          const tElem = tWndObj.getElement("sound_timeline");
          if (tElem != 0) {
            const tRect = tElem.getProperty(Symbol.for("rect"));
            this.timeLineEvent(point(the.mouseH - tRect[1], the.mouseV - tRect[2]), tRect, tEvent);
          }
        }
      }
    }
    if (offset("set_list_icon_", tSprID) == 1) {
      if (tEvent == Symbol.for("mouseEnter")) {
        const tIndex = value(tSprID.char[`${"set_list_icon_".length + 1}..${tSprID.length}`]);
        const tElem = tWndObj.getElement(`set_list_text2_${tIndex}`);
        if (tElem != 0) {
          const tText = getText("sound_machine_insert");
          tElem.setText(tText);
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          this.updateSoundSetVisualizations();
        }
      }
    }
    if (tEvent == Symbol.for("mouseDown")) {
      if (tSprID == "sound_timeline_playhead_drag") {
        this.initPlayHeadEventAgent(1);
      }
    }
    if (tEvent == Symbol.for("mouseUp")) {
      if (tSprID == "set_list_left") {
        if (this.getComponent().changeSetListPage(-1)) {
          this.updateSoundSetList();
        }
      } else {
        if (tSprID == "set_list_right") {
          if (this.getComponent().changeSetListPage(1)) {
            this.updateSoundSetList();
          }
        } else {
          if (offset("set_list_icon_", tSprID) == 1) {
            if (this.getComponent().getFreeSoundSetCount() > 0) {
              const tIndex = value(tSprID.char[`${"set_list_icon_".length + 1}..${tSprID.length}`]);
              if (this.getComponent().loadSoundSet(tIndex)) {
                this.updateSoundSetVisualizations();
              }
            } else {
              this.ShowAlert("machine_full");
            }
          } else {
            if (tSprID == "sound_play_button") {
              this.getComponent().playEditorSong();
              this.updatePlayHead();
            } else {
              if (tSprID == "sound_stop_button") {
                this.getComponent().stopEditorSong();
              } else {
                if (tSprID == "sound_save_button") {
                  this.showSaveSong();
                } else {
                  if (tSprID == "sound_trash_button") {
                    this.confirmAction("clear", EMPTY);
                  } else {
                    if (tSprID == "sound_left_button") {
                      this.scrollTimeLine(-this.pTimeLineScrollStep);
                    } else {
                      if (tSprID == "sound_right_button") {
                        this.scrollTimeLine(this.pTimeLineScrollStep);
                      } else {
                        if (tSprID == "close") {
                          this.confirmAction("close", EMPTY);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return 1;
  }

  eventProcSelectAction(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          this.hideSelectAction();
          this.getComponent().closeSelectAction();
          break;
        case "sound_machine_edit":
          this.hideSelectAction();
          this.showPlaylist();
          break;
        case "sound_machine_onoff":
          this.getComponent().changeFurniState();
          this.hideSelectAction();
          break;
      }
    }
    return 1;
  }

  eventProcPlaylist(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          this.confirmAction("close_list");
          break;
        case "song_list":
          {
            const tX = tParam.locH;
            const tY = tParam.locV;
            const tPlaylistManager = this.getComponent().getPlaylistManager();
            if (tPlaylistManager != 0) {
              if (tPlaylistManager.songListMouseClick(tX, tY)) {
                this.renderSongList();
              }
            }
          }
          break;
        case "playlist":
          {
            const tX = tParam.locH;
            const tY = tParam.locV;
            const tPlaylistManager = this.getComponent().getPlaylistManager();
            if (tPlaylistManager != 0) {
              if (tPlaylistManager.playlistMouseClick(tX, tY)) {
                this.renderPlaylist();
              }
            }
          }
          break;
        case "playlist_arrows":
          {
            const tX = tParam.locH;
            const tY = tParam.locV;
            const tPlaylistManager = this.getComponent().getPlaylistManager();
            if (tPlaylistManager != 0) {
              if (tPlaylistManager.playlistArrowMouseClick(tX, tY)) {
                this.renderPlaylist();
              }
            }
          }
          break;
        case "sound_machine_add_button":
          {
            const tPlaylistManager = this.getComponent().getPlaylistManager();
            if (tPlaylistManager != 0) {
              if (tPlaylistManager.addPlaylistSong()) {
                this.renderPlaylist();
              }
            }
          }
          break;
        case "sound_machine_edit_button":
          if (this.getComponent().openEditorSong()) {
            this.showSoundMachine();
          }
          break;
        case "sound_machine_new_button":
          if (this.getComponent().newEditorSong()) {
            this.showSoundMachine();
          }
          break;
        case "sound_machine_burn_button":
          this.confirmAction("burn", EMPTY);
          break;
        case "sound_machine_delete_button":
          this.confirmAction("delete", EMPTY);
          break;
        case "sound_machine_list_save_button":
          this.confirmAction("save_list", EMPTY);
          break;
      }
    } else {
      if (tEvent == Symbol.for("mouseWithin")) {
        switch (tSprID) {
          case "playlist":
            {
              const tX = tParam.locH;
              const tY = tParam.locV;
              const tPlaylistManager = this.getComponent().getPlaylistManager();
              if (tPlaylistManager != 0) {
                if (tPlaylistManager.playlistMouseOver(tX, tY)) {
                  this.renderPlaylist();
                }
              }
            }
            break;
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          switch (tSprID) {
            case "playlist":
              {
                const tPlaylistManager = this.getComponent().getPlaylistManager();
                if (tPlaylistManager != 0) {
                  if (tPlaylistManager.playlistMouseOver(1, -1000)) {
                    this.renderPlaylist();
                  }
                }
              }
              break;
          }
        }
      }
    }
    return 1;
  }

  eventProcJukebox(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          this.hideJukebox();
          break;
        case "disk_list":
          {
            const tJukeBoxManager = this.getComponent().getJukeBoxManager();
            if (tJukeBoxManager != 0) {
              const tX = tParam.locH;
              const tY = tParam.locV;
              if (tJukeBoxManager.diskListMouseClick(tX, tY)) {
                this.renderJukeboxDiskList();
              }
            }
          }
          break;
        case "jukebox_reset_button":
          this.getComponent().resetJukebox();
          break;
      }
    } else {
      if (tEvent == Symbol.for("mouseWithin")) {
        if (tSprID == "disk_list") {
          const tJukeBoxManager = this.getComponent().getJukeBoxManager();
          if (tJukeBoxManager != 0) {
            const tX = tParam.locH;
            const tY = tParam.locV;
            if (tJukeBoxManager.diskListMouseOver(tX, tY)) {
              this.renderJukeboxDiskList();
            }
          }
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          if (tSprID == "disk_list") {
            const tJukeBoxManager = this.getComponent().getJukeBoxManager();
            if (tJukeBoxManager != 0) {
              if (tJukeBoxManager.diskListMouseOver(-1, -1000)) {
                this.renderJukeboxDiskList();
              }
            }
          }
        }
      }
    }
    return 1;
  }

  eventProcJukeboxDisk(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
        case "jukebox_disk_cancel_button":
          this.hideJukeboxDisk();
          break;
        case "disk_list":
          {
            const tX = tParam.locH;
            const tY = tParam.locV;
            const tPlaylistManager = this.getComponent().getPlaylistManager();
            if (tPlaylistManager != 0) {
              if (tPlaylistManager.diskListMouseClick(tX, tY)) {
                this.renderUserDiskList(0);
              }
            }
          }
          break;
        case "jukebox_disk_add_button":
          this.getComponent().insertJukeboxDisk();
          this.hideJukeboxDisk();
          break;
      }
    }
    return 1;
  }

  eventProcSaveSong(tEvent, tSprID, tParam, tWndID) {
    const tWndObj = getWindow(this.pSaveSongWindowID);
    if (tWndObj == 0) {
      return 0;
    }
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
          this.hideSaveSong();
          break;
        case "sound_machine_song_save_button":
          {
            const tElem = tWndObj.getElement("sound_machine_song_name");
            if (tElem != 0) {
              const tSongName = tElem.getText();
              if (tSongName == EMPTY) {
                this.ShowAlert("song_name_missing");
                return 0;
              }
            }
            this.confirmAction("save", tSongName);
          }
          break;
        case "sound_machine_song_cancel_button":
          this.hideSaveSong();
          break;
      }
    }
    return 1;
  }

  eventProcConfirm(tEvent, tSprID, tParam, tWndID) {
    if (tEvent == Symbol.for("mouseUp")) {
      switch (tSprID) {
        case "close":
        case "habbo_decision_cancel":
          this.hideConfirm();
          break;
        case "habbo_decision_ok":
          this.getComponent().actionConfirmed();
          this.hideConfirm();
          break;
      }
    }
    return 1;
  }
}
