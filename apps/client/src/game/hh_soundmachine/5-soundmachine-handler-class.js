export default class {
  construct() {
    return this.regMsgList(1);
  }

  deconstruct() {
    return this.regMsgList(0);
  }

  handle_song_info(tMsg) {
    const tSongID = tMsg.connection.GetIntFrom();
    let tName = tMsg.connection.GetStrFrom();
    tName = convertSpecialChars(tName, 0);
    const tdata = list();
    const tStr = tMsg.connection.GetStrFrom();
    const tDelim = the.itemDelimiter;
    the.itemDelimiter = ":";
    for (let i = 1; i <= tStr.item.count / 2; i++) {
      let tChannelNumber = tStr.item[1 + ((i - 1) * 2)];
      const tChannelData = tStr.item[2 + ((i - 1) * 2)];
      if (ilk(value(tChannelNumber)) == Symbol.for("integer")) {
        tChannelNumber = value(tChannelNumber);
        if (tChannelNumber == (tdata.count + 1)) {
          tdata[tChannelNumber] = list();
          the.itemDelimiter = ";";
          for (let j = 1; j <= tChannelData.item.count; j++) {
            const tSample = tChannelData.item[j];
            the.itemDelimiter = ",";
            if (tSample.item.count >= 2) {
              const tID = value(tSample.item[1]);
              const tCount = value(tSample.item[2]);
              tdata[tChannelNumber][tdata[tChannelNumber].count + 1] = propList("id", tID, "length", tCount);
            }
            the.itemDelimiter = ";";
          }
        }
      }
      the.itemDelimiter = ":";
    }
    the.itemDelimiter = tDelim;
    this.getComponent().parseSongData(tdata, tSongID, tName);
  }

  handle_machine_sound_packages(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    const tSlotCount = tMsg.connection.GetIntFrom();
    const tFilledSlots = tMsg.connection.GetIntFrom();
    this.getComponent().clearSoundSets();
    for (let i = 1; i <= tFilledSlots; i++) {
      const tSlotIndex = tMsg.connection.GetIntFrom();
      const tID = tMsg.connection.GetIntFrom();
      const tSampleList = list();
      const tSampleCount = tMsg.connection.GetIntFrom();
      for (let j = 1; j <= tSampleCount; j++) {
        const tSampleID = tMsg.connection.GetIntFrom();
        tSampleList.add(tSampleID);
      }
      this.getComponent().updateSoundSet(tSlotIndex, tID, tSampleList);
    }
    this.getComponent().setSoundSetCount(tFilledSlots);
    this.getComponent().removeSoundSetInsertLock();
    return 1;
  }

  handle_user_sound_packages(tMsg) {
    if (voidp(tMsg.connection)) {
      return 0;
    }
    const tCount = tMsg.connection.GetIntFrom();
    const tList = list();
    for (let i = 1; i <= tCount; i++) {
      const tID = tMsg.connection.GetIntFrom();
      tList.append(tID);
    }
    return this.getComponent().updateSetList(tList);
  }

  handle_invalid_song_name(tMsg) {
    return this.getComponent().handleInvalidSongName();
  }

  handle_song_list(tMsg) {
    return this.getComponent().parseSongList(tMsg);
  }

  handle_play_list(tMsg) {
    return this.getComponent().parsePlaylist(tMsg);
  }

  handle_song_missing_packages(tMsg) {
    const tCount = tMsg.connection.GetIntFrom();
    const tList = list();
    for (let i = 1; i <= tCount; i++) {
      const tID = tMsg.connection.GetIntFrom();
      tList.append(tID);
    }
    return this.getComponent().handleMissingPackages(tList);
  }

  handle_play_list_invalid(tMsg) {
    const tCount = tMsg.connection.GetIntFrom();
    return this.getComponent().handleListFull(tCount, "playlist");
  }

  handle_song_list_full(tMsg) {
    const tCount = tMsg.connection.GetIntFrom();
    return this.getComponent().handleListFull(tCount, "songlist");
  }

  handle_new_song(tMsg) {
    const tID = tMsg.connection.GetIntFrom();
    let tName = tMsg.connection.GetStrFrom();
    tName = convertSpecialChars(tName, 0);
    return this.getComponent().updateEditorSong(tID, tName);
  }

  handle_user_song_disks(tMsg) {
    return this.getComponent().parseUserDisks(tMsg);
  }

  handle_jukebox_disks(tMsg) {
    return this.getComponent().parseJukeboxDisks(tMsg);
  }

  handle_jukebox_song_added(tMsg) {
    const tID = tMsg.connection.GetIntFrom();
    const tLength = tMsg.connection.GetIntFrom();
    let tName = tMsg.connection.GetStrFrom();
    let tAuthor = tMsg.connection.GetStrFrom();
    tName = convertSpecialChars(tName, 0);
    tAuthor = convertSpecialChars(tAuthor, 0);
    return this.getComponent().insertPlaylistSong(tID, tLength, tName, tAuthor);
  }

  handle_song_locked(tMsg) {
    return this.getComponent().handleSongLocked();
  }

  handle_jukebox_playlist_full(tMsg) {
    return this.getComponent().handleJukeBoxPlaylistFull();
  }

  handle_invalid_song_length(tMsg) {
    return this.getComponent().handleInvalidSongLength();
  }

  handle_song_saved(tMsg) {
    return this.getComponent().updateEditorSong(VOID, VOID);
  }

  regMsgList(tBool) {
    const tMsgs = propList();
    tMsgs.setaProp(300, Symbol.for("handle_song_info"));
    tMsgs.setaProp(301, Symbol.for("handle_machine_sound_packages"));
    tMsgs.setaProp(302, Symbol.for("handle_user_sound_packages"));
    tMsgs.setaProp(332, Symbol.for("handle_invalid_song_name"));
    tMsgs.setaProp(322, Symbol.for("handle_song_list"));
    tMsgs.setaProp(323, Symbol.for("handle_play_list"));
    tMsgs.setaProp(324, Symbol.for("handle_song_missing_packages"));
    tMsgs.setaProp(325, Symbol.for("handle_play_list_invalid"));
    tMsgs.setaProp(326, Symbol.for("handle_song_list_full"));
    tMsgs.setaProp(331, Symbol.for("handle_new_song"));
    tMsgs.setaProp(333, Symbol.for("handle_user_song_disks"));
    tMsgs.setaProp(334, Symbol.for("handle_jukebox_disks"));
    tMsgs.setaProp(335, Symbol.for("handle_jukebox_song_added"));
    tMsgs.setaProp(336, Symbol.for("handle_song_locked"));
    tMsgs.setaProp(337, Symbol.for("handle_jukebox_playlist_full"));
    tMsgs.setaProp(338, Symbol.for("handle_invalid_song_length"));
    tMsgs.setaProp(339, Symbol.for("handle_song_saved"));
    const tCmds = propList();
    tCmds.setaProp("INSERT_SOUND_PACKAGE", 219);
    tCmds.setaProp("EJECT_SOUND_PACKAGE", 220);
    tCmds.setaProp("GET_SONG_INFO", 221);
    tCmds.setaProp("NEW_SONG", 239);
    tCmds.setaProp("SAVE_SONG_NEW", 240);
    tCmds.setaProp("EDIT_SONG", 241);
    tCmds.setaProp("SAVE_SONG_EDIT", 242);
    tCmds.setaProp("BURN_SONG", 254);
    tCmds.setaProp("SONG_EDIT_CLOSE", 246);
    tCmds.setaProp("UPDATE_PLAY_LIST", 243);
    tCmds.setaProp("GET_SONG_LIST", 244);
    tCmds.setaProp("GET_PLAY_LIST", 245);
    tCmds.setaProp("DELETE_SONG", 248);
    tCmds.setaProp("ADD_JUKEBOX_DISC", 255);
    tCmds.setaProp("REMOVE_JUKEBOX_DISC", 256);
    tCmds.setaProp("JUKEBOX_PLAYLIST_ADD", 257);
    tCmds.setaProp("GET_JUKEBOX_DISCS", 258);
    tCmds.setaProp("GET_USER_SONG_DISCS", 259);
    tCmds.setaProp("RESET_JUKEBOX", 260);
    if (tBool) {
      registerListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      registerCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    } else {
      unregisterListener(getVariable("connection.info.id"), this.getID(), tMsgs);
      unregisterCommands(getVariable("connection.info.id"), this.getID(), tCmds);
    }
    return 1;
  }
}
