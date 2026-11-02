// The home art ships inside the CMS binary, so that a hotel needs no other host.
export default async function ({ base, check }) {
  for (const path of [
    "stickers/sticker_arrow_down.gif",
    "backgrounds2/bg_colour_05.gif",
    "backgrounds2/BB_Group2.png",
    "album1584/ADM.gif",
    "skins/Skin_Goldenframe_topL.png",
    "skins/girl/Skin_HCpillow_topL.png",
  ]) {
    const response = await fetch(`${base}/c_images/${path}`);
    const bytes = (await response.arrayBuffer()).byteLength;
    check(
      `${path} is served`,
      response.status === 200 &&
        response.headers.get("content-type").startsWith("image/") &&
        bytes > 0,
      `${response.status} ${response.headers.get("content-type")} ${bytes}`,
    );
  }
}
