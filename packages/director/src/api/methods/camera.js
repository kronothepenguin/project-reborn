// @owner top
export function camera(nameOrNum) {
  const cam = {
    name: nameOrNum == null ? "" : String(nameOrNum),
    rect: { left: 0, top: 0, right: 640, bottom: 480 },
  };
  return cam;
}
