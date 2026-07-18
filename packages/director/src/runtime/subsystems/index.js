// Runtime subsystems barrel (FR-004/FR-005/FR-025/FR-033/FR-036).
//
// Documented cross-class glue that owns shared state OUTSIDE of core-object
// classes (no statics/subsystems as class members — FR-005). One instance per
// `DirectorContext` (per worker), created during context construction.
//
// Subsystems:
//   - MemberRegistry  (member-registry.js)  FR-004/FR-025
//   - NetState         (net-state.js)        FR-033
//   - WindowRegistry   (window-registry.js)  FR-005/FR-036

export { MemberRegistry } from "./member-registry.js";
export { NetState } from "./net-state.js";
export { WindowRegistry } from "./window-registry.js";