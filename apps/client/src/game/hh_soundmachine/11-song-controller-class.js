export default class {
  pSampleList;
  pSongPlayer;
  pLengthCache;

  construct() {
    this.pSampleList = propList();
    this.pSongPlayer = "song player";
    createObject(this.pSongPlayer, "Song Player Class");
    this.pLengthCache = propList();
  }

  deconstruct() {
    if (objectExists(this.pSongPlayer)) {
      removeObject(this.pSongPlayer);
    }
  }

  preloadSounds(tSampleList) {
    for (let i = 1; i <= tSampleList.count; i++) {
      const tItem = tSampleList[i];
      if (ilk(tItem) == Symbol.for("propList")) {
        this.startSampleDownload(tItem[Symbol.for("sound")], tItem[Symbol.for("parent")]);
        continue;
      }
      if (ilk(tItem) == Symbol.for("string")) {
        this.startSampleDownload(tItem);
      }
    }
  }

  getSampleLoadingStatus(tMemName) {
    if (memberExists(tMemName)) {
      return 1;
    }
    return 0;
  }

  getSampleLength(tMemName) {
    let tLength = this.pLengthCache[tMemName];
    if (!voidp(tLength)) {
      return tLength;
    }
    const tmember = getMember(tMemName);
    if (tmember == 0) {
      return 0;
    }
    if (tmember.type != Symbol.for("sound")) {
      return 0;
    }
    tLength = tmember.duration;
    this.pLengthCache[tMemName] = tLength;
    return tLength;
  }

  startSamplePreview(tMemberName) {
    return getObject(this.pSongPlayer).startSamplePreview(propList("name", tMemberName));
  }

  stopSamplePreview() {
    return getObject(this.pSongPlayer).stopSamplePreview();
  }

  playSong(tStackIndex, tSongData, tLoop) {
    return getObject(this.pSongPlayer).startSong(tStackIndex, tSongData, tLoop);
  }

  stopSong(tStackIndex) {
    return getObject(this.pSongPlayer).stopSong(tStackIndex, 1);
  }

  initPlaylist(tStackIndex, tSongList, tPlayTime, tLoop) {
    return getObject(this.pSongPlayer).initPlaylist(tStackIndex, tSongList, tPlayTime, tLoop);
  }

  addPlaylistSong(tStackIndex, tID, tLength) {
    return getObject(this.pSongPlayer).addPlaylistSong(tStackIndex, tID, tLength);
  }

  updatePlaylistSong(tID, tSongData) {
    return getObject(this.pSongPlayer).updatePlaylistSong(tID, tSongData);
  }

  startSampleDownload(tMemberName, tParentId) {
    if (memberExists(tMemberName)) {
      if (this.pSampleList.getaProp(tMemberName) == VOID) {
        const tSample = propList("status", "ready");
        this.pSampleList.addProp(tMemberName, tSample);
      } else {
      }
    } else {
      if (this.pSampleList.getaProp(tMemberName) == VOID) {
        if (threadExists(Symbol.for("dynamicdownloader"))) {
          getThread(Symbol.for("dynamicdownloader")).getComponent().downloadCastDynamically(tMemberName, Symbol.for("sound"), this.getID(), Symbol.for("soundDownloadCompleted"), VOID, VOID, tParentId);
          const tSample = propList("status", "loading");
          this.pSampleList.addProp(tMemberName, tSample);
        } else {
          return error(this, "Dynamic downloader does not exist, cannot download sound.", Symbol.for("startSampleDownload"), Symbol.for("major"));
        }
      }
    }
    return 1;
  }

  soundDownloadCompleted(tName, tParam2) {
    const tSample = this.pSampleList.getaProp(tName);
    if (!voidp(tSample)) {
      tSample.status = "ready";
    }
  }
}
