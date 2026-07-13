export default class {
  pUpdateTimeout;
  pQueueTimeout;
  pPlayTimeout;
  pPreviewChannel;
  pSongChannels;
  pSongChannelsInUse;
  pPlaylistStack;
  pSilentSampleName;

  construct() {
    this.pUpdateTimeout = "song player loop update";
    this.pQueueTimeout = "song queue timeout";
    this.pPlayTimeout = "song play timeout";
    this.pPreviewChannel = 5;
    this.pSongChannels = list(1, 2, 3, 4);
    this.pSongChannelsInUse = list();
    this.pSilentSampleName = "sound_machine_sample_0";
    this.pPlaylistStack = propList();
  }

  deconstruct() {
    if (timeoutExists(this.pUpdateTimeout)) {
      removeTimeout(this.pUpdateTimeout);
    }
    if (timeoutExists(this.pQueueTimeout)) {
      removeTimeout(this.pQueueTimeout);
    }
    if (timeoutExists(this.pPlayTimeout)) {
      removeTimeout(this.pPlayTimeout);
    }
  }

  startSong(tStackIndex, tSongData, tLoop) {
    const tSongLength = this.getSongLength(tSongData);
    let tOffset = 0;
    if (!voidp(tSongData[Symbol.for("offset")])) {
      tOffset = tSongData[Symbol.for("offset")] / 100;
    }
    const tID = 1;
    if (!this.initPlaylist(tStackIndex, list(propList("length", tSongLength, "id", tID)), tOffset, tLoop)) {
      return 0;
    }
    return this.updatePlaylistSong(tID, tSongData);
  }

  stopSong(tStackIndex, tResetPlaylist) {
    if (this.getIsTopInstance(tStackIndex)) {
      if (timeoutExists(this.pQueueTimeout)) {
        removeTimeout(this.pQueueTimeout);
      }
      if (timeoutExists(this.pPlayTimeout)) {
        removeTimeout(this.pPlayTimeout);
      }
      if (timeoutExists(this.pUpdateTimeout)) {
        removeTimeout(this.pUpdateTimeout);
      }
      for (const tChannel of this.pSongChannelsInUse) {
        if ((tChannel >= 1) && (tChannel <= this.pSongChannels.count)) {
          stopSoundChannel(this.pSongChannels[tChannel]);
        }
      }
      this.pSongChannelsInUse = list();
      if (tResetPlaylist) {
        this.removePlaylistInstance(tStackIndex);
        this.checkLoopData();
      }
    } else {
      if (tResetPlaylist) {
        this.removePlaylistInstance(tStackIndex);
      }
    }
    return 1;
  }

  initPlaylist(tStackIndex, tSongList, tPlayTime, tLoop) {
    if (ilk(tSongList) != Symbol.for("list")) {
      return error(this, "Invalid data", Symbol.for("initPlaylist"), Symbol.for("major"));
    }
    const tTopIndex = this.getTopInstanceIndex();
    if (tTopIndex <= tStackIndex) {
      this.stopSong(tTopIndex, 0);
    }
    if (voidp(tLoop)) {
      tLoop = 1;
    }
    this.removePlaylistInstance(tStackIndex);
    const tPlaylistInstance = this.createPlaylistInstance(tStackIndex);
    for (let tSong of tSongList) {
      if (ilk(tSong) != Symbol.for("propList")) {
        tPlaylistInstance[Symbol.for("songList")] = list();
        return error(this, "Invalid data", Symbol.for("initPlaylist"), Symbol.for("major"));
      }
      if (voidp(tSong[Symbol.for("length")]) || voidp(tSong[Symbol.for("id")])) {
        tPlaylistInstance[Symbol.for("songList")] = list();
        return error(this, "Invalid data", Symbol.for("initPlaylist"), Symbol.for("major"));
      }
      if (!tLoop) {
        const tSongLength = tSong[Symbol.for("length")] / 100;
        if (tPlayTime >= tSongLength) {
          tPlayTime = tPlayTime - tSongLength;
          tSong = VOID;
        }
      }
      if (!voidp(tSong)) {
        const tPlaylistItem = tSong.duplicate();
        tPlaylistInstance[Symbol.for("songList")].add(tPlaylistItem);
      }
    }
    tPlaylistInstance[Symbol.for("loop")] = tLoop;
    tPlaylistInstance[Symbol.for("playTime")] = tPlayTime;
    tPlaylistInstance[Symbol.for("initialPlayTime")] = the.milliSeconds;
    return 1;
  }

  addPlaylistSong(tStackIndex, tID, tLength) {
    if (voidp(tID) || voidp(tLength)) {
      return error(this, "Invalid data", Symbol.for("addPlaylistSong"), Symbol.for("major"));
    }
    let tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance != 0) {
      if (tPlaylistInstance[Symbol.for("loop")]) {
        return error(this, "Looping playlist", Symbol.for("addPlaylistSong"), Symbol.for("major"));
      }
    } else {
      tPlaylistInstance = this.createPlaylistInstance(tStackIndex);
      tPlaylistInstance[Symbol.for("loop")] = 0;
    }
    this.removePlayedSongs(tStackIndex);
    const tPlaylistItem = propList("length", tLength, "id", tID);
    tPlaylistInstance[Symbol.for("songList")].add(tPlaylistItem);
    if (tPlaylistInstance[Symbol.for("songList")].count == 1) {
      tPlaylistInstance[Symbol.for("playTime")] = 0;
      tPlaylistInstance[Symbol.for("initialPlayTime")] = the.milliSeconds;
    }
    return 1;
  }

  updatePlaylistSong(tID, tSongData) {
    let tUpdated = 0;
    for (let tIndex = 1; tIndex <= this.getPlaylistInstanceCount(); tIndex++) {
      const tPlaylistInstance = this.getPlaylistInstance(tIndex, 1);
      if (tPlaylistInstance == 0) {
        return 0;
      }
      const tSongList = tPlaylistInstance[Symbol.for("songList")];
      for (let i = 1; i <= tSongList.count; i++) {
        if (tSongList[i][Symbol.for("id")] == tID) {
          if (voidp(tSongList[i][Symbol.for("songData")])) {
            tUpdated = 1;
            const tSongDataDuplicate = tSongData.duplicate();
            tSongList[i][Symbol.for("songData")] = tSongDataDuplicate;
            const tLength = this.getSongLength(tSongDataDuplicate);
            if ((tLength != tSongList[i][Symbol.for("length")]) && tPlaylistInstance[Symbol.for("loop")]) {
              this.stopSong(tIndex, 0);
              tSongList[i][Symbol.for("length")] = tLength;
            }
          }
        }
      }
    }
    if (tUpdated) {
      this.checkLoopData();
    }
    return 1;
  }

  getPlaylistInstance(tStackIndex, tAbsoluteIndex) {
    if (voidp(tAbsoluteIndex)) {
      tAbsoluteIndex = 0;
    }
    if (!tAbsoluteIndex) {
      const tPlaylistInstance = this.pPlaylistStack.getaProp(tStackIndex);
      if (tPlaylistInstance == 0) {
        return 0;
      }
      return tPlaylistInstance;
    } else {
      if ((tStackIndex < 1) || (tStackIndex > this.pPlaylistStack.count)) {
        return 0;
      }
      return this.pPlaylistStack[tStackIndex];
    }
  }

  getPlaylistTopInstance() {
    if (this.pPlaylistStack.count == 0) {
      return 0;
    }
    return this.pPlaylistStack[this.pPlaylistStack.count];
  }

  getIsTopInstance(tStackIndex) {
    if ((this.pPlaylistStack.findPos(tStackIndex) == this.pPlaylistStack.count) && (this.pPlaylistStack.count > 0)) {
      return 1;
    }
    return 0;
  }

  getTopInstanceIndex() {
    if (this.pPlaylistStack.count == 0) {
      return 0;
    }
    return this.pPlaylistStack.getPropAt(this.pPlaylistStack.count);
  }

  removePlaylistInstance(tStackIndex) {
    const tPos = this.pPlaylistStack.findPos(tStackIndex);
    if (tPos > 0) {
      this.pPlaylistStack.deleteAt(tPos);
      return 1;
    }
    return 0;
  }

  createPlaylistInstance(tStackIndex) {
    const tPos = this.pPlaylistStack.findPos(tStackIndex);
    if (tPos == 0) {
      const tPlaylistInstance = propList("songList", list(), "listIndex", 1, "playTime", 0, "initialPlayTime", 0, "playOffset", 0, "loop", 1);
      this.pPlaylistStack.addProp(tStackIndex, tPlaylistInstance);
      this.pPlaylistStack.sort();
      return tPlaylistInstance;
    }
    return this.pPlaylistStack[tPos];
  }

  getPlaylistInstanceCount() {
    return this.pPlaylistStack.count;
  }

  getSongData(tStackIndex, tIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return 0;
    }
    if (voidp(tIndex)) {
      tIndex = tPlaylistInstance[Symbol.for("listIndex")];
    }
    const tSongList = tPlaylistInstance[Symbol.for("songList")];
    if ((tIndex < 1) || (tIndex > tSongList.count)) {
      return 0;
    }
    if (voidp(tSongList[tIndex][Symbol.for("songData")])) {
      return 0;
    }
    return tSongList[tIndex][Symbol.for("songData")];
  }

  getSongChannelList(tStackIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return list();
    }
    if (tPlaylistInstance[Symbol.for("songList")].count == 1) {
      const tSongData = this.getSongData(tStackIndex, 1);
      if (tSongData != 0) {
        if (!voidp(tSongData[Symbol.for("channelList")])) {
          return tSongData[Symbol.for("channelList")].duplicate();
        }
      }
    }
    const tChannels = list();
    for (let i = 1; i <= this.pSongChannels.count; i++) {
      tChannels.add(i);
    }
    return tChannels;
  }

  getSongLength(tSongData) {
    if (voidp(tSongData) || (tSongData == 0)) {
      return -1;
    }
    if (voidp(tSongData.sounds)) {
      return -1;
    }
    if (!voidp(tSongData[Symbol.for("songLength")])) {
      return tSongData[Symbol.for("songLength")];
    }
    const tPlayLengthList = list();
    for (let i = 1; i <= this.pSongChannels.count; i++) {
      tPlayLengthList.add(0);
    }
    for (let i = 1; i <= tSongData.sounds.count; i++) {
      const tSound = tSongData.sounds[i];
      for (let j = 1; j <= tSound.loops; j++) {
        const tChannel = tSound.channel;
        if ((tChannel >= 1) && (tChannel <= this.pSongChannels.count)) {
          const tmember = getMember(tSound.name);
          if (tmember != 0) {
            if (tmember.type == Symbol.for("sound")) {
              const tLength = tmember.duration;
              tPlayLengthList[tChannel] = tPlayLengthList[tChannel] + tLength;
            }
          }
        }
      }
    }
    let tPlayLength = tPlayLengthList[1];
    for (let i = 2; i <= tPlayLengthList.count; i++) {
      if (tPlayLengthList[i] > tPlayLength) {
        tPlayLength = tPlayLengthList[i];
      }
    }
    tSongData[Symbol.for("songLength")] = tPlayLength;
    return tPlayLength;
  }

  getPlaylistSongLength(tStackIndex, tIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return -1;
    }
    const tSongList = tPlaylistInstance[Symbol.for("songList")];
    if ((tIndex < 1) || (tIndex > tSongList.count)) {
      return -1;
    }
    const tSongData = this.getSongData(tStackIndex, tIndex);
    let tLength = this.getSongLength(tSongData);
    if (tLength < 0) {
      tLength = tSongList[tIndex][Symbol.for("length")];
    }
    if (tLength < 0) {
      return 2000;
    }
    return tLength;
  }

  getPlaylistLength(tStackIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return 0;
    }
    const tSongList = tPlaylistInstance[Symbol.for("songList")];
    let tPlaylistLength = 0;
    for (let i = 1; i <= tSongList.count; i++) {
      const tLength = this.getPlaylistSongLength(tStackIndex, i);
      tPlaylistLength = tPlaylistLength + tLength;
    }
    return tPlaylistLength;
  }

  getPlayTime(tStackIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return 0;
    }
    return tPlaylistInstance[Symbol.for("playTime")] + ((the.milliSeconds - tPlaylistInstance[Symbol.for("initialPlayTime")]) / 100);
  }

  initializePlaying() {
    if (timeoutExists(this.pQueueTimeout) || timeoutExists(this.pPlayTimeout)) {
      return 1;
    }
    const tStackIndex = this.getTopInstanceIndex();
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return 0;
    }
    const tSongList = tPlaylistInstance[Symbol.for("songList")];
    if (!tPlaylistInstance[Symbol.for("loop")]) {
      this.removePlayedSongs(tStackIndex);
      if (tSongList.count == 0) {
        this.removePlaylistInstance(tStackIndex);
        return this.initializePlaying();
      }
    }
    const tPlaylistLength = this.getPlaylistLength(tStackIndex) / 100;
    const tPlayTime = this.getPlayTime(tStackIndex);
    const tSyncDelta = 2000 / 100;
    const tExtraOffset = (tSyncDelta - (tPlayTime % tSyncDelta)) % tSyncDelta * 100;
    tPlayTime = tPlayTime + (tExtraOffset / 100);
    tPlaylistInstance[Symbol.for("playOffset")] = 0;
    tPlaylistInstance[Symbol.for("listIndex")] = 1;
    if (tPlaylistLength >= 1) {
      if (!tPlaylistInstance[Symbol.for("loop")] && (tPlayTime >= tPlaylistLength)) {
        return 0;
      }
      let tPos = 0;
      const tOffset = tPlayTime % tPlaylistLength;
      for (let i = 1; i <= tPlaylistInstance[Symbol.for("songList")].count; i++) {
        const tLength = this.getPlaylistSongLength(tStackIndex, i) / 100;
        tPos = tPos + tLength;
        if (tPos > tOffset) {
          tPlaylistInstance[Symbol.for("listIndex")] = i;
          tPlaylistInstance[Symbol.for("playOffset")] = (tOffset - (tPos - tLength)) * 100;
          break;
        }
      }
    }
    if (this.getSongData(tStackIndex) != 0) {
      this.solveSongChannels(tStackIndex);
      this.reserveSongChannels();
      createTimeout(this.pQueueTimeout, 50 + tExtraOffset, Symbol.for("queueChannels"), this.getID(), VOID, 1);
    }
    return 1;
  }

  solveSongChannels(tStackIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return 0;
    }
    const tSongList = tPlaylistInstance[Symbol.for("songList")];
    for (let j = 1; j <= tSongList.count; j++) {
      const tSongData = this.getSongData(tStackIndex, j);
      if (tSongData != 0) {
        if (voidp(tSongData[Symbol.for("channelList")])) {
          const tSounds = tSongData.getaProp(Symbol.for("sounds"));
          if (!voidp(tSounds)) {
            const tChannels = list();
            for (let i = 1; i <= tSounds.count; i++) {
              const tSound = tSounds[i];
              const tChannel = tSound.channel;
              if (!tChannels.findPos(tChannel)) {
                tChannels.add(tChannel);
              }
            }
            tChannels.sort();
            if ((tSongList.count > 1) || !tPlaylistInstance[Symbol.for("loop")]) {
              const tChannels2 = list();
              for (let i = 1; i <= this.pSongChannels.count; i++) {
                tChannels2.add(i);
              }
            }
            for (let i = tSounds.count; i >= 1; i--) {
              const tSound = tSounds[i];
              const tChannel = tSound.channel;
              tSound.channel = tChannels.findPos(tChannel);
              if (tSound.channel == 0) {
                tSounds.deleteAt(i);
                error(this, `Invalid sound channel ${tChannel}`, Symbol.for("solveSongChannels"), Symbol.for("major"));
              }
            }
            const tChannelsFinal = list();
            for (let i = 1; i <= tChannels.count; i++) {
              tChannelsFinal.add(i);
            }
            tSongData[Symbol.for("channelList")] = tChannelsFinal;
            continue;
          }
          error(this, `Song with no sounds ${tChannel}`, Symbol.for("solveSongChannels"), Symbol.for("major"));
        }
      }
    }
  }

  reserveSongChannels() {
    const tStackIndex = this.getTopInstanceIndex();
    const tChannelList = this.getSongChannelList(tStackIndex);
    this.pSongChannelsInUse = list();
    for (const tChannel of tChannelList) {
      if ((tChannel >= 1) && (tChannel <= this.pSongChannels.count)) {
        queueSound(this.pSilentSampleName, this.pSongChannels[tChannel]);
        startSoundChannel(this.pSongChannels[tChannel]);
        this.pSongChannelsInUse.add(tChannel);
      }
    }
  }

  queueChannels() {
    for (const tChannel of this.pSongChannelsInUse) {
      if ((tChannel >= 1) && (tChannel <= this.pSongChannels.count)) {
        stopSoundChannel(this.pSongChannels[tChannel]);
      }
    }
    const tPlayRoundsOnQueue = 2;
    for (let i = 1; i <= tPlayRoundsOnQueue; i++) {
      this.addPlayRound();
    }
    if (timeoutExists(this.pPlayTimeout)) {
      removeTimeout(this.pPlayTimeout);
    }
    createTimeout(this.pPlayTimeout, 50, Symbol.for("startChannels"), this.getID(), VOID, 1);
  }

  startChannels() {
    for (let i = this.pSongChannelsInUse.count; i >= 1; i--) {
      const tChannel = this.pSongChannelsInUse[i];
      if ((tChannel >= 1) && (tChannel <= this.pSongChannels.count)) {
        startSoundChannel(this.pSongChannels[tChannel]);
      }
    }
    if (!timeoutExists(this.pUpdateTimeout)) {
      createTimeout(this.pUpdateTimeout, 1500, Symbol.for("checkLoopData"), this.getID(), VOID, 0);
    }
  }

  addPlayRound() {
    const tStackIndex = this.getTopInstanceIndex();
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance == 0) {
      return 0;
    }
    const tSongList = tPlaylistInstance[Symbol.for("songList")];
    if (!tPlaylistInstance[Symbol.for("loop")]) {
      if (tPlaylistInstance[Symbol.for("listIndex")] > tSongList.count) {
        return 1;
      }
    }
    const tSongData = this.getSongData(tStackIndex);
    if ((tSongData == 0) || (tSongList.count == 0)) {
      return 1;
    } else {
      if (!tPlaylistInstance[Symbol.for("loop")]) {
        tPlaylistInstance[Symbol.for("listIndex")] = tPlaylistInstance[Symbol.for("listIndex")] + 1;
      } else {
        tPlaylistInstance[Symbol.for("listIndex")] = 1 + (tPlaylistInstance[Symbol.for("listIndex")] % tSongList.count);
      }
    }
    if (tSongData.getaProp(Symbol.for("sounds")) == VOID) {
      return 1;
    }
    const tOffset = tPlaylistInstance[Symbol.for("playOffset")];
    const tPlayLengthList = list();
    const tOffsetList = list();
    for (let i = 1; i <= this.pSongChannels.count; i++) {
      tOffsetList.add(tOffset);
      tPlayLengthList.add(0);
    }
    for (let i = 1; i <= tSongData.sounds.count; i++) {
      const tSound = tSongData.sounds[i];
      for (let j = 1; j <= tSound.loops; j++) {
        const tChannel = tSound.channel;
        if ((tChannel >= 1) && (tChannel <= this.pSongChannels.count)) {
          const tmember = getMember(tSound.name);
          if (tmember != 0) {
            if (tmember.type == Symbol.for("sound")) {
              const tLength = tmember.duration;
              if (tOffsetList[tChannel] > 0) {
                if (tLength > tOffsetList[tChannel]) {
                  queueSound(tSound.name, this.pSongChannels[tChannel], propList("startTime", tOffsetList[tChannel]));
                  tPlayLengthList[tChannel] = tPlayLengthList[tChannel] + (tLength - tOffsetList[tChannel]);
                }
                tOffsetList[tChannel] = max(0, tOffsetList[tChannel] - tLength);
                continue;
              }
              queueSound(tSound.name, this.pSongChannels[tChannel]);
              tPlayLengthList[tChannel] = tPlayLengthList[tChannel] + tLength;
            }
          }
        }
      }
    }
    tPlaylistInstance[Symbol.for("playOffset")] = 0;
    if ((tSongList.count < 2) && tPlaylistInstance[Symbol.for("loop")]) {
      return 1;
    }
    let tPlayLength = tPlayLengthList[1];
    for (let i = 2; i <= tPlayLengthList.count; i++) {
      if (tPlayLengthList[i] > tPlayLength) {
        tPlayLength = tPlayLengthList[i];
      }
    }
    const tmember = getMember(this.pSilentSampleName);
    if (tmember != 0) {
      if (tmember.type == Symbol.for("sound")) {
        const tLength = tmember.duration;
        if (tLength > 0) {
          for (let tChannel = 1; tChannel <= tPlayLengthList.count; tChannel++) {
            let tDelta = tPlayLength - tPlayLengthList[tChannel];
            while (tDelta > 0) {
              if (tDelta >= tLength) {
                queueSound(this.pSilentSampleName, this.pSongChannels[tChannel]);
              } else {
                queueSound(this.pSilentSampleName, this.pSongChannels[tChannel], propList("startTime", tLength - tDelta));
              }
              tDelta = tDelta - tLength;
            }
          }
        }
      }
    }
    return 1;
  }

  getPlayBufferLength() {
    const tStackIndex = this.getTopInstanceIndex();
    const tChannelList = this.getSongChannelList(tStackIndex);
    if (tChannelList.count < 1) {
      return -1;
    }
    const tChannel = tChannelList[1];
    if ((tChannel < 1) || (tChannel > this.pSongChannels.count)) {
      return -1;
    }
    const tSoundChannel = sound(this.pSongChannels[tChannel]);
    if (ilk(tSoundChannel) != Symbol.for("instance")) {
      error(this, `Sound channel bug:${this.pSongChannels[tChannel]}`, Symbol.for("getPlayBufferLength"), Symbol.for("major"));
      return -1;
    }
    let tLength = tSoundChannel.endTime - tSoundChannel.startTime;
    const tPlayList = tSoundChannel.getPlaylist();
    for (let i = 1; i <= tPlayList.count; i++) {
      tLength = tLength + tPlayList[i].member.duration;
    }
    return tLength;
  }

  checkLoopData() {
    if (timeoutExists(this.pQueueTimeout) || timeoutExists(this.pPlayTimeout)) {
      return 1;
    }
    const tLength = this.getPlayBufferLength();
    if (tLength <= 0) {
      return this.initializePlaying();
    }
    if (tLength < 60000) {
      this.addPlayRound();
    }
    return 1;
  }

  removePlayedSongs(tStackIndex) {
    const tPlaylistInstance = this.getPlaylistInstance(tStackIndex);
    if (tPlaylistInstance != 0) {
      const tSongList = tPlaylistInstance[Symbol.for("songList")];
      if (!tPlaylistInstance[Symbol.for("loop")]) {
        const tCount = min(tPlaylistInstance[Symbol.for("listIndex")], tSongList.count);
        for (let i = 1; i <= tCount; i++) {
          if (this.getPlayTime(tStackIndex) < (tSongList[1][Symbol.for("length")] / 100)) {
            break;
          }
          tPlaylistInstance[Symbol.for("playTime")] = tPlaylistInstance[Symbol.for("playTime")] - (tSongList[1][Symbol.for("length")] / 100);
          tSongList.deleteAt(1);
          tPlaylistInstance[Symbol.for("listIndex")] = tPlaylistInstance[Symbol.for("listIndex")] - 1;
        }
      }
    }
  }

  startSamplePreview(tParams) {
    const tSuccess = playSoundInChannel(tParams.name, this.pPreviewChannel);
    if (!tSuccess) {
      return error(this, "Sound could not be started", Symbol.for("startSamplePreview"), Symbol.for("minor"));
    }
    return 1;
  }

  stopSamplePreview() {
    const tSuccess = stopSoundChannel(this.pPreviewChannel);
    if (!tSuccess) {
      return error(this, "Sound could not be stopped", Symbol.for("stopSamplePreview"), Symbol.for("minor"));
    }
    return 1;
  }
}
