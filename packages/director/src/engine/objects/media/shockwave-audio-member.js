import { MemberObject } from "../member.js";

/**
 * Shockwave Audio (SWA) cast member (Chapter 6: Media Types — "Shockwave Audio").
 *
 * Represents a Shockwave Audio cast member.
 *
 * Event summary: `on cuePassed`.
 * Method summary: `getError()`, `getErrorString()`, `isPastCuePoint()`, `pause()`, `play()`,
 * `preLoadBuffer()`, `stop()`.
 * Property summary: `bitRate`, `bitsPerSample`, `channelCount`, `copyrightInfo`, `cuePointNames`,
 * `cuePointTimes`, `duration`, `loop`, `mostRecentCuePoint`, `numChannels`, `percentStreamed`,
 * `preLoadTime`, `sampleRate`, `sampleSize`, `soundChannel`, `state`, `streamName`, `URL`,
 * `volume`.
 *
 * Excluded from v1 full implementation per FR-012 (stub only). Sound playback in v1 routes through
 * the included `SoundMember`/Sound/SoundChannel core objects; SWA streaming is not implemented.
 */
export class ShockwaveAudioMember extends MemberObject {}