export default class {
  pChannelNum;
  pEndTime;
  pCounter;
  pMuted;
  pVolume;
  pReserved;

  define(tChannelNum) {
    this.pChannelNum = tChannelNum;
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Invalid sound channel: ${this.pChannelNum}`, Symbol.for("define"), Symbol.for("major"));
    }
    this.pCounter = 0;
    this.pEndTime = 0;
    this.pMuted = 0;
    this.pVolume = 255;
    this.pReserved = 0;
    return 1;
  }

  setSoundState(tstate) {
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("setSoundState"), Symbol.for("major"));
    }
    if (tstate) {
      tChannel.volume = this.pVolume;
      this.pMuted = 0;
    } else {
      tChannel.volume = 0;
      this.pMuted = 1;
    }
  }

  reset() {
    this.pEndTime = 0;
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("reset"), Symbol.for("major"));
    }
    tChannel.setPlayList(list());
    tChannel.stop();
    this.pReserved = 0;
    return 1;
  }

  play(tSoundObj) {
    const tmember = tSoundObj.getMember();
    if (tmember == 0) {
      return 0;
    }
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("play"), Symbol.for("major"));
    }
    let tLoopCount;
    if (tSoundObj.getProperty(Symbol.for("infiniteloop"))) {
      tLoopCount = 0;
    } else {
      tLoopCount = tSoundObj.getProperty(Symbol.for("loopCount"));
      if (tLoopCount == VOID) {
        tLoopCount = 1;
      }
    }
    this.pVolume = tSoundObj.getProperty(Symbol.for("volume"));
    if (!this.pMuted) {
      tChannel.volume = this.pVolume;
    } else {
      tChannel.volume = 0;
    }
    this.pEndTime = the.milliSeconds + (tmember.duration * tLoopCount);
    if (tLoopCount == 0) {
      this.pEndTime = -1;
    }
    tChannel.play(propList("member", tmember, "loopCount", tLoopCount));
    return this.pChannelNum;
  }

  queue(tSoundObj) {
    const tmember = tSoundObj.getMember();
    if (tmember == 0) {
      return 0;
    }
    const tProps = tSoundObj.pProps.duplicate();
    tProps[Symbol.for("member")] = tmember;
    this.pVolume = tProps[Symbol.for("volume")];
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("queue"), Symbol.for("major"));
    }
    tChannel.queue(tProps);
    return 1;
  }

  startPlaying() {
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("startPlaying"), Symbol.for("major"));
    }
    tChannel.play();
    return 1;
  }

  getTimeRemaining() {
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("getTimeRemaining"), Symbol.for("major"));
    }
    if (!tChannel.isBusy() && !this.pReserved) {
      return 0;
    }
    if (this.pEndTime == -1) {
      return Symbol.for("infinite");
    }
    let tDurationLeft = this.pEndTime - the.milliSeconds;
    if (tDurationLeft < 0) {
      tDurationLeft = 0;
    }
    if (this.pReserved && (tDurationLeft == 0)) {
      tDurationLeft = 100000;
    }
    return tDurationLeft;
  }

  setReserved() {
    this.pReserved = 1;
  }

  getIsReserved() {
    return this.pReserved;
  }

  dump() {
    const tChannel = sound(this.pChannelNum);
    if (ilk(tChannel) != Symbol.for("instance")) {
      return error(this, `Sound channel bug: ${this.pChannelNum}`, Symbol.for("dump"), Symbol.for("major"));
    }
    let tName = "<none>";
    if (tChannel.isBusy()) {
      tName = tChannel.member.name;
    }
    putInto(undefined, `* Channel${this.pChannelNum} - Playtime left:${this.getTimeRemaining()}Now playing:${tName}Queue:${tChannel.getPlaylist().count}`);
  }
}
