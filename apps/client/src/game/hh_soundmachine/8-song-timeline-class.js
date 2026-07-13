export default class {
  pSongData;
  pTimeLineData;
  pReady;
  pDataReady;
  pSongID;
  pSongName;
  pSongLength;
  pChanged;
  pSongControllerID;
  pChannelCount;
  pSlotCount;
  pSlotDuration;
  pSampleNameBase;

  construct() {
    this.pReady = 0;
    this.pChanged = 0;
    this.pChannelCount = 4;
    this.pSlotCount = 150;
    this.pSlotDuration = 2000;
    this.pSampleNameBase = "sound_machine_sample_";
    this.pSongControllerID = "song controller";
    this.clearTimeLine();
    return 1;
  }

  deconstruct() {
    return 1;
  }

  resetChanged() {
    this.pChanged = 0;
  }

  reset(tWaitForData) {
    this.pDataReady = !tWaitForData;
    this.pSongID = 0;
    this.pSongName = EMPTY;
    this.pSongLength = 0;
    this.clearTimeLine();
  }

  updateSongID(tNewID) {
    this.pSongID = tNewID;
  }

  updateSongName(tNewName) {
    this.pSongName = tNewName;
  }

  soundSetRemoved(tID) {
    for (const tChannel of this.pTimeLineData) {
      for (let tSlot = 1; tSlot <= tChannel.count; tSlot++) {
        if (!voidp(tChannel[tSlot])) {
          let tSampleID = tChannel[tSlot];
          if (tSampleID < 0) {
            tSampleID = -tSampleID;
          }
          if (this.getSampleSetID(tSampleID) == tID) {
            this.pChanged = 1;
            tChannel[tSlot] = VOID;
          }
        }
      }
    }
    for (const tChannel of this.pSongData) {
      for (let tSlot = 1; tSlot <= tChannel.count; tSlot++) {
        const tSample = tChannel[tSlot];
        if (!voidp(tSample)) {
          const tSampleID = tSample[Symbol.for("id")];
          if (this.getSampleSetID(tSampleID) == tID) {
            this.pChanged = 1;
            tChannel[tSlot] = VOID;
          }
        }
      }
    }
  }

  checkSoundSetReferences(tID) {
    for (const tChannel of this.pTimeLineData) {
      for (let tSlot = 1; tSlot <= tChannel.count; tSlot++) {
        if (!voidp(tChannel[tSlot])) {
          let tSampleID = tChannel[tSlot];
          if (tSampleID < 0) {
            tSampleID = -tSampleID;
          }
          if (this.getSampleSetID(tSampleID) == tID) {
            return 1;
          }
        }
      }
    }
    for (const tChannel of this.pSongData) {
      for (const tSample of tChannel) {
        if (!voidp(tSample)) {
          const tSampleID = tSample[Symbol.for("id")];
          if (this.getSampleSetID(tSampleID) == tID) {
            return 1;
          }
        }
      }
    }
    return 0;
  }

  getSongID() {
    return this.pSongID;
  }

  getSongName() {
    return this.pSongName;
  }

  getChannelCount() {
    return this.pChannelCount;
  }

  getSlotCount() {
    return this.pSlotCount;
  }

  getChanged() {
    return this.pChanged;
  }

  getReady() {
    return this.pReady;
  }

  getDataReady() {
    return this.pDataReady;
  }

  getSlotDuration() {
    return this.pSlotDuration;
  }

  getTimeLineData() {
    return this.pTimeLineData;
  }

  clearTimeLine(tSongLength) {
    this.pTimeLineData = list();
    this.pSongData = list();
    if (voidp(tSongLength)) {
      tSongLength = this.pSlotCount;
    }
    for (let i = 1; i <= this.pChannelCount; i++) {
      const tChannel = list();
      for (let j = 1; j <= this.pSlotCount; j++) {
        tChannel[j] = VOID;
      }
      const tChannelSong = list();
      for (let j = 1; j <= tSongLength; j++) {
        tChannelSong[j] = VOID;
      }
      this.pTimeLineData[i] = tChannel;
      this.pSongData[i] = tChannelSong;
    }
    this.pReady = 1;
    this.pPlayHeadPosX = 0;
    this.pChanged = 1;
  }

  parseSongData(tdata, tSongID, tSongName) {
    this.pSongID = tSongID;
    this.pSongName = tSongName;
    let tSongLength = 0;
    for (let i = 1; i <= tdata.count; i++) {
      const tChannel = tdata[i];
      let tSlot = 1;
      for (const tSample of tChannel) {
        const tLength = tSample[Symbol.for("length")];
        tSlot = tSlot + tLength;
      }
      if ((tSlot - 1) > tSongLength) {
        tSongLength = tSlot - 1;
      }
    }
    this.clearTimeLine(tSongLength);
    this.pChanged = 0;
    for (let i = 1; i <= tdata.count; i++) {
      const tChannel = tdata[i];
      if (i <= this.pSongData.count) {
        const tSongChannel = this.pSongData[i];
        let tSlot = 1;
        for (const tSample of tChannel) {
          const tID = tSample[Symbol.for("id")];
          const tLength = tSample[Symbol.for("length")];
          if (tSlot <= tSongChannel.count) {
            this.pSongData[i][tSlot] = tSample.duplicate();
          }
          tSlot = tSlot + tLength;
        }
      }
    }
    this.pReady = 0;
    this.pDataReady = 1;
    return 1;
  }

  processSongData() {
    if (this.pReady) {
      return 1;
    }
    if (!this.pDataReady) {
      return 0;
    }
    for (let i = min(this.pSongData.count, this.pTimeLineData.count); i >= 1; i--) {
      for (let j = min(this.pTimeLineData[i].count, this.pSongData[i].count); j >= 1; j--) {
        if (this.pTimeLineData[i][j] < 0) {
          this.pTimeLineData[i][j] = VOID;
        }
      }
    }
    let tReady = 1;
    const tLengthCache = propList();
    for (let i = 1; i <= min(this.pSongData.count, this.pTimeLineData.count); i++) {
      const tSongChannel = this.pSongData[i];
      const tTimeLineChannel = this.pTimeLineData[i];
      for (let j = 1; j <= tSongChannel.count; j++) {
        const tSample = tSongChannel[j];
        if (!voidp(tSample)) {
          let tID = tSample[Symbol.for("id")];
          const tLength = tSample[Symbol.for("length")];
          let tSampleLength;
          if (tLengthCache.findPos(tID) > 0) {
            tSampleLength = tLengthCache.getProp(tID);
          } else {
            tSampleLength = this.getSampleLength(tID);
            tLengthCache.addProp(tID, tSampleLength);
          }
          let tWasReady = 1;
          if (tSampleLength == 0) {
            tSampleLength = 1;
            tID = -tID;
            tReady = 0;
            tWasReady = 0;
          }
          if (tID != 0) {
            let tIsFree = 1;
            if (!this.getIsFreeBlock(j, i, tLength)) {
              tIsFree = 0;
            }
            const tRepeats = tLength / tSampleLength;
            for (let k = 1; k <= tRepeats; k++) {
              let tCanInsert;
              if (tIsFree) {
                tCanInsert = 1;
              } else {
                tCanInsert = this.getCanInsertSample(j + ((k - 1) * tSampleLength), i, tID);
              }
              if (tCanInsert) {
                tTimeLineChannel[j + ((k - 1) * tSampleLength)] = tID;
              }
            }
          }
          if (tWasReady) {
            tSongChannel[j] = VOID;
          }
        }
      }
    }
    this.pReady = tReady;
    return tReady;
  }

  resolveSongLength() {
    let tLength = 0;
    for (let tChannel = 1; tChannel <= this.pTimeLineData.count; tChannel++) {
      const tChannelData = this.pTimeLineData[tChannel];
      let tSlot = 1;
      while (tSlot <= tChannelData.count) {
        if (!voidp(tChannelData[tSlot])) {
          const tSampleID = tChannelData[tSlot];
          const tSampleLength = this.getSampleLength(tSampleID);
          if ((tSampleLength != 0) && (tSampleID >= 0)) {
            while (tChannelData[tSlot] == tSampleID) {
              tSlot = tSlot + tSampleLength;
              if ((tSlot - 1) > tLength) {
                tLength = tSlot - 1;
              }
              if (tSlot > tChannelData.count) {
                break;
              }
            }
          } else {
            tSlot = tSlot + 1;
            if (tSampleID < 0) {
              if ((tSlot - 1) > tLength) {
                tLength = tSlot - 1;
              }
            }
          }
          continue;
        }
        while (voidp(tChannelData[tSlot])) {
          tSlot = tSlot + 1;
          if (tSlot > tChannelData.count) {
            break;
          }
        }
      }
    }
    return tLength;
  }

  getCanInsertSample(tX, tY, tID) {
    const tLength = this.getSampleLength(tID);
    return this.getIsFreeBlock(tX, tY, tLength);
  }

  getIsFreeBlock(tX, tY, tLength) {
    if (tLength != 0) {
      if ((tX >= 1) && ((tX + (tLength - 1)) <= this.pSlotCount) && (tY >= 1) && (tY <= this.pTimeLineData.count)) {
        const tChannel = this.pTimeLineData[tY];
        for (let i = tX; i <= tX + tLength - 1; i++) {
          if (!voidp(tChannel[i])) {
            return 0;
          }
        }
        for (let i = tX - 1; i >= 1; i--) {
          if (!voidp(tChannel[i])) {
            const tNumber = tChannel[i];
            if ((i + (this.getSampleLength(tNumber) - 1)) >= tX) {
              return 0;
              continue;
            }
            return 1;
          }
        }
        return 1;
      }
    }
    return 0;
  }

  getSongData() {
    this.pSongLength = this.resolveSongLength();
    if (this.pSongLength == 0) {
      return 0;
    }
    const tSongData = propList("offset", 0, "sounds", list());
    for (let tChannel = 1; tChannel <= this.pTimeLineData.count; tChannel++) {
      const tChannelData = this.pTimeLineData[tChannel];
      let tEmpty = 1;
      for (let i = 1; i <= this.pSongLength; i++) {
        if (!voidp(tChannelData[i])) {
          tEmpty = 0;
          break;
        }
      }
      if (!tEmpty) {
        let tSlot = 1;
        while (tSlot <= this.pSongLength) {
          if (!voidp(tChannelData[tSlot])) {
            const tSampleID = tChannelData[tSlot];
            const tSampleLength = this.getSampleLength(tSampleID);
            if ((tSampleLength != 0) && (tSampleID >= 0)) {
              let tCount = 0;
              while (tChannelData[tSlot] == tSampleID) {
                tCount = tCount + 1;
                tSlot = tSlot + tSampleLength;
                if (tSlot > this.pSongLength) {
                  break;
                }
              }
              const tSampleName = this.getSampleName(tSampleID);
              const tSampleData = propList("name", tSampleName, "loops", tCount, "channel", tChannel);
              tSongData[Symbol.for("sounds")][tSongData[Symbol.for("sounds")].count + 1] = tSampleData;
            } else {
              const tSampleName = this.getSampleName(0);
              const tSampleData = propList("name", tSampleName, "loops", 1, "channel", tChannel);
              tSongData[Symbol.for("sounds")][tSongData[Symbol.for("sounds")].count + 1] = tSampleData;
              tSlot = tSlot + 1;
            }
            continue;
          }
          let tCount = 0;
          while (voidp(tChannelData[tSlot])) {
            tCount = tCount + 1;
            tSlot = tSlot + 1;
            if (tSlot > this.pSongLength) {
              break;
            }
          }
          const tSampleName = this.getSampleName(0);
          const tSampleData = propList("name", tSampleName, "loops", tCount, "channel", tChannel);
          tSongData[Symbol.for("sounds")][tSongData[Symbol.for("sounds")].count + 1] = tSampleData;
        }
      }
    }
    return tSongData;
  }

  getSilentSongData() {
    return propList("offset", 0, "sounds", list(propList("name", "sound_machine_sample_0", "loops", 10, "channel", 1)));
  }

  insertSample(tSlot, tChannel, tID) {
    const tInsert = this.getCanInsertSample(tSlot, tChannel, tID);
    if (tInsert) {
      this.pChanged = 1;
      this.pTimeLineData[tChannel][tSlot] = tID;
      return 1;
    }
    return 0;
  }

  removeSample(tSlot, tChannel) {
    if ((tChannel >= 1) && (tChannel <= this.pTimeLineData.count)) {
      if ((tSlot >= 1) && (tSlot <= this.pTimeLineData[tChannel].count)) {
        if (!voidp(this.pTimeLineData[tChannel][tSlot])) {
          if (this.pTimeLineData[tChannel][tSlot] < 0) {
            return 0;
          }
        } else {
          for (let i = tSlot - 1; i >= 1; i--) {
            if (!voidp(this.pTimeLineData[tChannel][i])) {
              const tSampleID = this.pTimeLineData[tChannel][i];
              if (tSampleID >= 0) {
                const tSampleLength = this.getSampleLength(tSampleID);
                if (tSampleLength != 0) {
                  if ((i + (tSampleLength - 1)) >= tSlot) {
                    tSlot = i;
                    break;
                    continue;
                  }
                  return 0;
                }
              }
            }
          }
        }
        this.pChanged = 1;
        this.pTimeLineData[tChannel][tSlot] = VOID;
        return 1;
      }
    }
    return 0;
  }

  encodeTimeLineData() {
    if (!this.pReady || !this.pDataReady) {
      return 0;
    }
    let tStr = EMPTY;
    const tSongLength = this.resolveSongLength();
    if (tSongLength > 0) {
      for (let i = 1; i <= this.pTimeLineData.count; i++) {
        const tChannel = this.pTimeLineData[i];
        tStr = `${tStr}${i}:`;
        let j = 1;
        const tChannelData = list();
        while (j <= tSongLength) {
          let tSample;
          if (voidp(tChannel[j])) {
            tSample = propList("id", 0, "length", 1);
            j = j + 1;
          } else {
            let tSampleID = tChannel[j];
            const tSampleLength = this.getSampleLength(tSampleID);
            if (tSampleID < 0) {
              tSampleID = -tSampleID;
            }
            if (tSampleLength == 0) {
              tSample = propList("id", 0, "length", 1);
            } else {
              tSample = propList("id", tSampleID, "length", tSampleLength);
            }
            j = j + tSample[Symbol.for("length")];
          }
          tChannelData[tChannelData.count + 1] = tSample;
        }
        j = 1;
        while (j < tChannelData.count) {
          if (tChannelData[j][Symbol.for("id")] == tChannelData[j + 1][Symbol.for("id")]) {
            tChannelData[j][Symbol.for("length")] = tChannelData[j][Symbol.for("length")] + tChannelData[j + 1][Symbol.for("length")];
            tChannelData.deleteAt(j + 1);
            continue;
          }
          j = j + 1;
        }
        let tChannelStr = EMPTY;
        for (const tSample of tChannelData) {
          if (tChannelStr != EMPTY) {
            tChannelStr = `${tChannelStr};`;
          }
          tChannelStr = `${tChannelStr}${tSample[Symbol.for("id")]}${","}${tSample[Symbol.for("length")]}`;
        }
        tStr = `${tStr}${tChannelStr}:`;
      }
    }
    return tStr;
  }

  getSampleLength(tSampleID) {
    if (tSampleID < 0) {
      return 1;
    }
    let tLength = 0;
    const tSampleName = this.getSampleName(tSampleID);
    const tSongController = getObject(this.pSongControllerID);
    if (tSongController != 0) {
      const tReady = tSongController.getSampleLoadingStatus(tSampleName);
      if (!tReady) {
        const tDelim = the.itemDelimiter;
        the.itemDelimiter = "_";
        const tSampleno = tSampleName.item[4] - 1;
        const tSamplesPerSEt = 9;
        const tParentNo = (integer(tSampleno) / tSamplesPerSEt) + 1;
        const tParentId = `sound_set_${tParentNo}`;
        the.itemDelimiter = tDelim;
        tSongController.preloadSounds(list(propList("sound", tSampleName, "parent", tParentId)));
      } else {
        tLength = tSongController.getSampleLength(tSampleName);
        tLength = (tLength + (this.pSlotDuration - 1)) / this.pSlotDuration;
      }
    }
    return tLength;
  }

  getSampleName(tSampleID) {
    const tName = `${this.pSampleNameBase}${tSampleID}`;
    return tName;
  }

  getSampleSetID(tSampleID) {
    return 1 + ((tSampleID - 1) / 9);
  }
}
