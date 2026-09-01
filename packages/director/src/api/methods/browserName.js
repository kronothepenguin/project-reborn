// @owner top
let browserPath = "";
let browserEnabled = false;

function getBrowserName() {
  if (typeof globalThis.navigator === "undefined") return browserPath;
  const ua = String(globalThis.navigator.userAgent || "").toLowerCase();
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("safari")) return "Safari";
  return browserPath;
}

export function browserName(arg1, arg2) {
  if (arg1 === undefined) {
    return getBrowserName();
  }
  if (typeof arg1 === "symbol" && String(arg1) === "Symbol(enabled)") {
    browserEnabled = Boolean(arg2);
    return;
  }
  if (typeof arg1 === "string" && arg1.startsWith("#")) {
    const prop = arg1.slice(1).toLowerCase();
    if (prop === "enabled") {
      browserEnabled = Boolean(arg2);
      return;
    }
  }
  browserPath = String(arg1);
}

export function _getBrowserEnabled() {
  return browserEnabled;
}

export function _resetBrowserNameForTests() {
  browserPath = "";
  browserEnabled = false;
}
