// Load cast libraries from URLs via dynamic import.

import { CastLibraryObject } from "../engine/core/cast-library.js";

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
  let castLibObject;

  if (factory instanceof CastLibraryObject) {
    castLibObject = factory;
  } else if (factory && typeof factory === "object" && "members" in factory) {
    const inferredName = name ?? factory.name ?? _basename(url);
    const inferredNumber = number ?? (CastLibraryObject.castLib ? Object.keys(CastLibraryObject.castLib).length + 1 : 1);
    castLibObject = new CastLibraryObject({ name: inferredName, number: inferredNumber });
    if (Array.isArray(factory.members)) {
      for (const member of factory.members) {
        castLibObject._addMember(member);
      }
    }
  } else if (typeof factory === "function") {
    const result = factory();
    if (result instanceof CastLibraryObject) {
      castLibObject = result;
    } else {
      castLibObject = new CastLibraryObject({
        name: name ?? _basename(url),
        number: number ?? (CastLibraryObject.castLib ? Object.keys(CastLibraryObject.castLib).length + 1 : 1),
      });
    }
  } else {
    castLibObject = new CastLibraryObject({
      name: name ?? _basename(url),
      number: number ?? (CastLibraryObject.castLib ? Object.keys(CastLibraryObject.castLib).length + 1 : 1),
    });
  }

  CastLibraryObject._register(castLibObject);
  return castLibObject;
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
