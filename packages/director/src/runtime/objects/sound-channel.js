export class SoundChannelObject {
  /**
   * Sound Channel property; determines the number of channels in the currently playing or paused
   * sound in a given sound channel. Read-only.
   * This property is useful for determining whether a sound is in monaural or in stereo.
   */
  channelCount = 0;

  /**
   * Sound Channel property; gives the time, in milliseconds, that the current sound member in a
   * sound channel has been playing. Read-only.
   * The elapsed time starts at 0 when the sound begins playing and increases as the sound plays,
   * regardless of any looping, setting of the currentTime or other manipulation. Use the
   * currentTime to test for the current absolute time within the sound.
   * The value of this property is a floating-point number, allowing for measurement of sound
   * playback to fractional milliseconds.
   */
  elapsedTime = 0;

  /**
   * Sound Channel property; specifies the end time of the currently playing, paused, or queued
   * sound. Read/write.
   * The end time is the time within the sound member when it will stop playing. It’s a floating-point
   * value, allowing for measurement and control of sound playback to fractions of milliseconds. The
   * default value is the normal end of the sound.
   * This property may be set to a value other than the normal end of the sound only when passed as a
   * parameter with the queue() or setPlayList() methods.
   */
  endTime = 0;

  /**
   * Sound Channel property; specifies the total number of times the current sound in a sound
   * channel is set to loop. Read-only.
   * The default value of this property is 1 for sounds that are simply queued with no internal loop.
   * You can loop a portion of a sound by passing the parameters loopStartTime, loopEndTime, and
   * loopCount with a queue() or setPlayList() method. These are the only methods for setting
   * this property.
   * If loopCount is set to 0, the loop will repeat forever. If the sound cast member’s loop property is
   * set to TRUE, loopCount will return 0.
   */
  loopCount = 0;

  /**
   * Sound Channel property; specifies the end time, in milliseconds, of the loop set in the current
   * sound playing in a sound channel. Read-only.
   * The value of this property is a floating-point number, allowing you to measure and control sound
   * playback to fractions of a millisecond.
   * This property can only be set when passed as a property in a queue() or setPlaylist()
   * command.
   */
  loopEndTime = 0;

  /**
   * Sound Channel property; specifies the start time, in milliseconds, of the loop for the current
   * sound being played by a sound channel. Read-only.
   * Its value is a floating-point number, allowing you to measure and control sound playback to
   * fractions of a millisecond. The default is the startTime of the sound if no loop has been defined.
   * This property can only be set when passed as a property in a queue() or setPlaylist()
   * methods.
   */
  loopStartTime = 0;

  /**
   * Sound Channel property; specifies the number of times left to play a loop in the current sound
   * playing in a sound channel. Read-only.
   * If the sound had no loop specified when it was queued, this property is 0. If this property is tested
   * immediately after a sound starts playing, it returns one less than the number of loops defined with
   * the #loopCount property in the queue() or setPlayList() methods.
   */
  loopsRemaining = 0;

  /**
   * Sound Channel property; specifies the sound cast member currently playing in a sound channel.
   * Read-only.
   * This property returns VOID (Lingo) or null (JavaScript syntax) if no sound is being played.
   */
  member = null;

  /**
   * Sound Channel property; indicates the left/right balance of the sound playing in a sound channel.
   * Read/write.
   * The range of values is from -100 to 100. -100 indicates only the left channel is heard. 100
   * indicate only the right channel is being heard. A value of 0 indicates even left/right balance,
   * causing the sound source to appear to be centered. For mono sounds, pan affects which speaker
   * (left or right) the sound plays through.
   * You can change the pan of a sound object at any time, but if the sound channel is currently
   * performing a fade, the new pan setting doesn’t take effect until the fade is complete.
   * To see an example of pan used in a completed movie, see the Sound Control movie in the
   * Learning/Lingo Examples folder inside the Director application folder.
   */
  pan = 0;

  /**
   * Sound Channel property; specifies the number of sound samples in the currently playing sound
   * in a sound channel. Read-only.
   * This is the total number of samples, and depends on the sampleRate and duration of the
   * sound. It does not depend on the channelCount of the sound.
   * A 1-second, 44.1 KHz sound contains 44,100 samples.
   */
  sampleCount = 0;

  /**
   * Sound Channel property; returns, in samples per second, the sample rate of the sound cast
   * member or in the case of SWA sound, the original file that has been Shockwave Audio–encoded.
   * Read-only.
   * This property is available only after the SWA sound begins playing or after the file has been
   * preloaded using the preLoadBuffer() method. When a sound channel is given, the result is the
   * sample rate of the currently playing sound cast member in the given sound channel.
   * Typical values of this property are 8000, 11025, 16000, 22050, and 44100.
   * When multiple sounds are queued in a sound channel, Director plays them all with the
   * channelCount, sampleRate, and sampleSize of the first sound queued, resampling the rest for
   * smooth playback. Director resets these properties only after the channel’s sound queue is
   * exhausted or a stop() method is issued. The next sound to be queued or played then
   * determines the new settings.
   */
  sampleRate = 0;

  /**
   * Sound Channel property; indicates the start time of the currently playing or paused sound as set
   * when the sound was queued. Read-only.
   * This property cannot be set after the sound has been queued. If no value was supplied when the
   * sound was queued, this property returns 0.
   */
  startTime = 0;

  /**
   * Sound Channel property; indicates the status of a sound channel. Read-only.
   * Possible values include:
   * Status       Name          Meaning
   * 0            Idle          No sounds are queued or playing.
   * 1            Loading       A queued sound is being preloaded but is not yet playing.
   * 2            Queued        The sound channel has finished preloading a queued sound but is not yet
   *                            playing the sound.
   * 3            Playing       A sound is playing.
   * 4            Paused        A sound is paused.
   */
  status = 0;

  /**
   * Sound Channel property; determines the volume of a sound channel. Read/write.
   * Sound channels are numbered 1, 2, 3, and so on up to 8. Channels 1 and 2 are the channels that
   * appear in the Score.
   * The value of the volume property ranges from 0 (mute) to 255 (maximum volume). A value of
   * 255 indicates the full volume set for the machine, as controlled by the Sound object’s
   * soundLevel property, and lower values are scaled to that total volume. This property allows
   * several channels to have independent settings within the available range.
   * The lower the value of the volume sound property, the more static or noise you’re likely to hear.
   * Using soundLevel may produce less noise, although this property offers less control.
   * To see an example of volume used in a completed movie, see the Sound Control movie in the
   * Learning/Lingo Examples folder inside the Director application folder.
   */
  volume = 0;

  /**
   * Sprite and sound channel property; returns the current playing time, in milliseconds, for a sound
   * sprite, QuickTime digital video sprite, or any Xtra extension that supports cue points. For a
   * sound channel, returns the current playing time of the sound member currently playing in the
   * given sound channel.
   * This property can be tested, but can only be set for traditional sound cast members (WAV, AIFF,
   * SND). When this property is set, the range of allowable values is from zero to the duration of
   * the member.
   * Shockwave Audio (SWA) sounds can appear as sprites in sprite channels, but they play sound in
   * a sound channel. You should refer to SWA sound sprites by their sprite channel number rather
   * than by a sound channel number.
   */
  currentTime = 0;

  channel = 0;
  loop = false;
  isPlaying = false;

  constructor(channel) {
    this.channel = channel;
  }

  /**
   * Sound Channel method; causes the currently looping sound in channel soundChannelObjRef to
   * stop looping and play through to its endTime.
   * If there is no current loop, this method has no effect.
   */
  breakLoop() {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; immediately sets the volume of a sound channel to zero and then brings
   * it back to the current volume over a given number of milliseconds.
   * The current pan setting is retained for the entire fade.
   *
   * @param {number} [intMilliseconds] An integer that specifies the number of milliseconds over which the volume is increased back to its original value. The default is 1000 milliseconds (1 second) if no value is given.
   */
  fadeIn(intMilliseconds) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; gradually reduces the volume of a sound channel to zero over a given
   * number of milliseconds.
   * The current pan setting is retained for the entire fade.
   *
   * @param {number} [intMilliseconds] An integer that specifies the number of milliseconds over which the volume is reduced to zero. The default is 1000 milliseconds (1 second) if no value is given.
   */
  fadeOut(intMilliseconds) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; gradually changes the volume of a sound channel to a specified volume
   * over a given number of milliseconds.
   * The current pan setting is retained for the entire fade.
   * To see an example of fadeTo() used in a completed movie, see the Sound Control movie in the
   * Learning/Lingo folder inside the Director application folder.
   *
   * @param {number} intVolume An integer that specifies the volume level to change to. The range of values for intVolume volume is 0 to 255.
   * @param {number} [intMilliseconds] An integer that specifies the number of milliseconds over which the volume is changed to intVolume. The default value is 1000 milliseconds (1 second) if no value is given.
   */
  fadeTo(intVolume, intMilliseconds) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; returns a copy of the list of queued sounds for a sound channel.
   * The returned list does not include the currently playing sound, nor may it be edited directly. You
   * must use setPlayList().
   * The playlist is a linear list of property lists. Each property list corresponds to one queued sound
   * cast member. Each queued sound may specify these properties:
   * #member — The sound cast member to queue. This property must be provided; all others are optional.
   * #startTime — The time within the sound at which playback begins, in milliseconds. The default is the beginning of the sound. See startTime.
   * #endTime — The time within the sound at which playback ends, in milliseconds. The default is the end of the sound. See endTime.
   * #loopCount — The number of times to play a loop defined with #loopStartTime and #loopEndTime. The default is 1. See loopCount.
   * #loopStartTime — The time within the sound to begin a loop, in milliseconds. See loopStartTime.
   * #loopEndTime — The time within the sound to end a loop, in milliseconds. See loopEndTime.
   * #preloadTime — The amount of the sound to buffer before playback, in milliseconds. See preloadTime.
   */
  getPlayList() {
    return [];
  }

  /**
   * Sound Channel method; determines whether a sound is playing (TRUE) or not playing (FALSE) in
   * a sound channel.
   * Make sure that the playhead has moved before using isBusy() to check the sound channel. If
   * this function continues to return FALSE after a sound should be playing, add the updateStage()
   * method to start playing the sound before the playhead moves again.
   * This method works for those sound channels occupied by actual audio cast members.
   * QuickTime, Flash, and Shockwave Player audio handle sound differently, and this method will
   * not work with those media types.
   * Consider using the status property of a sound channel instead of isBusy(). The status
   * property can be more accurate under many circumstances.
   */
  isBusy() {
    return false;
  }

  /**
   * Sound Channel method; suspends playback of the current sound in a sound channel.
   * A subsequent play() method will resume playback.
   */
  pause() {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; begins playing any sounds queued in a sound channel, or queues and
   * begins playing a given cast member.
   * Sound cast members take some time to load into RAM before they can begin playback. It’s
   * recommended that you queue sounds with queue() before you want to begin playing them and
   * then use the first form of this method. The second two forms do not take advantage of the pre-
   * loading accomplished with the queue() command.
   * By using an optional property list, you can specify exact playback settings for a sound.
   * To see an example of play() used in a completed movie, see the Sound Control movie in the
   * Learning/Lingo folder inside the Director application folder.
   *
   * @param {object} [memberObjRef] A reference to the cast member object to queue and play.
   * @param {object} [propList] A property list that specifies the exact playback settings for the sound.
   */
  play(memberObjRef, propList) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; plays the AIFF, SWA, AU, or WAV sound in a sound channel.
   * For the sound to be played properly, the correct MIX Xtra must be available to the movie, usually
   * in the Xtras folder of the application.
   * When the sound file is in a different folder than the movie, stringFilePath must specify the full
   * path to the file.
   * To play sounds obtained from a URL, it’s usually a good idea to use downloadNetThing() or
   * preloadNetThing() to download the file to a local disk first. This approach can minimize
   * problems that may occur while the file is downloading.
   * The playFile() method streams files from disk rather than playing them from RAM. As
   * a result, using playFile() when playing digital video or when loading cast members into
   * memory can cause conflicts when the computer tries to read the disk in two places at once.
   *
   * @param {string} stringFilePath A string that specifies the name of the file to play. When the sound file is in a different folder than the currently playing movie, stringFilePath must also specify the full path to the file.
   */
  playFile(stringFilePath) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; immediately interrupts playback of the current sound playing in a
   * sound channel and begins playing the next queued sound.
   * If no more sounds are queued in the given channel, the sound simply stops playing.
   */
  playNext() {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; adds a sound cast member to the queue of a sound channel.
   * Once a sound has been queued, it can be played immediately with the play() method. This is
   * because Director preloads a certain amount of each sound that is queued, preventing any delay
   * between the play() method and the start of playback. The default amount of sound that is
   * preloaded is 1500 milliseconds. This parameter can be modified by passing a property list
   * containing one or more parameters with the queue() method. These parameters can also be
   * passed with the setPlayList() method.
   * To see an example of queue() used in a completed movie, see the Sound Control movie in the
   * Learning/Lingo folder inside the Director application folder.
   *
   * @param {object} [memberObjRef] A reference to the sound cast member to queue.
   * @param {object} [propList] A property list that applies to the sound cast member to queue.
   */
  queue(memberObjRef, propList) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; interrupts the playback of the current sound in a sound channel and
   * restarts it at its startTime.
   * If the sound is paused, it remains paused, with the currentTime set to the startTime.
   */
  rewind() {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; sets or resets the playlist of a sound channel.
   * This method is useful for queueing several sounds at once.
   * To see an example of setPlaylist() used in a completed movie, see the Sound Control movie in
   * the Learning/Lingo folder inside the Director application folder.
   *
   * @param {Array} linearListOfPropLists A linear list of property lists that specifies parameters of a playlist.
   */
  setPlayList(linearListOfPropLists) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound Channel method; stops the currently playing sound in a sound channel.
   * Issuing a play() method begins playing the first sound of those that remain in the queue of the
   * given sound channel.
   * To see an example of stop() used in a completed movie, see the Sound Control movie in the
   * Learning/Lingo folder inside the Director application folder.
   */
  stop() {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }
}