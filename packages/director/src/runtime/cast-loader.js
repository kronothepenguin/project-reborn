// Load cast libraries from URLs via dynamic import.

import { CastLibraryRef } from "../core/cast-library-ref.js";

export async function loadCast(url, { name = null, number = null } = {}) {
  if (typeof url !== "string" || url.length === 0) {
    const err = new TypeError("loadCast: url must be a non-empty string");
    console.error("[cast-loader] invalid url", err);
    throw err;
  }

  let module;
  try {
    module = await import(/* @vite-ignore */ url);
  } catch (err) {
    console.error("[cast-loader] failed to load cast", url, err);
    throw err;
  }

  const factory = module.default ?? module.cast ?? module;
  let castLibRef;

  if (factory instanceof CastLibraryRef) {
    castLibRef = factory;
  } else if (factory && typeof factory === "object" && "members" in factory) {
    const inferredName = name ?? factory.name ?? _basename(url);
    const inferredNumber = number ?? (CastLibraryRef.castLib ? Object.keys(CastLibraryRef.castLib).length + 1 : 1);
    castLibRef = new CastLibraryRef({ name: inferredName, number: inferredNumber });
    if (Array.isArray(factory.members)) {
      for (const member of factory.members) {
        castLibRef._addMember(member);
      }
    }
  } else if (typeof factory === "function") {
    const result = factory();
    if (result instanceof CastLibraryRef) {
      castLibRef = result;
    } else {
      castLibRef = new CastLibraryRef({
        name: name ?? _basename(url),
        number: number ?? (CastLibraryRef.castLib ? Object.keys(CastLibraryRef.castLib).length + 1 : 1),
      });
    }
  } else {
    castLibRef = new CastLibraryRef({
      name: name ?? _basename(url),
      number: number ?? (CastLibraryRef.castLib ? Object.keys(CastLibraryRef.castLib).length + 1 : 1),
    });
  }

  CastLibraryRef._register(castLibRef);
  return castLibRef;
}

function _basename(url) {
  try {
    const cleaned = url.split("?")[0].split("#")[0];
    const parts = cleaned.split("/");
    const last = parts[parts.length - 1] ?? url;
    return last.replace(/\.js$/, "");
  } catch {
    return url;
  }
}
