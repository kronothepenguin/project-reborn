export default class {
  pChannelCount;
  pChannelList;
  pMuted;
  pUpdateInterval;

  construct() {
    this.pMuted = 0;
    this.pChannelCount = 5;
    this.pChannelList = list();
    this.pUpdateInterval = 0;
    for (let i = 1; i <= this.pChannelCount; i++) {
      const tObject = createObject(Symbol.for("temp"), "Sound Channel Class");
      if (tObject.define(i)) {
        this.pChannelList.add(tObject);
      }
    }
    registerMessage(Symbol.for("set_all_sounds"), this.getID(), Symbol.for("setSoundState"));
  }

  deconstruct() {
    unregisterMessage(Symbol.for("set_all_sounds"), this.getID());
    for (let i = 1; i <= this.pChannelCount; i++) {
      const tObject = this.getChannel(i);
      if (tObject != 0) {
        tObject.reset();
      }
    }
    this.pChannelList = VOID;
    this.pChannelCount = VOID;
    return 1;
  }

  getProperty(tPropID) {
    switch (tPropID) {
      case Symbol.for("channelCount"):
        return this.pChannelList.count;
      default:
        return 0;
    }
  }

  setProperty(tPropID, tValue) {
    switch (tPropID) {
      default:
        return 0;
    }
  }

  getChannel(tNum) {
    if ((tNum < 0) || (tNum > this.pChannelList.count)) {
      return 0;
    }
    return this.pChannelList[tNum];
  }

  print(tCount) {
    if (integerp(tCount)) {
    }
  }

  play(tMemName, tPriority, tProps) {
    let tObject = this.createSoundInstance(tMemName, tPriority, tProps);
    switch (tPriority) {
      case Symbol.for("pass"):
      case VOID: {
        for (let i = 1; i <= this.pChannelCount; i++) {
          const tStatus = this.pChannelList[i].getTimeRemaining();
          if (tStatus == 0) {
            return this.pChannelList[i].play(tObject);
          }
        }
        return 0;
      }
      case Symbol.for("cut"): {
        const tStatusList = propList();
        for (let i = 1; i <= this.pChannelCount; i++) {
          const tStatus = this.pChannelList[i].getTimeRemaining();
          if (tStatus == 0) {
            return this.pChannelList[i].play(tObject);
          }
          if (!this.pChannelList[i].getIsReserved()) {
            tStatusList.addProp(tStatus, i);
          }
        }
        if (tStatusList.count == 0) {
          return 0;
        }
        tStatusList.sort();
        return this.pChannelList[tStatusList[1]].play(tObject);
      }
      case Symbol.for("queue"): {
        const tStatusList = propList();
        for (let i = 1; i <= this.pChannelCount; i++) {
          const tStatus = this.pChannelList[i].getTimeRemaining();
          if (tStatus == 0) {
            return this.pChannelList[i].play(tObject);
          }
          if (!this.pChannelList[i].getIsReserved()) {
            tStatusList.addProp(tStatus, i);
          }
        }
        if (tStatusList.count == 0) {
          return 0;
        }
        tStatusList.sort();
        return this.pChannelList[tStatusList[1]].queue(tObject);
      }
    }
    tObject = VOID;
    return 0;
  }

  playInChannel(tMemName, tChannelNum) {
    const tChannel = this.getChannel(tChannelNum);
    if (tChannel == 0) {
      return error(VOID, `Invalid sound channel: ${tChannelNum}`, Symbol.for("playInChannel"), Symbol.for("minor"));
    }
    const tObject = this.createSoundInstance(tMemName, VOID, VOID);
    tChannel.reset();
    return tChannel.play(tObject);
  }

  queue(tMemName, tChannelNum, tProps) {
    const tChannel = this.getChannel(tChannelNum);
    if (tChannel == 0) {
      return error(VOID, `Invalid sound channel: ${tChannelNum}`, Symbol.for("queue"), Symbol.for("minor"));
    }
    const tObject = this.createSoundInstance(tMemName, VOID, tProps);
    const tRetVal = tChannel.queue(tObject);
    if (tRetVal) {
      tChannel.setReserved();
    }
  }

  stopChannel(tNum) {
    if (tNum == VOID) {
      return 0;
    }
    if ((tNum < 1) || (tNum > this.pChannelList.count)) {
      return 0;
    }
    return this.pChannelList[tNum].reset();
  }

  playChannel(tNum) {
    if (tNum == VOID) {
      return 0;
    }
    if ((tNum < 1) || (tNum > this.pChannelList.count)) {
      return 0;
    }
    return this.pChannelList[tNum].startPlaying();
  }

  stopAllSounds() {
    for (let i = 1; i <= this.pChannelCount; i++) {
      this.pChannelList[i].reset();
    }
    return 1;
  }

  setSoundState(tValue) {
    if (tValue) {
      this.pMuted = 0;
    } else {
      this.pMuted = 1;
    }
    for (let i = 1; i <= this.pChannelCount; i++) {
      this.pChannelList[i].setSoundState(tValue);
    }
    return 1;
  }

  getSoundState() {
    return not this.pMuted;
  }

  createSoundInstance(tMemName, tPriority, tProps) {
    const tObject = createObject(Symbol.for("temp"), "Sound Instance Class");
    if (tObject == 0) {
      return 0;
    }
    tObject.define(tMemName, tPriority, tProps);
    return tObject;
  }
}
