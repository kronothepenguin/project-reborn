import { MemberObject } from "../member.js";

/**
 * QuickTime cast member (Chapter 6: Media Types — "QuickTime").
 *
 * Represents a QuickTime cast member.
 *
 * Excluded from v1 full implementation per FR-012 (stub only). The full QuickTime surface
 * (enableHotSpot/getHotSpotRect/nudge/ptToHotSpotID/qtRegisterAccessKey/.../swing/
 * QuickTimeVersion etc.) is not implemented in this release.
 */
export class QuickTimeMember extends MemberObject {}