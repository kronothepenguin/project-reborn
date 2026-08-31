import { MemberObject } from "../member.js";

/**
 * Flash Movie cast member (Chapter 6: Media Types — "Flash Movie").
 *
 * Represents a cast member or sprite that contains Flash content.
 *
 * Excluded from v1 full implementation per FR-012 (stub only). The full Flash surface
 * (callFrame/clearAsObjects/findLabel/flashToStage/.../stream/tellTarget etc.) is not implemented
 * in this release.
 */
export class FlashMember extends MemberObject {}