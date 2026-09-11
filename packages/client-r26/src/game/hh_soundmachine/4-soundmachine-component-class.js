export default class {
  pSoundMachineInstanceList;
  pTimelineInstance;
  pJukeboxManager;
  pSongControllerID;
  pSelectedSoundSet;
  pSelectedSoundSetSample;
  pHooveredSoundSet;
  pHooveredSoundSetSample;
  pHooveredSampleReady;
  pHooveredSoundSetTab;
  pSampleHorCount;
  pSampleVerCount;
  pSoundSetListPage;
  pSoundSetLimit;
  pSoundSetList;
  pSoundSetListPageSize;
  pSoundSetInventoryList;
  pTimeLineViewSlotCount;
  pTimeLineCursorX;
  pTimeLineCursorY;
  pTimeLineScrollX;
  pPlayHeadPosX;
  pDiskList;
  pSoundSetCount;
  pSoundSetInsertLocked;
  pEditorOpen;
  pEditFailure;
  pEditorSongStartTime;
  pEditorSongPlaying;
  pEditorSongLength;
  pEditorSongID;
  pTimeLineUpdateTimer;
  pRoomActivityUpdateTimer;
  pExternalSongTimer;
  pMusicIndexRoom;
  pMusicIndexEditor;
  pMusicIndexTop;
  pTimelineInstanceExternal;
  pExternalSongID;
  pSoundMachineFurniID;
  pConfirmedAction;
  pConfirmedActionParameter;
  pWriterID;
  pConnectionId;

  construct() {
    this.pSoundMachineInstanceList = propList();
    this.pTimelineInstance = createObject("timeline instance", getClassVariable("soundmachine.song.timeline"));
    unregisterObject("timeline instance");
    this.pTimelineInstanceExternal = createObject("timeline instance external", getClassVariable("soundmachine.song.timeline"));
    unregisterObject("timeline instance external");
    this.pJukeboxManager = createObject("jukebox manager", getClassVariable("soundmachine.jukebox.manager"));
    unregisterObject("jukebox manager");
    this.pMusicIndexRoom = 1;
    this.pMusicIndexEditor = this.pMusicIndexRoom + 10;
    this.pMusicIndexTop = this.pMusicIndexEditor + 10;
    this.pWriterID = getUniqueID();
    const tBold = getStructVariable("struct.font.plain");
    const tMetrics = propList("font", tBold.getaProp(Symbol.for("font")), "fontStyle", tBold.getaProp(Symbol.for("fontStyle")), "color", rgb("#B6DCDF"));
    createWriter(this.pWriterID, tMetrics);
    this.pTimeLineUpdateTimer = "sound_machine_timeline_timer";
    this.pRoomActivityUpdateTimer = "sound_machine_room_activity_timer";
    this.pExternalSongTimer = "sound_machine_external_song_timer";
    this.pDiskList = list();
    this.pConnectionId = getVariableValue("connection.info.id", Symbol.for("Info"));
    this.pSampleHorCount = 3;
    this.pSampleVerCount = 3;
    this.pSoundSetLimit = 4;
    this.pSoundSetListPageSize = 3;
    this.pTimeLineViewSlotCount = 24;
    this.pSongControllerID = "song controller";
    createObject(this.pSongControllerID, "Song Controller Class");
    this.reset(1);
    registerMessage(Symbol.for("sound_machine_selected"), this.getID(), Symbol.for("soundMachineSelected"));
    registerMessage(Symbol.for("jukebox_selected"), this.getID(), Symbol.for("jukeBoxSelected"));
    registerMessage(Symbol.for("sound_machine_set_state"), this.getID(), Symbol.for("soundMachineSetState"));
    registerMessage(Symbol.for("sound_machine_removed"), this.getID(), Symbol.for("soundMachineRemoved"));
    registerMessage(Symbol.for("sound_machine_created"), this.getID(), Symbol.for("soundMachineCreated"));
    registerMessage(Symbol.for("sound_machine_defined"), this.getID(), Symbol.for("soundMachineDefined"));
    registerMessage(Symbol.for("jukebox_defined"), this.getID(), Symbol.for("jukeBoxDefined"));
    registerMessage(Symbol.for("listen_song"), this.getID(), Symbol.for("listenSong"));
    registerMessage(Symbol.for("do_not_listen_song"), this.getID(), Symbol.for("stopListenSong"));
    registerMessage(Symbol.for("get_disk_data"), this.getID(), Symbol.for("getDiskData"));
    return 1;
  }

  deconstruct() {
    if (writerExists(this.pWriterID)) {
      removeWriter(this.pWriterID);
    }
    if (timeoutExists(this.pTimeLineUpdateTimer)) {
      removeTimeout(this.pTimeLineUpdateTimer);
    }
    if (timeoutExists(this.pRoomActivityUpdateTimer)) {
      removeTimeout(this.pRoomActivityUpdateTimer);
    }
    if (timeoutExists(this.pExternalSongTimer)) {
      removeTimeout(this.pExternalSongTimer);
    }
    this.pTimelineInstance.deconstruct();
    this.pTimelineInstanceExternal.deconstruct();
    this.pJukeboxManager.deconstruct();
    unregisterMessage(Symbol.for("sound_machine_selected"), this.getID());
    unregisterMessage(Symbol.for("jukebox_selected"), this.getID());
    unregisterMessage(Symbol.for("sound_machine_set_state"), this.getID());
    unregisterMessage(Symbol.for("sound_machine_removed"), this.getID());
    unregisterMessage(Symbol.for("sound_machine_created"), this.getID());
    unregisterMessage(Symbol.for("sound_machine_defined"), this.getID());
    unregisterMessage(Symbol.for("jukebox_defined"), this.getID());
    unregisterMessage(Symbol.for("listen_song"), this.getID());
    unregisterMessage(Symbol.for("do_not_listen_song"), this.getID());
    unregisterMessage(Symbol.for("get_disk_data"), this.getID());
    return 1;
  }

  reset(tInitialReset) {
    this.pEditFailure = 0;
    this.pExternalSongID = VOID;
    this.pSoundSetCount = VOID;
    this.closeEdit(tInitialReset);
  }

  resetJukebox() {
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("RESET_JUKEBOX");
    }
  }

  initializeEdit() {
    this.clearTimeLine();
    this.roomActivityUpdate(1);
    this.pEditorOpen = 1;
    this.pSoundSetCount = VOID;
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      const tSongData = this.pTimelineInstance.getSilentSongData();
      tSongController.playSong(this.pMusicIndexEditor - 1, tSongData, 1);
    }
  }

  closeEdit(tInitialReset) {
    this.stopEditorSong();
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      tSongController.stopSong(this.pMusicIndexEditor - 1);
    }
    this.pEditorSongID = 0;
    this.pEditorOpen = 0;
    this.pHooveredSampleReady = 1;
    this.pSelectedSoundSet = 0;
    this.pSelectedSoundSetSample = 0;
    this.pHooveredSoundSet = 0;
    this.pHooveredSoundSetSample = 0;
    this.pHooveredSoundSetTab = 0;
    this.pSoundSetListPage = 1;
    this.pTimeLineCursorX = 0;
    this.pTimeLineCursorY = 0;
    this.pTimeLineScrollX = 0;
    this.pPlayHeadPosX = 0;
    this.pConfirmedAction = EMPTY;
    this.pConfirmedActionParameter = EMPTY;
    this.pSoundSetInsertLocked = 0;
    this.pEditorSongLength = 0;
    this.clearTimeLine();
    this.clearSoundSets();
    this.pSoundSetInventoryList = list();
    if (!tInitialReset && !this.pEditFailure) {
      if (getConnection(this.pConnectionId) != 0) {
        return getConnection(this.pConnectionId).send("SONG_EDIT_CLOSE");
      }
    }
    return 1;
  }

  closeSelectAction() {
    this.pSoundMachineFurniID = 0;
  }

  confirmAction(tAction, tParameter) {
    this.pConfirmedAction = tAction;
    this.pConfirmedActionParameter = tParameter;
    switch (tAction) {
      case "eject":
        {
          const tReferences = this.checkSoundSetReferences(tParameter);
          if (tReferences) {
            return 1;
          }
        }
        break;
      case "close":
        if (this.pTimelineInstance.getChanged()) {
          return 1;
        }
        break;
      case "clear":
        return 1;
      case "save":
        if (tParameter == this.pTimelineInstance.getSongName()) {
          return 1;
        }
        break;
      case "delete":
        return 1;
      case "burn":
        return 1;
      case "save_list":
        return 1;
      case "close_list":
        {
          const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
          if (tPlaylistManager == 0) {
            return 0;
          }
          if (tPlaylistManager.getPlaylistChanged()) {
            return 1;
          }
        }
        break;
    }
    this.actionConfirmed();
    return 0;
  }

  actionConfirmed() {
    let tRetVal = 0;
    switch (this.pConfirmedAction) {
      case "eject":
        if (this.checkSoundSetReferences(this.pConfirmedActionParameter)) {
          this.stopEditorSong();
        }
        tRetVal = this.removeSoundSet(this.pConfirmedActionParameter);
        if (tRetVal) {
          this.getInterface().renderTimeLine();
        }
        break;
      case "close":
        if (this.getInterface().hideSoundMachine()) {
          this.getInterface().showPlaylist();
        }
        break;
      case "clear":
        this.clearTimeLine();
        this.stopEditorSong();
        this.getInterface().renderTimeLine();
        break;
      case "save":
        this.saveEditorSong(this.pConfirmedActionParameter);
        this.getInterface().hideSaveSong();
        break;
      case "delete":
        {
          const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
          if (tPlaylistManager == 0) {
            tRetVal = 0;
          } else {
            if (tPlaylistManager.deleteSong()) {
              this.getInterface().renderSongList();
            }
          }
        }
        break;
      case "burn":
        {
          const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
          if (tPlaylistManager == 0) {
            tRetVal = 0;
          } else {
            tPlaylistManager.burnSong();
          }
        }
        break;
      case "save_list":
        {
          const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
          if (tPlaylistManager == 0) {
            tRetVal = 0;
          } else {
            tPlaylistManager.savePlaylist();
          }
        }
        break;
      case "close_list":
        this.getInterface().hidePlaylist();
        this.closeSelectAction();
        break;
    }
    this.pConfirmedAction = EMPTY;
    this.pConfirmedActionParameter = EMPTY;
    return tRetVal;
  }

  getSoundSetLimit() {
    return this.pSoundSetLimit;
  }

  getSoundSetListPageSize() {
    return this.pSoundSetListPageSize;
  }

  getSoundSetID(tIndex) {
    if ((tIndex < 1) || (tIndex > this.pSoundSetList.count)) {
      return 0;
    }
    if (voidp(this.pSoundSetList[tIndex])) {
      return 0;
    }
    return this.pSoundSetList[tIndex][Symbol.for("id")];
  }

  getSoundSetListID(tIndex) {
    tIndex = tIndex + ((this.pSoundSetListPage - 1) * this.pSoundSetListPageSize);
    if ((tIndex < 1) || (tIndex > this.pSoundSetInventoryList.count)) {
      return 0;
    }
    return this.pSoundSetInventoryList[tIndex][Symbol.for("id")];
  }

  getSoundSetHooveredTab() {
    return this.pHooveredSoundSetTab;
  }

  getSoundListPage() {
    return this.pSoundSetListPage;
  }

  getSoundListPageCount() {
    return 1 + ((this.pSoundSetInventoryList.count() - 1) / this.pSoundSetListPageSize);
  }

  getHooveredSampleReady() {
    return this.pHooveredSampleReady;
  }

  getTimeLineSlotLength() {
    return this.pTimelineInstance.getSlotDuration();
  }

  getTimeLineViewSlotCount() {
    return this.pTimeLineViewSlotCount;
  }

  getTimeString(tSeconds) {
    let tStr;
    if (tSeconds < 60) {
      tStr = getText("sound_machine_time_1");
    } else {
      tStr = getText("sound_machine_time_2");
    }
    const tMinStr = string(tSeconds / 60);
    let tSecStr;
    if ((tSeconds % 60) != 0) {
      tSecStr = string(tSeconds % 60);
      if (tSecStr.length == 1) {
        tSecStr = `0${tSecStr}`;
      }
    } else {
      tSecStr = "00";
    }
    tStr = replaceChunks(tStr, "%min%", tMinStr);
    tStr = replaceChunks(tStr, "%sec%", tSecStr);
    return tStr;
  }

  getTimeStringBasic(tSeconds) {
    const tMinStr = string(tSeconds / 60);
    let tSecStr;
    if ((tSeconds % 60) != 0) {
      tSecStr = string(tSeconds % 60);
      if (tSecStr.length == 1) {
        tSecStr = `0${tSecStr}`;
      }
    } else {
      tSecStr = "00";
    }
    return `${tMinStr}:${tSecStr}`;
  }

  getSoundSetName(tID) {
    return getText(`furni_sound_set_${tID}_name`);
  }

  getEditorSongName() {
    return this.pTimelineInstance.getSongName();
  }

  getCanSaveSong() {
    if (this.pTimelineInstance.encodeTimeLineData() != 0) {
      return 1;
    }
    return 0;
  }

  getCanInsertDisk() {
    if (this.pDiskList.count > 0) {
      return 1;
    }
    return 0;
  }

  getEditorPlayTime() {
    if (!this.pEditorSongPlaying) {
      return 0;
    }
    let tTime = (the.milliSeconds + 30 - this.pEditorSongStartTime) % (this.getTimeLineSlotLength() * this.pEditorSongLength);
    if (tTime == 0) {
      tTime = 1;
    }
    return tTime;
  }

  getPlayHeadPosition() {
    const tPlayTime = this.getEditorPlayTime();
    const tSlotLength = this.getTimeLineSlotLength();
    let tPos;
    if (this.pEditorSongPlaying) {
      tPos = ((tPlayTime / tSlotLength) + this.pPlayHeadPosX) % this.pEditorSongLength;
    } else {
      tPos = ((tPlayTime / tSlotLength) + this.pPlayHeadPosX) % this.pTimelineInstance.getSlotCount();
    }
    tPos = 1 + tPos - this.pTimeLineScrollX;
    if ((tPos < 1) || (tPos > this.pTimeLineViewSlotCount)) {
      return -(tPos + this.pTimeLineScrollX);
    }
    return tPos;
  }

  movePlayHead(tPos) {
    if (this.pEditorSongPlaying) {
      return 0;
    }
    tPos = tPos - 1;
    if (tPos != (this.pPlayHeadPosX - this.pTimeLineScrollX)) {
      if ((tPos >= 0) && (tPos < this.pTimeLineViewSlotCount)) {
        this.pPlayHeadPosX = tPos + this.pTimeLineScrollX;
        return 1;
      } else {
        if (tPos < 0) {
          this.scrollTimeLine(-1);
          if (this.pPlayHeadPosX != this.pTimeLineScrollX) {
            this.pPlayHeadPosX = this.pTimeLineScrollX;
            return 1;
          }
        } else {
          this.scrollTimeLine(1);
          if (this.pPlayHeadPosX != (this.pTimeLineScrollX + this.pTimeLineViewSlotCount - 1)) {
            this.pPlayHeadPosX = this.pTimeLineScrollX + this.pTimeLineViewSlotCount - 1;
            return 1;
          }
        }
      }
    }
    return 0;
  }

  scrollTimeLine(tDX) {
    const tScrollX = max(0, min(this.pTimeLineScrollX + tDX, this.pTimelineInstance.getSlotCount() - this.pTimeLineViewSlotCount));
    if (tScrollX != this.pTimeLineScrollX) {
      this.pTimeLineScrollX = tScrollX;
      return 1;
    }
    return 0;
  }

  scrollTimeLineTo(tX) {
    const tScrollX = max(0, min(tX, this.pTimelineInstance.getSlotCount() - this.pTimeLineViewSlotCount));
    if (tScrollX != this.pTimeLineScrollX) {
      this.pTimeLineScrollX = tScrollX;
      return 1;
    }
    return 0;
  }

  getScrollPossible(tDX) {
    if (tDX < 0) {
      if (this.pTimeLineScrollX > 0) {
        return 1;
      }
    }
    if (tDX > 0) {
      if (this.pTimeLineScrollX < (this.pTimelineInstance.getSlotCount() - this.pTimeLineViewSlotCount)) {
        return 1;
      }
    }
    return 0;
  }

  soundMachineSelected(tdata) {
    const tFurniID = tdata[Symbol.for("id")];
    const tFurniOn = tdata[Symbol.for("furniOn")];
    const tResult = this.getInterface().soundMachineSelected(tFurniOn);
    if (tResult) {
      this.pSoundMachineFurniID = tFurniID;
    }
  }

  jukeBoxSelected(tdata) {
    const tFurniID = tdata[Symbol.for("id")];
    const towner = tdata[Symbol.for("owner")];
    const tJukeBoxManager = this.getJukeBoxManager(tFurniID);
    if (tJukeBoxManager != 0) {
      tJukeBoxManager.setOwner(towner);
    }
    const tResult = this.getInterface().showJukebox();
    if (tResult) {
      this.pSoundMachineFurniID = tFurniID;
    }
  }

  soundMachineSetState(tdata) {
    const tFurniID = tdata[Symbol.for("id")];
    const tFurniOn = tdata[Symbol.for("furniOn")];
    if (this.pEditorOpen) {
      this.soundMachineSelected(propList("id", tFurniID, "furniOn", tFurniOn));
    }
    const tSoundMachine = this.getSoundMachine(tFurniID);
    if (tSoundMachine == 0) {
      return error(this, "Instance not found", Symbol.for("soundMachineSetState"), Symbol.for("major"));
    }
    tSoundMachine.setState(tFurniOn);
    return 1;
  }

  soundMachineRemoved(tFurniID) {
    const tSoundMachine = this.pSoundMachineInstanceList.getaProp(tFurniID);
    if (!voidp(tSoundMachine)) {
      this.stopSong();
      removeObject(`sound machine ${tFurniID}`);
      this.pSoundMachineInstanceList.deleteProp(tFurniID);
      this.pSoundMachineFurniID = 0;
      this.getInterface().hideWindows();
    }
  }

  soundMachineCreated(tFurniID, tLooping) {
    if (this.pSoundMachineInstanceList.count > 0) {
      return 0;
    }
    let tSoundMachine = this.getSoundMachine(tFurniID);
    if (tSoundMachine == 0) {
      tSoundMachine = createObject(`sound machine ${tFurniID}`, getClassVariable("soundmachine.instance"));
      if (tSoundMachine == 0) {
        return 0;
      }
      tSoundMachine.setLooping(tLooping);
      tSoundMachine.setPlayStackIndex(this.pMusicIndexRoom);
      this.pSoundMachineInstanceList.addProp(tFurniID, tSoundMachine);
    }
    return 1;
  }

  soundMachineDefined(tFurniID) {
    const tSoundMachine = this.getSoundMachine(tFurniID);
    if (tSoundMachine == 0) {
      return error(this, "Instance not found", Symbol.for("soundMachineDefined"), Symbol.for("major"));
    }
    if (!tSoundMachine.Initialize(tFurniID)) {
      return 0;
    }
    const tPlaylistManager = tSoundMachine.getPlaylistManager();
    if (tPlaylistManager == 0) {
      return 0;
    }
    return tPlaylistManager.getPlaylistData();
  }

  jukeBoxDefined(tFurniID) {
    const tSoundMachine = this.getSoundMachine(tFurniID);
    if (tSoundMachine == 0) {
      return error(this, "Instance not found", Symbol.for("soundMachineDefined"), Symbol.for("major"));
    }
    if (!tSoundMachine.Initialize(tFurniID)) {
      return 0;
    }
    const tPlaylistManager = tSoundMachine.getPlaylistManager();
    const tJukeBoxManager = this.getJukeBoxManager();
    if ((tPlaylistManager == 0) || (tJukeBoxManager == 0)) {
      return 0;
    }
    tPlaylistManager.getPlaylistData();
    tJukeBoxManager.getJukeboxDisks();
  }

  changeFurniState() {
    const tSoundMachine = this.getSoundMachine(this.pSoundMachineFurniID);
    if (tSoundMachine == 0) {
      return 0;
    }
    const tNewState = !tSoundMachine.getState();
    const tObj = getThread(Symbol.for("room")).getComponent().getActiveObject(this.pSoundMachineFurniID);
    if (tObj != 0) {
      call(Symbol.for("changeState"), [tObj], tNewState);
    }
    this.pSoundMachineFurniID = 0;
  }

  getSoundMachine(tFurniID) {
    if (this.pSoundMachineInstanceList.count == 0) {
      return 0;
    }
    return this.pSoundMachineInstanceList[1];
  }

  getPlaylistManager(tFurniID) {
    const tSoundMachine = this.getSoundMachine(tFurniID);
    if (tSoundMachine == 0) {
      return 0;
    }
    return tSoundMachine.getPlaylistManager();
  }

  getJukeBoxManager(tFurniID) {
    return this.pJukeboxManager;
  }

  soundSetEvent(tSetID, tX, tY, tEvent) {
    if ((tX >= 1) && (tX <= this.pSampleHorCount) && (tY >= 1) && (tY <= this.pSampleVerCount) && (tSetID >= 1) && (tSetID <= this.pSoundSetLimit)) {
      if (tEvent == Symbol.for("mouseDown")) {
        const tSampleIndex = tX + ((tY - 1) * this.pSampleHorCount);
        if (!this.getSampleReady(tSampleIndex, tSetID)) {
          return 0;
        }
        if ((this.pSelectedSoundSet == tSetID) && (this.pSelectedSoundSetSample == tSampleIndex)) {
          this.pSelectedSoundSet = 0;
          this.pSelectedSoundSetSample = 0;
        } else {
          this.pSelectedSoundSet = tSetID;
          this.pSelectedSoundSetSample = tSampleIndex;
        }
      } else {
        if (tEvent == Symbol.for("mouseWithin")) {
          const tSample = tX + ((tY - 1) * this.pSampleHorCount);
          if ((this.pHooveredSoundSet == tSetID) && (this.pHooveredSoundSetSample == tSample)) {
            return 0;
          }
          this.pHooveredSoundSet = tSetID;
          this.pHooveredSoundSetSample = tX + ((tY - 1) * this.pSampleHorCount);
          this.pHooveredSampleReady = this.getSampleReady(this.pHooveredSoundSetSample, this.pHooveredSoundSet);
          if (this.pHooveredSampleReady) {
            this.playSample(this.pHooveredSoundSetSample, this.pHooveredSoundSet);
          }
        } else {
          if (tEvent == Symbol.for("mouseLeave")) {
            this.pHooveredSoundSet = 0;
            this.pHooveredSoundSetSample = 0;
            this.pHooveredSampleReady = 1;
            this.stopSample();
          }
        }
      }
      return 1;
    }
    return 0;
  }

  soundSetTabEvent(tSetID, tEvent) {
    if ((tSetID >= 1) && (tSetID <= this.pSoundSetLimit)) {
      if (tEvent == Symbol.for("mouseDown")) {
        const tConfirm = this.getInterface().confirmAction("eject", tSetID);
        return !tConfirm;
      } else {
        if (tEvent == Symbol.for("mouseWithin")) {
          if (tSetID == this.pHooveredSoundSetTab) {
            return 0;
          }
          this.pHooveredSoundSetTab = tSetID;
        } else {
          if (tEvent == Symbol.for("mouseLeave")) {
            this.pHooveredSoundSetTab = 0;
          }
        }
      }
      return 1;
    }
    return 0;
  }

  timeLineEvent(tX, tY, tEvent) {
    tX = tX + this.pTimeLineScrollX;
    if (tEvent == Symbol.for("mouseDown")) {
      const tInsert = this.insertSample(tX, tY);
      if (tInsert) {
        this.pTimeLineCursorX = 0;
        this.pTimeLineCursorY = 0;
        return 1;
      } else {
        return this.removeSample(tX, tY);
      }
    } else {
      if (tEvent == Symbol.for("mouseWithin")) {
        if ((tX != this.pTimeLineCursorX) || (tY != this.pTimeLineCursorY)) {
          let tID = 0;
          const tSample = this.getSample(this.pSelectedSoundSetSample, this.pSelectedSoundSet);
          if (tSample != 0) {
            tID = tSample[Symbol.for("id")];
          }
          const tInsert = this.getCanInsertSample(tX, tY, tID);
          if (tInsert && ((this.pTimeLineCursorX != tX) || (this.pTimeLineCursorY != tY))) {
            this.pTimeLineCursorX = tX;
            this.pTimeLineCursorY = tY;
            return 1;
          } else {
            if ((this.pTimeLineCursorX != 0) && (this.pTimeLineCursorY != 0)) {
              this.pTimeLineCursorX = 0;
              this.pTimeLineCursorY = 0;
              return 1;
            }
          }
        }
      } else {
        if (tEvent == Symbol.for("mouseLeave")) {
          if ((tX < 1) || (tX > this.pTimelineInstance.getSlotCount()) || (tY < 1) || (tY > this.pTimelineInstance.getChannelCount())) {
            this.pTimeLineCursorX = 0;
            this.pTimeLineCursorY = 0;
            return 1;
          }
        }
      }
    }
    return 0;
  }

  renderUserDiskList(tInitialRender) {
    const tPlaylistManager = this.getPlaylistManager();
    if (tPlaylistManager != 0) {
      if (tInitialRender) {
        tPlaylistManager.setDiskList(this.pDiskList.duplicate());
      }
      return tPlaylistManager.renderDiskList();
    }
    return 0;
  }

  renderSoundSet(tIndex, tWd, tHt, tMarginWd, tMarginHt, tNameBase, tSampleNameBase) {
    if ((tIndex < 0) || (tIndex > this.pSoundSetList.count)) {
      return 0;
    }
    if (voidp(this.pSoundSetList[tIndex])) {
      return 0;
    }
    const tImg = image((this.pSampleHorCount * tWd) + (tMarginWd * (this.pSampleHorCount - 1)), (this.pSampleVerCount * tHt) + (tMarginHt * (this.pSampleVerCount - 1)), 32);
    const tSampleList = this.pSoundSetList[tIndex][Symbol.for("samples")];
    if (voidp(tSampleList)) {
      return 0;
    }
    for (let tSample = 1; tSample <= tSampleList.count; tSample++) {
      const tX = 1 + ((tSample - 1) % this.pSampleHorCount);
      const tY = 1 + ((tSample - 1) / this.pSampleVerCount);
      if (tY > this.pSampleVerCount) {
        break;
      }
      let ttype = 1;
      if ((tIndex == this.pSelectedSoundSet) && (tSample == this.pSelectedSoundSetSample)) {
        ttype = 3;
      } else {
        if ((tIndex == this.pHooveredSoundSet) && (tSample == this.pHooveredSoundSetSample)) {
          ttype = 2;
        }
      }
      const tName = list(`${tNameBase}${ttype}`, `${tSampleNameBase}${tSample}`);
      for (let tPart = 1; tPart <= tName.count; tPart++) {
        const tmember = getMember(tName[tPart]);
        if (tmember != 0) {
          const tSourceImg = tmember.image;
          const tRect = tSourceImg.rect;
          const tImgWd = tRect[3] - tRect[1];
          const tImgHt = tRect[4] - tRect[2];
          tRect[1] = tRect[1] + ((tX - 1) * (tWd + tMarginWd)) + ((tWd - tImgWd) / 2);
          tRect[2] = tRect[2] + ((tY - 1) * (tHt + tMarginHt)) + ((tHt - tImgHt) / 2);
          tRect[3] = tRect[3] + ((tX - 1) * (tWd + tMarginWd)) + ((tWd - tImgWd) / 2);
          tRect[4] = tRect[4] + ((tY - 1) * (tHt + tMarginHt)) + ((tHt - tImgHt) / 2);
          tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, propList("ink", 8, "maskImage", tSourceImg.createMatte()));
        }
      }
    }
    return tImg;
  }

  renderTimeLine(tWd, tHt, tMarginWd, tMarginHt, tNameBaseList, tSampleNameBase, tBgImage) {
    const tImg = image((this.pTimeLineViewSlotCount * tWd) + (tMarginWd * (this.pTimeLineViewSlotCount - 1)), (this.pTimelineInstance.getChannelCount() * (tHt + tMarginHt)) - tMarginHt, 32);
    const tmember = getMember(tBgImage);
    if (tmember != 0) {
      tImg.copyPixels(tmember.image, tImg.rect, tmember.image.rect);
    }
    const tTimeLineData = this.pTimelineInstance.getTimeLineData();
    for (let tChannel = 1; tChannel <= tTimeLineData.count; tChannel++) {
      const tChannelData = tTimeLineData[tChannel];
      for (let tSlot = max(1, this.pTimeLineScrollX - 10); tSlot <= min(this.pTimeLineScrollX + this.pTimeLineViewSlotCount, tChannelData.count); tSlot++) {
        if (!voidp(tChannelData[tSlot])) {
          const tSampleNumber = tChannelData[tSlot];
          if (!this.renderSample(tSampleNumber, tSlot - this.pTimeLineScrollX, tChannel, tWd, tHt, tMarginWd, tMarginHt, tNameBaseList, tSampleNameBase, tImg)) {
          }
        }
      }
    }
    if ((this.pTimeLineCursorX != 0) && (this.pTimeLineCursorY != 0)) {
      const tSample = this.getSample(this.pSelectedSoundSetSample, this.pSelectedSoundSet);
      if (tSample != 0) {
        const tCursorX = this.pTimeLineCursorX - this.pTimeLineScrollX;
        const tCursorY = this.pTimeLineCursorY;
        if (!this.renderSample(tSample[Symbol.for("id")], tCursorX, tCursorY, tWd, tHt, tMarginWd, tMarginHt, tNameBaseList, tSampleNameBase, tImg, 50)) {
        }
      }
    }
    return tImg;
  }

  renderSample(tSampleNumber, tSlot, tChannel, tWd, tHt, tMarginWd, tMarginHt, tNameBaseList, tSampleNameBase, tImg, tBlend) {
    let tLength = this.pTimelineInstance.getSampleLength(tSampleNumber);
    if (tSampleNumber < 0) {
      tBlend = 20;
      tSampleNumber = -tSampleNumber;
    }
    const tSampleSet = this.getSampleSetNumber(tSampleNumber);
    const tSampleIndex = this.getSampleIndex(tSampleNumber);
    const tSample = this.getSample(tSampleIndex, tSampleSet);
    if (tSample == 0) {
      return 0;
    }
    if (voidp(tBlend)) {
      tBlend = 100;
    }
    if ((tSampleSet < 1) || (tSampleSet > tNameBaseList.count)) {
      return 0;
    }
    const tNameBase = tNameBaseList[tSampleSet];
    const tName = list(`${tNameBase}1`, `${tSampleNameBase}${tSampleIndex}`);
    const tstart = max(1, tSlot);
    const tEnd = min(this.pTimeLineViewSlotCount, tSlot + tLength - 1);
    for (let tPart = 1; tPart <= tName.count; tPart++) {
      const tmember = getMember(tName[tPart]);
      if (tmember != 0) {
        const tSourceImg = tmember.image;
        const tRectOrig = tSourceImg.rect;
        const tImgWd = tRectOrig[3] - tRectOrig[1];
        const tImgHt = tRectOrig[4] - tRectOrig[2];
        tRectOrig[2] = tRectOrig[2] + ((tChannel - 1) * (tHt + tMarginHt)) + ((tHt - tImgHt) / 2);
        tRectOrig[4] = tRectOrig[4] + ((tChannel - 1) * (tHt + tMarginHt)) + ((tHt - tImgHt) / 2);
        const tProps = propList("ink", 8, "maskImage", tSourceImg.createMatte(), "blend", tBlend);
        for (let tPos = tstart; tPos <= tEnd; tPos++) {
          const tRect = tRectOrig.duplicate();
          tRect[1] = tRect[1] + ((tPos - 1) * (tWd + tMarginWd)) + ((tWd - tImgWd) / 2);
          tRect[3] = tRect[3] + ((tPos - 1) * (tWd + tMarginWd)) + ((tWd - tImgWd) / 2);
          tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, tProps);
        }
        continue;
      }
      return 0;
    }
    const tName2 = `${tNameBase}sp`;
    const tmember = getMember(tName2);
    if (tmember != 0) {
      const tSourceImg = tmember.image;
      const tRectOrig = tSourceImg.rect;
      const tImgWd = tRectOrig[3] - tRectOrig[1];
      const tImgHt = tRectOrig[4] - tRectOrig[2];
      tRectOrig[2] = tRectOrig[2] + ((tChannel - 1) * (tHt + tMarginHt)) + ((tHt - tImgHt) / 2);
      tRectOrig[4] = tRectOrig[4] + ((tChannel - 1) * (tHt + tMarginHt)) + ((tHt - tImgHt) / 2);
      const tProps = propList("ink", 8, "maskImage", tSourceImg.createMatte(), "blend", tBlend);
      for (let tPos = max(0, tSlot); tPos <= min(this.pTimeLineViewSlotCount, tSlot + tLength - 2); tPos++) {
        const tRect = tRectOrig.duplicate();
        tRect[1] = tRect[1] + (tPos * (tWd + tMarginWd)) - (tImgWd / 2);
        tRect[3] = tRect[3] + (tPos * (tWd + tMarginWd)) - (tImgWd / 2);
        tImg.copyPixels(tSourceImg, tRect, tSourceImg.rect, tProps);
      }
    } else {
      return 0;
    }
    return 1;
  }

  renderTimeLineBar(tWd, tHt, tMarginWd, tNameBaseList, tSampleNameBase, tBgImage) {
    const tImg = image((this.pTimeLineViewSlotCount * tWd) + (tMarginWd * (this.pTimeLineViewSlotCount - 1)), tHt, 32);
    const tImgHt = tImg.rect[4] - tImg.rect[2];
    const tWriterObj = getWriter(this.pWriterID);
    if (tWriterObj == 0) {
      return tImg;
    }
    const tstart = max(0, this.pTimeLineScrollX + 1);
    const tEnd = min(this.pTimeLineScrollX + this.pTimeLineViewSlotCount - 1, this.pTimelineInstance.getSlotCount());
    const tTimeLineSlotLength = this.getTimeLineSlotLength();
    for (let tSlot = tstart; tSlot <= tEnd; tSlot++) {
      if ((tSlot * tTimeLineSlotLength % 10000) == 0) {
        const tOffset = rect((tWd + tMarginWd) * (tSlot - this.pTimeLineScrollX), 0, (tWd + tMarginWd) * (tSlot - this.pTimeLineScrollX), 0);
        const tSeconds = tSlot * tTimeLineSlotLength / 1000;
        const tStr = this.getTimeString(tSeconds);
        const tStampImg = tWriterObj.render(tStr).duplicate();
        const tStampImgTrimmed = image(tStampImg.rect[3], tStampImg.rect[4], 32);
        tStampImgTrimmed.copyPixels(tStampImg, tStampImg.rect, tStampImg.rect, propList("ink", 8, "maskImage", tStampImg.createMatte()));
        const tStampImg2 = tStampImgTrimmed.trimWhiteSpace();
        tOffset[1] = tOffset[1] - ((tStampImg2.rect[3] - tStampImg2.rect[1]) / 2);
        tOffset[3] = tOffset[1];
        tOffset[2] = (tImgHt - (tStampImg2.rect[4] - tStampImg2.rect[2])) / 2;
        tOffset[4] = tOffset[2];
        tImg.copyPixels(tStampImg2, tStampImg2.rect + tOffset, tStampImg2.rect, propList("ink", 8, "maskImage", tStampImg2.createMatte()));
      }
    }
    return tImg;
  }

  parseSongList(tMsg) {
    const tID = 1;
    const tPlaylistManager = this.getPlaylistManager(tID);
    if (tPlaylistManager == 0) {
      return 0;
    }
    const tRetVal = tPlaylistManager.parseSongList(tMsg);
    this.getInterface().updatePlaylists();
    return tRetVal;
  }

  parsePlaylist(tMsg) {
    this.stopSong();
    const tID = 1;
    const tSoundMachine = this.getSoundMachine(tID);
    if (tSoundMachine == 0) {
      return 0;
    }
    const tRetVal = tSoundMachine.parsePlaylist(tMsg);
    this.getInterface().updatePlaylists();
    return tRetVal;
  }

  getUserDisks() {
    this.pDiskList = list();
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("GET_USER_SONG_DISCS");
    }
    return 0;
  }

  parseUserDisks(tMsg) {
    this.pDiskList = list();
    const tCount = tMsg.connection.GetIntFrom();
    for (let i = 1; i <= tCount; i++) {
      const tID = tMsg.connection.GetIntFrom();
      let tName = tMsg.connection.GetStrFrom();
      tName = convertSpecialChars(tName, 0);
      const tDisk = propList("id", tID, "name", tName);
      this.pDiskList.add(tDisk);
    }
    return 1;
  }

  parseJukeboxDisks(tMsg) {
    const tID = 1;
    const tJukeBoxManager = this.getJukeBoxManager(tID);
    if (tJukeBoxManager == 0) {
      return 0;
    }
    const tRetVal = tJukeBoxManager.parseDiskList(tMsg);
    this.getInterface().renderJukeboxDiskList();
    return tRetVal;
  }

  insertPlaylistSong(tSongID, tLength, tName, tAuthor) {
    const tID = 1;
    const tSoundMachine = this.getSoundMachine(tID);
    if (tSoundMachine == 0) {
      return 0;
    }
    return tSoundMachine.insertPlaylistSong(tSongID, tLength, tName, tAuthor);
  }

  insertJukeboxDisk() {
    const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
    if (tPlaylistManager == 0) {
      return 0;
    }
    const tIndex = tPlaylistManager.getSelectedDiskIndex();
    if ((tIndex < 1) || (tIndex > this.pDiskList.count)) {
      return 0;
    }
    const tDiskID = this.pDiskList[tIndex][Symbol.for("id")];
    this.pDiskList.deleteAt(tIndex);
    const tID = 1;
    const tJukeBoxManager = this.getJukeBoxManager(tID);
    if (tJukeBoxManager == 0) {
      return 0;
    }
    return tJukeBoxManager.insertDisk(tDiskID);
  }

  handleMissingPackages(tList) {
    this.pEditFailure = 1;
    this.getInterface().hideSoundMachine();
    this.pEditFailure = 0;
    let tStr = RETURN;
    for (let i = 1; i <= tList.count; i++) {
      tStr = `${tStr}${RETURN} ${this.getSoundSetName(tList[i])}`;
    }
    this.getInterface().ShowAlert("missing_packages", tStr);
  }

  handleListFull(tCount, tListType) {
    if (tListType == "songlist") {
      const tID = this.pTimelineInstance.getSongID();
      if (tID == 0) {
        this.pEditFailure = 1;
        this.getInterface().hideSoundMachine();
        this.pEditFailure = 0;
      }
      this.getInterface().showAlertWithCount("no_more_songs", tCount);
    } else {
      if (tListType == "playlist") {
        this.getInterface().showAlertWithCount("playlist_full", tCount);
      }
    }
  }

  handleInvalidSongName() {
    this.getInterface().ShowAlert("invalid_song_name");
  }

  handleSongLocked() {
    this.getInterface().ShowAlert("song_locked");
  }

  handleJukeBoxPlaylistFull() {
    this.getInterface().ShowAlert("jukebox_list_full");
  }

  handleInvalidSongLength() {
    this.getInterface().ShowAlert("invalid_song_length");
  }

  updateSetList(tList) {
    this.pSoundSetInventoryList = list();
    for (const tID of tList) {
      const tItem = propList("id", tID);
      this.pSoundSetInventoryList.add(tItem);
    }
    this.changeSetListPage(0);
    this.getInterface().updateSoundSetList();
    if (!voidp(this.pSoundSetCount)) {
      this.pSoundSetCount = this.pSoundSetCount + tList.count;
      if (this.pSoundSetCount == 0) {
        this.getInterface().ShowAlert("no_sound_sets");
      }
    } else {
      this.pSoundSetCount = tList.count;
    }
  }

  changeSetListPage(tChange) {
    let tIndex = this.pSoundSetListPage + tChange;
    if (tIndex < 1) {
      tIndex = this.getSoundListPageCount();
    } else {
      if (tIndex > this.getSoundListPageCount()) {
        tIndex = 1;
      }
    }
    if (tIndex == this.pSoundSetListPage) {
      return 0;
    }
    this.pSoundSetListPage = tIndex;
    return 1;
  }

  loadSoundSet(tIndex) {
    tIndex = tIndex + ((this.pSoundSetListPage - 1) * this.pSoundSetListPageSize);
    if ((tIndex < 1) || (tIndex > this.pSoundSetInventoryList.count)) {
      return 0;
    }
    if (this.pSoundSetInsertLocked) {
      return 0;
    }
    let tFreeSlot = 0;
    for (let i = 1; i <= this.pSoundSetList.count; i++) {
      if (this.pSoundSetList[i] == VOID) {
        tFreeSlot = i;
        break;
      }
    }
    if (tFreeSlot == 0) {
      return 0;
    }
    const tSoundSet = this.pSoundSetInventoryList[tIndex];
    const tSetID = tSoundSet[Symbol.for("id")];
    if (getConnection(this.pConnectionId) != 0) {
      this.pSoundSetInventoryList.deleteAt(tIndex);
      this.pSoundSetInsertLocked = 1;
      return getConnection(this.pConnectionId).send("INSERT_SOUND_PACKAGE", propList("integer", tSetID, "integer", tFreeSlot));
    } else {
      return 0;
    }
  }

  removeSoundSet(tIndex) {
    const tID = this.getSoundSetID(tIndex);
    if (tID == 0) {
      return 0;
    }
    this.pTimelineInstance.soundSetRemoved(tID);
    if (this.pSelectedSoundSet == tIndex) {
      this.pSelectedSoundSet = 0;
      this.pSelectedSoundSetSample = 0;
    }
    if (getConnection(this.pConnectionId) != 0) {
      this.pSoundSetList[tIndex] = VOID;
      return getConnection(this.pConnectionId).send("EJECT_SOUND_PACKAGE", propList("integer", tIndex));
    } else {
      return 1;
    }
  }

  updateSoundSet(tIndex, tID, tSampleList) {
    if ((tIndex >= 1) && (tIndex <= this.pSoundSetLimit)) {
      const tSoundSet = propList("id", tID);
      const tMachineSampleList = list();
      for (const tSampleID of tSampleList) {
        tMachineSampleList.add(propList("id", tSampleID, "length", 0));
      }
      tSoundSet[Symbol.for("samples")] = tMachineSampleList;
      this.pSoundSetList[tIndex] = tSoundSet;
      for (let tSampleIndex = 1; tSampleIndex <= tMachineSampleList.count; tSampleIndex++) {
        this.getSampleReady(tSampleIndex, tIndex);
      }
      this.getInterface().updateSoundSetSlots();
    }
  }

  clearSoundSets() {
    this.pSoundSetList = list();
    for (let i = 1; i <= this.pSoundSetLimit; i++) {
      this.pSoundSetList[i] = VOID;
    }
    this.getInterface().updateSoundSetSlots();
  }

  setSoundSetCount(tCount) {
    if (!voidp(this.pSoundSetCount)) {
      this.pSoundSetCount = this.pSoundSetCount + tCount;
      if (this.pSoundSetCount == 0) {
        this.getInterface().ShowAlert("no_sound_sets");
      }
    } else {
      this.pSoundSetCount = tCount;
    }
  }

  getFreeSoundSetCount() {
    let tCount = 0;
    for (let i = 1; i <= this.pSoundSetList.count; i++) {
      if (this.pSoundSetList[i] == VOID) {
        tCount = tCount + 1;
      }
    }
    return tCount;
  }

  removeSoundSetInsertLock() {
    this.pSoundSetInsertLocked = 0;
  }

  resolveSamplePosition(tSampleID) {
    for (let i = 1; i <= this.pSoundSetList.count; i++) {
      const tSoundSet = this.pSoundSetList[i];
      if (!voidp(tSoundSet)) {
        const tSampleList = tSoundSet[Symbol.for("samples")];
        for (let j = 1; j <= tSampleList.count; j++) {
          const tSample = tSampleList[j];
          if (tSample[Symbol.for("id")] == tSampleID) {
            return propList("sample", j, "soundset", i);
          }
        }
      }
    }
    return 0;
  }

  insertSample(tSlot, tChannel) {
    let tID = 0;
    const tSample = this.getSample(this.pSelectedSoundSetSample, this.pSelectedSoundSet);
    if (tSample != 0) {
      tID = tSample[Symbol.for("id")];
    } else {
      return 0;
    }
    if (this.pTimelineInstance.insertSample(tSlot, tChannel, tID)) {
      this.stopEditorSong();
      return 1;
    }
    return 0;
  }

  removeSample(tSlot, tChannel) {
    if (this.pTimelineInstance.removeSample(tSlot, tChannel)) {
      this.stopEditorSong();
    }
  }

  checkSoundSetReferences(tIndex) {
    const tID = this.getSoundSetID(tIndex);
    if (tID == 0) {
      return 0;
    }
    const tID2 = this.pSoundSetList[tIndex][Symbol.for("id")];
    return this.pTimelineInstance.checkSoundSetReferences(tID2);
  }

  getCanInsertSample(tX, tY, tID) {
    return this.pTimelineInstance.getCanInsertSample(tX, tY, tID);
  }

  clearTimeLine() {
    this.pTimelineInstance.clearTimeLine();
    this.pPlayHeadPosX = 0;
  }

  updateEditorSong(tID, tName) {
    if (!voidp(tID)) {
      this.pTimelineInstance.updateSongID(tID);
    }
    if (!voidp(tName)) {
      this.pTimelineInstance.updateSongName(tName);
    }
    const tName = this.pTimelineInstance.getSongName();
    this.pTimelineInstance.resetChanged();
    this.getInterface().showSongSaved(tName);
  }

  playSample(tSampleIndex, tSoundSet) {
    if (this.pEditorSongPlaying) {
      return 1;
    }
    const tSample = this.getSample(tSampleIndex, tSoundSet);
    if (tSample != 0) {
      let tReady = 1;
      const tSampleName = this.pTimelineInstance.getSampleName(tSample[Symbol.for("id")]);
      const tSongController = getObject(this.pSongControllerID);
      if (tSongController != 0) {
        tReady = tSongController.startSamplePreview(tSampleName);
      }
      return tReady;
    }
    return 0;
  }

  stopSample() {
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      return tSongController.stopSamplePreview();
    }
    return 0;
  }

  getSampleReady(tSampleIndex, tSoundSet) {
    const tSample = this.getSample(tSampleIndex, tSoundSet);
    if (tSample != 0) {
      if (tSample[Symbol.for("length")] == 0) {
        let tReady = 0;
        const tLength = this.pTimelineInstance.getSampleLength(tSample[Symbol.for("id")]);
        if (tLength) {
          tSample[Symbol.for("length")] = tLength;
          tReady = 1;
        }
        return tReady;
      } else {
        return 1;
      }
    }
    return 0;
  }

  getSample(tSampleIndex, tSampleSet) {
    if ((tSampleSet >= 1) && (tSampleSet <= this.pSoundSetLimit)) {
      if (!voidp(this.pSoundSetList[tSampleSet])) {
        if (this.pSoundSetList[tSampleSet][Symbol.for("samples")].count >= tSampleIndex) {
          return this.pSoundSetList[tSampleSet][Symbol.for("samples")][tSampleIndex];
        }
      }
    }
    return 0;
  }

  getSampleSetNumber(tSampleID) {
    const tSamplePos = this.resolveSamplePosition(tSampleID);
    if (tSamplePos != 0) {
      return tSamplePos[Symbol.for("soundset")];
    }
    return 0;
  }

  getSampleIndex(tSampleID) {
    const tSamplePos = this.resolveSamplePosition(tSampleID);
    if (tSamplePos != 0) {
      return tSamplePos[Symbol.for("sample")];
    }
    return 0;
  }

  playEditorSong() {
    if (this.pEditorOpen) {
      if (this.pEditorSongPlaying) {
        return 1;
      }
      this.pEditorSongLength = this.pTimelineInstance.resolveSongLength();
      if (this.pEditorSongLength == 0) {
        return 0;
      }
      if (this.pPlayHeadPosX > this.pEditorSongLength) {
        this.pPlayHeadPosX = 0;
        this.getInterface().updatePlayHead();
      }
      const tPosition = this.getTimeLineSlotLength() * this.pPlayHeadPosX;
      const tSongData = this.pTimelineInstance.getSongData();
      if (tSongData == 0) {
        return 0;
      }
      let tReady = 0;
      const tSongController = getObject(this.pSongControllerID);
      if (tSongController != 0) {
        tSongData[Symbol.for("offset")] = tPosition;
        tReady = tSongController.playSong(this.pMusicIndexEditor, tSongData, 1);
        if (tReady) {
          this.pEditorSongPlaying = 1;
          this.pEditorSongStartTime = the.milliSeconds;
          this.getInterface().updatePlayButton();
        }
      }
      return tReady;
    }
    return 0;
  }

  stopSong() {
    const tID = 1;
    const tSoundMachine = this.getSoundMachine(tID);
    if (tSoundMachine == 0) {
      return 0;
    }
    tSoundMachine.stopSong();
    return 1;
  }

  stopEditorSong() {
    if (this.pEditorSongPlaying) {
      const tPlayTime = this.getEditorPlayTime();
      const tSlotLength = this.getTimeLineSlotLength();
      const tPos = ((tPlayTime / tSlotLength) + this.pPlayHeadPosX) % this.pEditorSongLength;
      this.pPlayHeadPosX = tPos;
      this.pEditorSongPlaying = 0;
      this.pEditorSongLength = 0;
      this.getInterface().updatePlayHead();
      this.getInterface().updatePlayButton();
      this.pEditorSongStartTime = 0;
      const tSongController = getObject(this.pSongControllerID);
      if (tSongController != 0) {
        tSongController.stopSong(this.pMusicIndexEditor);
      }
    }
  }

  stopListenSong() {
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      tSongController.stopSong(this.pMusicIndexTop);
    }
  }

  listenSong(tSongID) {
    if (tSongID == this.pExternalSongID) {
    }
    this.pExternalSongID = tSongID;
    if (getConnection(this.pConnectionId) != 0) {
      return getConnection(this.pConnectionId).send("GET_SONG_INFO", propList("integer", tSongID));
    }
    return 0;
  }

  parseSongData(tdata, tSongID, tSongName) {
    const tID = 1;
    const tSoundMachine = this.getSoundMachine(tID);
    if (tSoundMachine != 0) {
      tSoundMachine.parseSongData(tdata, tSongID, tSongName);
      tSoundMachine.processSongData();
    }
    if (this.pEditorSongID == tSongID) {
      this.pTimelineInstance.parseSongData(tdata, tSongID, tSongName);
      this.processEditorSongData();
    }
    if (this.pExternalSongID == tSongID) {
      this.pExternalSongID = VOID;
      this.pTimelineInstanceExternal.parseSongData(tdata, tSongID, tSongName);
      this.processExternalSongData();
    }
  }

  openEditorSong() {
    const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
    if (tPlaylistManager == 0) {
      return 0;
    }
    const tRetVal = tPlaylistManager.editSong();
    if (tRetVal) {
      this.pEditorSongID = tPlaylistManager.getEditorSongID();
      this.pTimelineInstance.reset(1);
    }
    return tRetVal;
  }

  newEditorSong() {
    const tPlaylistManager = this.getPlaylistManager(this.pSoundMachineFurniID);
    if (tPlaylistManager == 0) {
      return 0;
    }
    const tRetVal = tPlaylistManager.newSong();
    if (tRetVal) {
      this.pTimelineInstance.reset(0);
    }
    return tRetVal;
  }

  saveEditorSong(tNewName) {
    const tNewSong = this.pTimelineInstance.encodeTimeLineData();
    if (tNewSong != 0) {
      if (getConnection(this.pConnectionId) != 0) {
        const tID = this.pTimelineInstance.getSongID();
        let tName = tNewName;
        tName = convertSpecialChars(tName, 1);
        if (tID == 0) {
          return getConnection(this.pConnectionId).send("SAVE_SONG_NEW", propList("string", tName, "string", tNewSong));
        } else {
          return getConnection(this.pConnectionId).send("SAVE_SONG_EDIT", propList("integer", tID, "string", tName, "string", tNewSong));
        }
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  }

  processEditorSongData() {
    let tReady = 1;
    if (!this.pTimelineInstance.processSongData()) {
      tReady = 0;
    }
    if (!tReady) {
      if (!timeoutExists(this.pTimeLineUpdateTimer)) {
        createTimeout(this.pTimeLineUpdateTimer, 500, Symbol.for("processEditorSongData"), this.getID(), VOID, 1);
      }
    }
    if (this.pEditorOpen) {
      this.getInterface().renderTimeLine();
    }
  }

  processExternalSongData() {
    let tReady = 1;
    if (!this.pTimelineInstanceExternal.processSongData()) {
      tReady = 0;
    }
    if (!tReady) {
      if (!timeoutExists(this.pExternalSongTimer)) {
        createTimeout(this.pExternalSongTimer, 500, Symbol.for("processExternalSongData"), this.getID(), VOID, 1);
      }
    } else {
      const tSongData = this.pTimelineInstanceExternal.getSongData();
      if (tSongData == 0) {
        return 0;
      }
      tReady = 0;
      const tSongController = getObject(this.pSongControllerID);
      if (tSongController != 0) {
        tSongData[Symbol.for("offset")] = 0;
        tReady = tSongController.playSong(this.pMusicIndexTop, tSongData, 0);
      }
    }
    return tReady;
  }

  roomActivityUpdate(tInitialUpdate) {
    const tUpdate = this.getInterface().getEditorWindowExists();
    if (tUpdate) {
      if (!tInitialUpdate) {
        getConnection(this.pConnectionId).send("MOVE", propList("short", 1000, "short", 1000));
      }
      if (!timeoutExists(this.pRoomActivityUpdateTimer)) {
        createTimeout(this.pRoomActivityUpdateTimer, 30 * 1000, Symbol.for("roomActivityUpdate"), this.getID(), VOID, 1);
      }
    }
  }

  getDiskData(tArray) {
    if (ilk(tArray) == Symbol.for("propList")) {
      if (!voidp(tArray[Symbol.for("source")])) {
        const tStuffData = tArray[Symbol.for("source")];
        const tDelim = the.itemDelimiter;
        the.itemDelimiter = numToChar(10);
        if (tStuffData.item.count >= 6) {
          tArray[Symbol.for("author")] = tStuffData.item[1];
          tArray[Symbol.for("burnDay")] = tStuffData.item[2];
          tArray[Symbol.for("burnMonth")] = tStuffData.item[3];
          tArray[Symbol.for("burnYear")] = tStuffData.item[4];
          tArray[Symbol.for("songLength")] = tStuffData.item[5];
          tArray[Symbol.for("songName")] = tStuffData.item[`6..${tStuffData.item.count}`];
          const tmember = getMember("song_disk_play_icon");
          if (tmember != 0) {
            if (tmember.type == Symbol.for("bitmap")) {
              tArray[Symbol.for("playIcon")] = tmember.image;
            }
          }
        }
        the.itemDelimiter = tDelim;
      }
    }
    return tArray;
  }
}
