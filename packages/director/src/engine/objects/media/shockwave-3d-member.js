import { MemberObject } from "../member.js";

/**
 * Shockwave 3D cast member (Chapter 6: Media Types — "Shockwave 3D").
 *
 * Represents a Macromedia Shockwave 3D cast member. A Shockwave 3D (or simply 3D) cast member
 * differs from other cast members in that a 3D cast member contains a complete 3D world.
 *
 * Excluded from v1 full implementation per FR-012 (stub only). The full 3D object API surface
 * (Chapter 8) is not implemented in this release.
 */
export class Shockwave3DMember extends MemberObject {}