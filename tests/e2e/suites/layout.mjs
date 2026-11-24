// The site's two layouts at today's sizes: Holo's font on a 16px base, the
// community layout in flexbox on wide screens, tablets and phones, the two-tone
// main tabs, the sub-navigation and the header's habbo search. Screenshots of
// the signed-out pages at 1366 and 1920 wide, and of the Me and community pages
// at 390, 820, 1366 and 1920.
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

  // The page's columns: the children of main's first flex row, and of its
  // second column's own row on a wide screen.
  const columns = (p) =>
    p.evaluate(() => {
      const row = document.querySelector("main > div");
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width };
      };
      const [first, rest] = row.children;
      const inner = getComputedStyle(rest).flexDirection === "row" ? [...rest.children] : [rest];
      const main = document.querySelector("main").getBoundingClientRect();
      return {
        columns: [first, ...inner].map(box),
        main: { width: main.width, left: main.left, right: document.documentElement.clientWidth - main.right },
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      };
    });

  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto(base + "/community");
  const wide = await columns(page);
  const [c1, c2, c3] = wide.columns.map((c) => c.width);
  check(
    "a community page on a wide screen is Holo's page at 16/11: at most 1352px, centred, its three columns in Holo's 452 / 302 / 160",
    wide.columns.length === 3 &&
      wide.main.width <= 1352 &&
      Math.abs(wide.main.left - wide.main.right) <= 1 &&
      Math.abs(c1 / c2 - 452 / 302) < 0.05 &&
      Math.abs(c3 / c2 - 160 / 302) < 0.05 &&
      wide.scroll <= wide.client,
    JSON.stringify(wide),
  );

  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto(base + "/community");
  const tablet = await columns(page);
  check(
    "a community page on a tablet shows two columns side by side",
    tablet.columns.length === 2 &&
      tablet.columns[1].left > tablet.columns[0].left + tablet.columns[0].width &&
      tablet.columns[0].top === tablet.columns[1].top &&
      tablet.scroll <= tablet.client,
    JSON.stringify(tablet),
  );

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(base + "/community");
  const phone = await page.evaluate(() => {
    const main = document.querySelector("main").getBoundingClientRect();
    const boxes = [...document.querySelectorAll("main .rounded.border")].map((el) => el.getBoundingClientRect()).filter((b) => b.width > 0);
    const fits = (selector) =>
      [...document.querySelectorAll(selector)].every((el) => el.getBoundingClientRect().right <= document.documentElement.clientWidth);
    return {
      main: { left: main.left, width: main.width },
      boxes: boxes.map((b) => ({ left: b.left, width: b.width })),
      header: { logo: fits("header a[href='/'] img"), tabs: fits("header ul li"), nav: fits("nav, nav li") },
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    };
  });
  check(
    "a community page on a phone shows one column, each box as wide as the screen's column, and nothing scrolls sideways",
    phone.boxes.length >= 2 &&
      phone.boxes.every((b) => Math.abs(b.left - phone.main.left) <= 1 && Math.abs(b.width - phone.main.width) <= 1) &&
      phone.main.width >= phone.client - 20 &&
      phone.scroll <= phone.client,
    JSON.stringify(phone),
  );
  check(
    "the header on a phone fits the screen: the logo, the tabs and the sub-navigation",
    phone.header.logo && phone.header.tabs && phone.header.nav,
    JSON.stringify(phone.header),
  );
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(base + "/community");

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

  const view = await me.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, width: r.width, height: r.height };
    };
    const picture = document.querySelector("#hotel-view");
    return {
      box: box(document.querySelector("#new-personal-info")),
      picture: box(picture),
      links: box(document.querySelector("#link-bar")),
      size: getComputedStyle(picture).backgroundSize,
    };
  });
  check(
    "the Me page's hotel view keeps its own size, and its box wraps it with the links beside it, so no empty strip shows",
    view.picture.width === 450 &&
      view.picture.height === 143 &&
      view.size === "auto" &&
      Math.abs(view.picture.left - view.box.left) <= 1 &&
      Math.abs(view.links.left - view.picture.right) <= 1 &&
      Math.abs(view.links.right - view.box.right) <= 1 &&
      Math.abs(view.links.top - view.picture.top) <= 1,
    JSON.stringify(view),
  );

  for (const width of [390, 820, 1366, 1920]) {
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
