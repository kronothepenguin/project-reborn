// The site's two layouts at today's sizes: Holo's font on a 16px base, the
// 1240px page, the two-tone main tabs, the sub-navigation and the header's
// habbo search. Screenshots of the four pages at 1366 and 1920 wide.
import path from "node:path";
import { work } from "../lib/hotel.mjs";
import { session } from "../lib/staff.mjs";

export const programs = ["cms"];

// lightness reads a computed colour, rgb() or oklch(), as a number from 0 to 1.
function lightness(colour) {
  const oklch = /oklch\(([\d.]+)(%?)/.exec(colour);
  if (oklch) return oklch[2] ? Number(oklch[1]) / 100 : Number(oklch[1]);
  const [r, g, b] = (colour.match(/[\d.]+/g) ?? []).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// hue reads the hue of a computed oklch() colour.
function hue(colour) {
  const oklch = /oklch\(\S+ \S+ ([\d.]+)/.exec(colour);
  return oklch ? Number(oklch[1]) : NaN;
}

// faces reads a tab's two tones, its outline and its text.
const faces = (tab) =>
  tab.evaluate((el) => {
    const own = getComputedStyle(el);
    const before = getComputedStyle(el, "::before");
    return {
      lower: own.backgroundColor,
      upper: before.backgroundColor,
      upperHeight: before.height,
      outline: own.borderLeftColor,
      outlineWidth: own.borderLeftWidth,
      bottom: own.borderBottomColor,
      weight: own.fontWeight,
      colour: own.color,
    };
  });

export default async function (t) {
  const { base, browser, check, shot } = t;
  const shots = path.join(work, "shots");

  // A guest: the signed-out front page and register, then the community page.
  const guest = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await guest.newPage();

  for (const width of [1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, name] of [["/", "front"], ["/register", "register"]]) {
      await page.goto(base + route);
      await shot(page, `layout-${name}-${width}`);
    }
  }

  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(base + "/");
  const body = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { size: style.fontSize, family: style.fontFamily };
  });
  check(
    "a visitor reads the site in Holo's font at 16px",
    body.size === "16px" && body.family.startsWith("Verdana, Arial, Helvetica"),
    JSON.stringify(body),
  );
  const signedOut = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  check(
    "a signed-out page at 1366 wide does not scroll sideways",
    signedOut.scroll <= signedOut.client,
    JSON.stringify(signedOut),
  );

  await page.goto(base + "/community");
  const register = page.getByRole("link", { name: "Register now!" });
  const community = page.locator("header strong", { hasText: "Community" });
  const credits = page.locator("header").getByRole("link", { name: "Credits" });

  const page1366 = await page.evaluate(() => {
    const main = document.querySelector("main").getBoundingClientRect();
    return {
      width: main.width,
      left: main.left,
      right: document.documentElement.clientWidth - main.right,
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    };
  });
  check(
    "a community page at 1366 wide is 1240px wide, centred, and does not scroll sideways",
    page1366.width === 1240 && Math.abs(page1366.left - page1366.right) <= 1 && page1366.scroll <= page1366.client,
    JSON.stringify(page1366),
  );

  const blue = await faces(credits);
  check(
    "a main tab has two tones, the upper half lighter, inside a dark outline",
    lightness(blue.upper) > lightness(blue.lower) &&
      blue.upperHeight !== "auto" &&
      blue.outlineWidth === "2px" &&
      lightness(blue.outline) < lightness(blue.lower) &&
      blue.weight === "400",
    JSON.stringify(blue),
  );
  await credits.hover();
  const pointed = await faces(credits);
  check(
    "pointing at a main tab lightens both its tones",
    lightness(pointed.upper) > lightness(blue.upper) && lightness(pointed.lower) > lightness(blue.lower),
    JSON.stringify({ blue, pointed }),
  );
  await page.mouse.move(0, 0);

  const green = await faces(register);
  check(
    "the Register now! tab is green and blue tabs are blue",
    hue(green.lower) > 110 && hue(green.lower) < 160 && hue(blue.lower) > 200 && hue(blue.lower) < 270,
    JSON.stringify({ green: green.lower, blue: blue.lower }),
  );

  const selected = await community.evaluate((el) => {
    const own = getComputedStyle(el);
    const tab = el.getBoundingClientRect();
    const nav = document.querySelector("nav > div").getBoundingClientRect();
    return {
      text: el.textContent.trim(),
      background: own.backgroundColor,
      colour: own.color,
      weight: own.fontWeight,
      bottomWidth: own.borderBottomWidth,
      gap: nav.top - tab.bottom,
      navBackground: getComputedStyle(document.querySelector("nav > div")).backgroundColor,
    };
  });
  check(
    "the selected tab is white with bold black text and opens into the sub-navigation",
    selected.text === "Community" &&
      selected.background === "rgb(255, 255, 255)" &&
      selected.colour === "rgb(0, 0, 0)" &&
      selected.weight === "700" &&
      selected.bottomWidth === "0px" &&
      selected.gap === 0 &&
      selected.navBackground === "rgb(255, 255, 255)",
    JSON.stringify(selected),
  );

  const items = await page.locator("nav li").evaluateAll((lis) =>
    lis.map((li) => {
      const style = getComputedStyle(li);
      return { text: li.textContent.trim(), border: style.borderRightWidth, weight: style.fontWeight, colour: style.color };
    }),
  );
  const news = page.locator("nav").getByRole("link", { name: "News" });
  const before = await news.evaluate((a) => getComputedStyle(a).textDecorationLine);
  await news.hover();
  const after = await news.evaluate((a) => getComputedStyle(a).textDecorationLine);
  await page.mouse.move(0, 0);
  check(
    "the sub-navigation separates its items with thin lines, the selected one bold and black, a link underlined while pointed at",
    items.length === 5 &&
      items.slice(0, -1).every((item) => item.border === "1px") &&
      items.at(-1).border === "0px" &&
      items[0].text === "Community" &&
      items[0].weight === "700" &&
      items[0].colour === "rgb(0, 0, 0)" &&
      items[1].weight === "400" &&
      before === "none" &&
      after === "underline",
    JSON.stringify({ items, before, after }),
  );
  await shot(page, "layout-community-guest-1366");
  await guest.close();

  // A signed-in staff member: the Housekeeping tab and the habbo search.
  const staff = await session(t, "Admin-1");
  const me = staff.page;
  await me.setViewportSize({ width: 1366, height: 900 });
  await me.goto(base + "/me");
  const housekeeping = await faces(me.locator("header").getByRole("link", { name: "Housekeeping" }));
  check(
    "the Housekeeping tab is green and bold",
    hue(housekeeping.lower) > 110 && hue(housekeeping.lower) < 160 && lightness(housekeeping.upper) > lightness(housekeeping.lower),
    JSON.stringify(housekeeping),
  );

  const search = await me.evaluate(() => {
    const form = document.querySelector('header form[action="/home"]');
    const field = form.querySelector("input").getBoundingClientRect();
    const button = form.querySelector("button").getBoundingClientRect();
    const bar = form.parentElement.parentElement.getBoundingClientRect();
    return {
      fieldTop: field.top,
      buttonTop: button.top,
      fieldHeight: field.height,
      buttonHeight: button.height,
      gap: button.left - field.right,
      right: bar.right - button.right,
    };
  });
  check(
    "the habbo search shows its field and its button on one line, the same height, as one group at the right edge",
    search.fieldTop === search.buttonTop &&
      search.fieldHeight === search.buttonHeight &&
      search.gap >= 0 &&
      search.gap <= 4 &&
      Math.abs(search.right) <= 1,
    JSON.stringify(search),
  );

  for (const width of [1366, 1920]) {
    await me.setViewportSize({ width, height: 900 });
    for (const [route, name] of [["/me", "me"], ["/community", "community"]]) {
      await me.goto(base + route);
      await shot(me, `layout-${name}-${width}`);
    }
  }
  await me.setViewportSize({ width: 1366, height: 900 });
  await me.goto(base + "/me");
  await me.locator("header").getByRole("link", { name: "Credits" }).hover();
  await me.screenshot({ path: path.join(shots, "layout-tabs-hover.png"), clip: { x: 40, y: 60, width: 760, height: 130 } });
  await staff.context.close();
}
