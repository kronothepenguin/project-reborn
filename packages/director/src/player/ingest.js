// Ingester (008 R2) — build a DirectorContext from a movie definition (C8).
//
// The bundle's default export is the movie definition:
//   { name, casts: CastDefinition[], options: {tempo,width,height,src}, score? }
//   cast: { kind:"cast", name, members: MemberDefinition[] }
//   member: { kind:"member", name, mediaType, payload, registrationPoint? }
//
// Builds the castLibs (populated + empty slots), registers members by their
// canonical name (number implicit in registration order — C8), sets the score
// from the optional `score` section, and activates the context.

import { CastLibraryObject } from "../engine/core/cast-library.js";
import { MemberObject } from "../engine/core/member.js";
import { Score } from "../engine/subsystem/score.js";

function buildMember(memberDef, number) {
  const m = new MemberObject();
  m.name = memberDef.name;
  m.number = number;
  m.mediaType = memberDef.mediaType;
  m.registrationPoint = memberDef.registrationPoint ?? "(0, 0)";
  if (memberDef.payload) {
    m.payload = memberDef.payload;
    if (memberDef.payload.width !== undefined) m.width = memberDef.payload.width;
    if (memberDef.payload.height !== undefined) m.height = memberDef.payload.height;
  }
  return m;
}

export function ingestDefinition(ctx, definition) {
  if (!definition || typeof definition !== "object") {
    throw new TypeError("ingestDefinition: definition is required");
  }

  const casts = Array.isArray(definition.casts) ? definition.casts : [];
  const populated = casts.map((castDef, slotIndex) => {
    const lib = new CastLibraryObject();
    lib.name = castDef.name || `Cast ${slotIndex + 1}`;
    lib.number = slotIndex + 1;
    lib.member = {};
    if (Array.isArray(castDef.members)) {
      castDef.members.forEach((memberDef, i) => {
        const member = buildMember(memberDef, i + 1);
        lib.member[member.name] = member;
        lib.member[member.number] = member;
        ctx.memberRegistry.register(lib, member);
      });
    }
    return lib;
  });

  // Fill the castLibs array: populated slots + empty casts so `castLib(n)`
  // indexing matches the movie's slot numbers (C8: 70 empty of 73 in habbo).
  const totalSlots = definition.totalCastSlots ?? casts.length;
  ctx.castLibs = [];
  ctx.movie.castLib = {};
  ctx.movie.castLibs = ctx.castLibs;
  for (let i = 0; i < totalSlots; i++) {
    let lib;
    if (i < populated.length) {
      lib = populated[i];
    } else {
      lib = new CastLibraryObject();
      lib.name = i + 1 <= casts.length ? casts[i]?.name ?? "" : "";
      lib.number = i + 1;
      lib.member = {};
    }
    ctx.castLibs[i] = lib;
    ctx.movie.castLib[lib.number] = lib;
    if (lib.name) ctx.movie.castLib[lib.name] = lib;
  }

  const opts = definition.options ?? {};
  if (opts.tempo !== undefined) ctx.tempo = opts.tempo;
  if (opts.width !== undefined) ctx.width = opts.width;
  if (opts.height !== undefined) ctx.height = opts.height;
  if (opts.src !== undefined) ctx.src = opts.src;

  if (definition.score) {
    ctx.score = new Score(definition.score);
  }

  ctx.activate();
  return ctx;
}