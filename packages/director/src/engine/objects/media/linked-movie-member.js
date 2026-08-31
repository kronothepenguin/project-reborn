import { MemberObject } from "../member.js";

/**
 * Linked Movie cast member (Chapter 6: Media Types — "Linked Movie").
 *
 * Represents a linked movie cast member.
 *
 * Property summary: `scriptsEnabled`.
 * Excluded from v1 full implementation per FR-012 (stub only); MIAW/sibling-movie playback
 * itself is out of scope per the feature spec.
 */
export class LinkedMovieMember extends MemberObject {
  /**
   * Movie cast member property; determines whether scripts in a movie that is referenced by the
   * specified linked movie cast member are run (TRUE) or suspended (FALSE). Read/write.
   *
   * When scripts are suspended in the linked movie, the handlers in the linked movie's scripts
   * cannot be run by the parent movie. The suspended scripts remain suspended until the
   * scriptsEnabled property is set to TRUE.
   */
  scriptsEnabled = true;
}