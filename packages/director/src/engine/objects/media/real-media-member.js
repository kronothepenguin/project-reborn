import { MemberObject } from "../member.js";

/**
 * RealMedia cast member (Chapter 6: Media Types — "RealMedia").
 *
 * Represents a RealMedia cast member.
 *
 * Excluded from v1 full implementation per FR-012 (stub only). The full RealMedia surface
 * (pause/play/realPlayerNativeAudio/realPlayerPromptToInstall/realPlayerVersion/seek/stop etc.)
 * is not implemented in this release.
 */
export class RealMediaMember extends MemberObject {}