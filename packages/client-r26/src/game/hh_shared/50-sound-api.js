export function constructSoundManager() {
  return createManager(Symbol.for("sound_manager"), getClassVariable("sound.manager.class", "Sound Manager Class"));
}

export function deconstructSoundManager() {
  return removeManager(Symbol.for("sound_manager"));
}

export function getSoundManager() {
  const tMgr = getObjectManager();
  if (!tMgr.managerExists(Symbol.for("sound_manager"))) {
    return constructSoundManager();
  }
  return tMgr.getManager(Symbol.for("sound_manager"));
}

export function setSoundState(tValue) {
  return getSoundManager().setSoundState(tValue);
}

export function getSoundState() {
  return getSoundManager().getSoundState();
}

export function playSound(tMemName, tPriority, tProps) {
  return getSoundManager().play(tMemName, tPriority, tProps);
}

export function playSoundInChannel(tMemName, tChannelNum) {
  return getSoundManager().playInChannel(tMemName, tChannelNum);
}

export function queueSound(tMemName, tChannelNum, tProps) {
  return getSoundManager().queue(tMemName, tChannelNum, tProps);
}

export function stopAllSounds(tID) {
  if (!managerExists(Symbol.for("sound_manager"))) {
    return 0;
  }
  return getSoundManager().stopAllSounds(tID);
}

export function startSoundChannel(tNum) {
  return getSoundManager().playChannel(tNum);
}

export function stopSoundChannel(tNum) {
  return getSoundManager().stopChannel(tNum);
}
