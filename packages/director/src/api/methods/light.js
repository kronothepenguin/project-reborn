// @owner top
export function light(nameOrNum) {
  return {
    name: nameOrNum == null ? "" : String(nameOrNum),
  };
}
