import { MemberObject } from "../member.js";

/**
 * Sound cast member (Chapter 6: Media Types — "Sound").
 *
 * Represents a cast member that is used to store and refer to sound samples.
 *
 * Sound samples are controlled by the core Sound and Sound Channel objects. A sound cast
 * member does not have any APIs of its own, and uses the APIs of the Sound and Sound Channel
 * objects to control its behavior.
 *
 * You can add a sound cast member to a movie by using the Movie object's newMember() method.
 *
 * See also: Member, Sound, Sound Channel.
 */
export class SoundMember extends MemberObject {}