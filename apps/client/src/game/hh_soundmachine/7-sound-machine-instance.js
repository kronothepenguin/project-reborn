export default class {
  pLoopPlaylist;
  pPlayStackIndex;
  pPlaylistManager;
  pSongList;
  pTimelineList;
  pFurniOn;
  pInitialized;
  pSongControllerID;
  pProcessSongTimer;
  pBubbleTimer;
  pFurniID;
  pBubbleSongName;

  construct() {
    this.pPlaylistManager = createObject(Symbol.for("temp"), getClassVariable("soundmachine.songlist.manager"));
    this.pSongControllerID = "song controller";
    this.pProcessSongTimer = "sound machine instance timer";
    this.pLoopPlaylist = 0;
    this.pSongList = list();
    this.pTimelineList = propList();
    this.pInitialized = 0;
    this.pPlayStackIndex = VOID;
    this.pBubbleTimer = VOID;
    this.pFurniID = VOID;
    this.pBubbleSongName = EMPTY;
    return 1;
  }

  deconstruct() {
    this.pPlaylistManager.deconstruct();
    for (const tTimeline of this.pTimelineList) {
      tTimeline.deconstruct();
    }
    if (!voidp(this.pBubbleTimer)) {
      if (timeoutExists(this.pBubbleTimer)) {
        removeTimeout(this.pBubbleTimer);
      }
    }
    return 1;
  }

  Initialize(tID) {
    if (this.pInitialized) {
      return 0;
    }
    this.pInitialized = 1;
    this.pBubbleTimer = `jukebox_timer_${tID}`;
    if (!timeoutExists(this.pBubbleTimer)) {
      createTimeout(this.pBubbleTimer, 1000, Symbol.for("bubbleCheck"), this.getID(), VOID, 0);
    }
    this.pFurniID = tID;
    return 1;
  }

  playSong() {
    const tSongController = getObject(this.pSongControllerID);
    if (this.pFurniOn) {
      if ((tSongController != 0) && !voidp(this.pPlayStackIndex)) {
        this.updatePlaylist();
        tSongController.initPlaylist(this.pPlayStackIndex, this.pSongList.duplicate(), this.pPlaylistManager.getPlayTime(), this.pLoopPlaylist);
        this.processSongData();
        return 1;
      }
    }
    return 0;
  }

  stopSong() {
    if (voidp(this.pPlayStackIndex)) {
      return 0;
    }
    if (!this.pLoopPlaylist) {
      for (const tTimeline of this.pTimelineList) {
        tTimeline.deconstruct();
      }
      this.pTimelineList = propList();
      this.pSongList = list();
    }
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      tSongController.stopSong(this.pPlayStackIndex);
    }
    return 1;
  }

  setState(tFurniOn) {
    if (tFurniOn == this.pFurniOn) {
      return 0;
    }
    this.pFurniOn = tFurniOn;
    this.pPlaylistManager.resetPlayTime();
    if (this.pFurniOn) {
      if (this.pLoopPlaylist) {
        this.playSong();
      } else {
        this.pPlaylistManager.getPlaylistData();
      }
    } else {
      this.stopSong();
    }
    return 1;
  }

  getState() {
    return this.pFurniOn;
  }

  setLooping(tLoop) {
    this.pLoopPlaylist = tLoop;
  }

  getLooping() {
    return this.pLoopPlaylist;
  }

  setPlayStackIndex(tStackIndex) {
    this.pPlayStackIndex = tStackIndex;
  }

  getPlaylistManager() {
    this.updatePlaylist();
    return this.pPlaylistManager;
  }

  parsePlaylist(tMsg) {
    if (voidp(this.pPlayStackIndex)) {
      return 0;
    }
    const tRetVal = this.pPlaylistManager.parsePlaylist(tMsg);
    const tCount = this.pPlaylistManager.getPlaylistCount();
    for (const tTimeline of this.pTimelineList) {
      tTimeline.deconstruct();
    }
    this.pTimelineList = propList();
    this.pSongList = list();
    for (let i = 1; i <= tCount; i++) {
      const tSong = this.pPlaylistManager.getPlaylistSong(i);
      if (tSong != 0) {
        if (!this.createTimelineInstance(tSong)) {
          return error(this, "Problems with playlist", Symbol.for("parsePlaylist"), Symbol.for("major"));
        }
      }
    }
    if (this.pTimelineList.count == 0) {
      return 0;
    }
    const tTimeline = this.pTimelineList[1];
    let tstart = 1;
    const tTotalLength = this.pPlaylistManager.getPlaylistLength() * tTimeline.getSlotDuration() / 100;
    if (tTotalLength > 0) {
      const tOffset = this.pPlaylistManager.getPlayTime() % tTotalLength;
      let tPos = 0;
      for (let i = 1; i <= this.pSongList.count; i++) {
        tPos = tPos + (this.pSongList[i][Symbol.for("length")] / 100);
        if (tPos > (tOffset + 50)) {
          tstart = i;
          break;
        }
      }
    }
    const tDownloadList = list();
    for (let i = 0; i <= this.pTimelineList.count - 1; i++) {
      let tIndex = (tstart + i) % tCount;
      if (tIndex == 0) {
        tIndex = tCount;
      }
      const tID = this.pTimelineList.getPropAt(tIndex);
      if (tDownloadList.findPos(tID) == 0) {
        tDownloadList.add(tID);
        this.pPlaylistManager.downloadSong(tID);
      }
    }
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      tSongController.initPlaylist(this.pPlayStackIndex, this.pSongList.duplicate(), this.pPlaylistManager.getPlayTime(), this.pLoopPlaylist);
    }
    return tRetVal;
  }

  updatePlaylist() {
    if (!this.pLoopPlaylist && this.pFurniOn) {
      const tPlayTime = this.pPlaylistManager.getPlayTime();
      let tEndTime = 0;
      let tRemove = 0;
      for (let i = 1; i <= this.pSongList.count; i++) {
        tEndTime = tEndTime + (this.pSongList[i][Symbol.for("length")] / 100);
        if (tEndTime <= tPlayTime) {
          tRemove = i;
          continue;
        }
        break;
      }
      for (let i = 1; i <= tRemove; i++) {
        const tLength = this.pSongList[1][Symbol.for("length")] / 100;
        this.pSongList.deleteAt(1);
        this.pTimelineList[1].deconstruct();
        this.pTimelineList.deleteAt(1);
        this.pPlaylistManager.changePlayTime(-tLength);
        this.pPlaylistManager.removePlaylistSong(1);
      }
    }
  }

  insertPlaylistSong(tID, tLength, tName, tAuthor) {
    if (voidp(this.pPlayStackIndex)) {
      return 0;
    }
    if (this.pLoopPlaylist) {
      return 0;
    }
    this.updatePlaylist();
    if (!this.pPlaylistManager.insertPlaylistSong(tID, tLength, tName, tAuthor)) {
      return 0;
    }
    this.createTimelineInstance(propList("id", tID, "length", tLength));
    if (this.pTimelineList.count == 0) {
      return 0;
    }
    const tTimeline = this.pTimelineList[1];
    this.pPlaylistManager.downloadSong(tID);
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      return tSongController.addPlaylistSong(this.pPlayStackIndex, tID, tLength * tTimeline.getSlotDuration());
    }
    return 0;
  }

  parseSongData(tdata, tSongID, tSongName) {
    for (let i = 1; i <= this.pTimelineList.count; i++) {
      const tID = this.pTimelineList.getPropAt(i);
      if (tSongID == tID) {
        const tTimeline = this.pTimelineList[i];
        tTimeline.parseSongData(tdata, tSongID, tSongName);
      }
    }
  }

  processSongData() {
    let tReady = 1;
    const tSongController = getObject(this.pSongControllerID);
    this.updatePlaylist();
    for (let i = 1; i <= this.pTimelineList.count; i++) {
      if (!this.pTimelineList[i].processSongData()) {
        tReady = 0;
        continue;
      }
      if (this.pFurniOn) {
        if (tSongController != 0) {
          const tSongData = this.pTimelineList[i].getSongData();
          const tID = this.pTimelineList[i].getSongID();
          if (tSongData != 0) {
            tSongController.updatePlaylistSong(tID, tSongData);
          }
        }
      }
    }
    if (!tReady) {
      if (!timeoutExists(this.pProcessSongTimer)) {
        createTimeout(this.pProcessSongTimer, 500, Symbol.for("processSongData"), this.getID(), VOID, 1);
      }
    }
  }

  createTimelineInstance(tSong) {
    if (ilk(tSong) != Symbol.for("propList")) {
      return error(this, "Problems with playlist", Symbol.for("createTimelineInstance"), Symbol.for("major"));
    }
    if (voidp(tSong[Symbol.for("id")]) || voidp(tSong[Symbol.for("length")])) {
      return error(this, "Problems with playlist", Symbol.for("createTimelineInstance"), Symbol.for("major"));
    }
    const tTimeline = createObject("timeline instance", getClassVariable("soundmachine.song.timeline"));
    if (tTimeline == 0) {
      return error(this, "Couldn't create timeline instance", Symbol.for("createTimelineInstance"), Symbol.for("major"));
    }
    unregisterObject("timeline instance");
    tTimeline.reset(1);
    this.pTimelineList.addProp(tSong[Symbol.for("id")], tTimeline);
    let tSongLength = tSong[Symbol.for("length")] * tTimeline.getSlotDuration();
    if (tSongLength < 0) {
      error(this, "Invalid song length - sync will not work", Symbol.for("createTimelineInstance"), Symbol.for("minor"));
      tSongLength = tTimeline.getSlotDuration();
    }
    this.pSongList.add(propList("length", tSongLength, "id", tSong[Symbol.for("id")]));
    return 1;
  }

  bubbleCheck() {
    if (this.pLoopPlaylist) {
      return 0;
    }
    const tArray = propList();
    tArray[Symbol.for("id")] = this.pFurniID;
    executeMessage(Symbol.for("get_jukebox_song_info"), tArray);
    let tNewName = EMPTY;
    if (!voidp(tArray[Symbol.for("songName")])) {
      tNewName = `${tArray[Symbol.for("songName")]} `;
    }
    if (!voidp(tArray[Symbol.for("author")])) {
      tNewName = `${tNewName}${tArray[Symbol.for("author")]}`;
    }
    if (tNewName != this.pBubbleSongName) {
      if (tNewName != EMPTY) {
        const tMsg = propList("command", "OBJECT", "id", this.pFurniID, "message", tNewName);
        executeMessage(Symbol.for("showObjectMessage"), tMsg);
      }
      this.pBubbleSongName = tNewName;
    }
    return 1;
  }
}
