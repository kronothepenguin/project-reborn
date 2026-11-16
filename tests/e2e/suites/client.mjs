import { seedStaff, session } from "../lib/staff.mjs";

export const prepare = ({ sql }) => seedStaff(sql);

// Holo's header Enter: Frank opens the client page in the hotel's own window,
// which a second Enter brings forward without loading it again; on a screen
// narrower than 990 pixels the client opens narrow. The client itself needs
// LibreShockwave's player and the client's files, which a test hotel lacks, so
// the suite stops at the page answering.
export default async function (t) {
  const { base, check, shot } = t;
  const awake = (p) =>
    p.waitForFunction(() => !document.querySelector("astro-island[ssr]"));

  const { context, page, problems } = await session(t, "Frank");
  await awake(page);
  const enter = page.locator("#enter-hotel-open-medium-link");
  check(
    "the header offers Enter with the site's name",
    (await enter.innerText()) === "Enter Reborn Hotel" &&
      (await enter.getAttribute("href")) === "/client" &&
      (await enter.getAttribute("target")) === "client",
    await enter.innerText(),
  );

  const [hotel, answer] = await Promise.all([
    page.waitForEvent("popup"),
    context.waitForEvent("response", (r) => new URL(r.url()).pathname === "/client"),
    enter.click(),
  ]);
  hotel.on("pageerror", (e) => problems.push(`client pageerror: ${e.message}`));
  hotel.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });
  await hotel.waitForLoadState();
  check(
    "Enter opens the client page in the window named client",
    answer.status() === 200 &&
      new URL(hotel.url()).pathname === "/client" &&
      new URL(hotel.url()).search === "" &&
      (await hotel.evaluate(() => window.name)) === "client" &&
      !(await hotel.evaluate(() => window.toolbar.visible)),
    `${answer.status()} ${hotel.url()}`,
  );
  await shot(hotel, "client-window");

  let loads = 0;
  hotel.on("framenavigated", (frame) => {
    if (frame === hotel.mainFrame()) loads++;
  });
  let popups = 0;
  context.on("page", () => popups++);
  await enter.click();
  await t.wait(500);
  check(
    "a second Enter brings the open client forward without loading it again",
    loads === 0 && popups === 0 && context.pages().length === 2,
    `${loads} loads, ${popups} new windows`,
  );
  check("no page errors", problems.length === 0, problems.join("; "));
  await context.close();

  const narrow = await t.browser.newContext({
    viewport: { width: 800, height: 600 },
    screen: { width: 800, height: 600 },
  });
  const small = await narrow.newPage();
  await small.goto(`${base}/`);
  await small.fill('input[name="username"]', "Frank");
  await small.fill('input[name="password"]', "secret123");
  await small.click('button[type="submit"]');
  await small.waitForURL("**/me");
  await awake(small);
  const [narrowHotel] = await Promise.all([
    small.waitForEvent("popup"),
    small.locator("#enter-hotel-open-medium-link").click(),
  ]);
  await narrowHotel.waitForLoadState();
  check(
    "a screen narrower than 990 pixels opens the narrow client",
    new URL(narrowHotel.url()).searchParams.get("wide") === "false",
    narrowHotel.url(),
  );
  await narrow.close();
}
