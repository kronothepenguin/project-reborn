import { SoundChannelObject } from "./sound-channel.js";

export class SoundObject {
  /**
   * Sound property; allows the sound mixing device to be set while the movie plays. Read/write.
   * The possible settings for soundDevice are the devices listed in soundDeviceList.
   * Several sound devices can be referenced. The various sound devices for Windows have
   * different advantages.
   * • MacroMix (Windows)—The lowest common denominator for Windows playback. This
   * device functions on any Windows computer, but its latency is not as good as that of other
   * devices.
   * • QT3Mix (Windows)—Mixes sound with QuickTime audio and possibly with other
   * applications if they use DirectSound. This device requires that QuickTime be installed and has
   * better latency than MacroMix.
   * • DirectSound (Windows)—Similar to QT3Mix, but provides higher latency.
   * • MacSoundManager (Macintosh)—The only sound device available on the Macintosh.
   */
  soundDevice = "";

  /**
   * Sound property; creates a linear list of sound devices available on the current computer. Read-
   * only.
   * For the Macintosh, this property lists one device, MacSoundManager.
   */
  soundDeviceList = [];

  /**
   * Sound property; determines whether the sound is on (TRUE, default) or off (FALSE). Read/write.
   * When you set this property to FALSE, the sound is turned off, but the volume setting is
   * not changed.
   */
  soundEnabled = true;

  /**
   * Sound property; for Windows only, determines whether the sound driver unloads and reloads
   * each time a sound needs to play. Read/write.
   * The default value of this property is TRUE, which prevents the sound driver from unloading and
   * reloading each time a sound needs to play.
   * You may need to set this property to FALSE before playing a sound to ensure that the sound device
   * is unloaded and made available to other applications or processes on the computer after the sound
   * has finished.
   * Setting this property to FALSE may adversely affect performance if sound playback is used
   * frequently throughout the Director application.
   */
  soundKeepDevice = true;

  /**
   * Sound property; returns or sets the volume level of the sound played through the computer’s
   * speaker. Read/write.
   * Possible values range from 0 (no sound) to 7 (the maximum, default).
   * In Windows, the system sound setting combines with the volume control of the external speakers.
   * Thus, the actual volume that results from setting the sound level can vary. Avoid setting the
   * soundLevel property unless you are sure that the result is acceptable to the user. It is better to set
   * the individual volumes of the channels and sprites with the Sound Channel object’s volume
   * property.
   * These values correspond to the settings in the Macintosh Sound control panel. Using this
   * property, script can change the sound volume directly or perform some other action when the
   * sound is at a specified level.
   * To see an example of soundLevel used in a completed movie, see the Sound Control movie in
   * the Learning/Lingo Examples folder inside the Director application folder.
   */
  soundLevel = 7;

  /**
   * Sound property; determines whether Flash cast members will mix their sound with sounds in the
   * Score sound channels. Read/write.
   * This property defaults to TRUE for movies made with Director 7 and later and FALSE for
   * earlier ones. It is also valid only on Windows.
   * When this property is TRUE, Flash cast members will mix their sound with sounds in the Score
   * sound channels. Director takes over the mixing and playback of sounds from Flash cast members.
   * It is possible that slight differences may occur in the way Flash sounds play back. To hear the
   * Flash sounds exactly they would be rendered in Flash, set this property to FALSE.
   * When this property is set to FALSE, Flash sounds will not be mixed and must be played at
   * separate times.
   */
  soundMixMedia = true;

  /**
   * Sound method; causes the computer’s speaker to beep the number of times specified by
   * intBeepCount. If intBeepCount is missing, the beep occurs once.
   * • In Windows, the beep is the sound assigned in the Sounds Properties dialog box.
   * • For the Macintosh, the beep is the sound selected from Alert Sounds on the Sound control
   * panel. If the volume on the Sound control panel is set to 0, the menu bar flashes instead.
   *
   * @param {number} [intBeepCount] An integer that specifies the number of times the computer’s speakers should beep.
   */
  beep(intBeepCount) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
  }

  /**
   * Sound method; returns a reference to a specified sound channel.
   * The functionality of this method is identical to the top level sound() method.
   *
   * @param {number} intChannelNum An integer that specifies the sound channel to reference.
   */
  channel(intChannelNum) {
    // TODO(subsystems): route through DirectorContext.audioContext per FR-034
    return new SoundChannelObject(intChannelNum);
  }
}