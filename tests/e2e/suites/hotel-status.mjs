import { enter } from "../lib/game.mjs";
import { session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// Each stop closes the game's doors, through the hotel's switch and through the
// site's (plan of hotel-status, "The game closes its doors"). A start with a
// switch still on keeps them closed, which the run already expects. The game
// logs each login, here of the habbo that enters.
export const logs = [
  /^server: \S+ \S+ INFO server: the doors are closed$/,
  /^server: \S+ \S+ INFO game: habbo \d+ Admin-1 logged in$/,
];

// The hotel's status across the three programs: the site shows whether the game
// runs and who is inside, housekeeping's switches stop and start it, and its
// forms say what the game does. Admin-1 enters the hotel as the client does.
export default async function (t) {
  const { base, check, eventually, hk, ports, shot } = t;
  const { context, page, problems } = await session(t, "Admin-1");
  const name = "Reborn Hotel";

  // header reads the header of the community page as the habbo sees it.
  async function header() {
    await page.goto(`${base}/community`);
    const enter = page.locator("#enter-hotel-open-medium-link");
    return {
      enter: (await enter.count()) ? await enter.innerText() : null,
      offline: await page.getByText(`${name} is offline`, { exact: true }).count(),
      picture: await page.locator("header img[src*='hotel-']").first().getAttribute("src"),
      count: await page.getByText(/users online now$/).innerText(),
    };
  }
  const running = async () => {
    const h = await header();
    return h.enter === `Enter ${name}` && !h.offline && h.picture.includes("hotel-open");
  };
  const stopped = async () => {
    const h = await header();
    return (
      h.enter === null && h.offline === 1 && h.picture.includes("hotel-closed") &&
      h.count === "0 users online now"
    );
  };

  // hotelLine reads the status line of the form "Turn your hotel on/off".
  async function hotelLine() {
    await page.goto(`${hk}/settings?section=hotel`);
    return page.locator("main form strong").first().innerText();
  }

  // save sets a switch on its form and applies it.
  async function save(section, key, on) {
    await page.goto(`${hk}/settings?section=${section}`);
    await page.selectOption(`select[name="${key}"]`, on ? "1" : "0");
    await page.getByRole("button", { name: "Apply" }).click();
    await page.waitForURL(/saved=1/);
    check(
      `housekeeping saves ${key} ${on ? "on" : "off"}`,
      (await page.getByRole("status").innerText()) === "Settings saved successfully." &&
        (await page.inputValue(`select[name="${key}"]`)) === (on ? "1" : "0"),
    );
  }

  // The game runs, with nobody inside.
  {
    const h = await header();
    check(
      "while the game runs the header shows Enter with the site's name and the online picture",
      h.enter === `Enter ${name}` && !h.offline && h.picture.includes("hotel-open"),
      JSON.stringify(h),
    );
    check("nobody is inside", h.count === "0 users online now", h.count);
    await shot(page, "hotel-status-running");
  }

  // Admin-1 enters the hotel.
  const habbo = await enter(page, base, ports.info);
  check(
    "a habbo inside the hotel counts on every page",
    await eventually(async () => (await header()).count === "1 users online now"),
  );
  check(
    "the settings form says the game runs, with the habbo inside",
    (await hotelLine()) === "The game server is running, with 1 habbo inside.",
  );
  await page.goto(`${hk}/`);
  const members = page.locator("tr", { hasText: "Members" });
  check(
    "the dashboard counts the habbo online beside Members, with a link to Online Users",
    /^\d+ \(1 online\)$/.test((await members.locator("td").last().innerText()).trim()) &&
      (await members.locator('a[href="/housekeeping/online"]').count()) === 1,
    await members.innerText(),
  );
  await page.goto(`${base}/home/Admin-1`);
  check(
    "the habbo's home shows it online",
    (await page.locator('img[alt="online"]').count()) === 1,
  );
  await page.goto(`${base}/me`);
  check(
    "the Me page offers Enter while the game runs",
    (await page.getByRole("link", { name: /^Enter \S+$/ }).count()) === 1 &&
      (await page.getByText("Hotel Closed", { exact: true }).count()) === 0,
  );

  // Staff close the hotel: the habbo gets the notice, and its connection closes
  // 5 seconds after it.
  await save("hotel", "game.closed", true);
  let notice;
  try {
    notice = await habbo.until(292);
  } catch {
    notice = null;
  }
  check("the habbo inside gets the hotel's closing notice", notice?.body === "HHI", notice?.body);
  await habbo.closed;
  check(
    "its connection closes 5 seconds after the notice",
    notice && habbo.closedAt - notice.at >= 4500 && habbo.closedAt - notice.at < 7000,
    notice && `${habbo.closedAt - notice.at} ms`,
  );

  const closedHotel = async (how) => {
    check(
      `${how}: every page shows 0 online, "is offline" and the offline picture`,
      await eventually(stopped),
      JSON.stringify(await header()),
    );
    await page.goto(`${base}/me`);
    check(
      `${how}: the Me page shows Hotel Closed in place of Enter`,
      (await page.getByText("Hotel Closed", { exact: true }).count()) === 1 &&
        (await page.getByRole("link", { name: /^Enter \S+$/ }).count()) === 0,
    );
    const response = await page.goto(`${base}/client`);
    check(
      `${how}: the client page leads to the Me page`,
      new URL(page.url()).pathname === "/me" && response.status() === 200,
      page.url(),
    );
    await page.goto(`${base}/client/utils?key=error&error=disconnect`);
    check(
      `${how}: a client that lost its connection shows Hotel Closed with the hotel's name`,
      (await page.locator("h2").innerText()) === "Hotel Closed" &&
        (await page.getByText(`${name} is closed at the moment. Please come back later.`).count()) === 1,
    );
    check(`${how}: the settings form says the game is stopped`, (await hotelLine()) === "The game server is stopped.");
  };
  const openHotel = async (how) => {
    check(`${how}: the header shows Enter again`, await eventually(running), JSON.stringify(await header()));
    await page.goto(`${base}/me`);
    check(
      `${how}: the Me page offers Enter again`,
      (await page.getByRole("link", { name: /^Enter \S+$/ }).count()) === 1,
    );
    const response = await page.goto(`${base}/client`);
    check(
      `${how}: the client page opens`,
      response.status() === 200 && new URL(page.url()).pathname === "/client",
      page.url(),
    );
    await page.goto(`${base}/client/utils?key=error&error=disconnect`);
    check(
      `${how}: a client that lost its connection shows the error page as before`,
      (await page.locator("h2").innerText()) === "Fatal Error",
    );
    check(
      `${how}: the settings form says the game runs`,
      (await hotelLine()) === "The game server is running, with 0 habbos inside.",
    );
  };

  await closedHotel("the hotel closed");
  await page.goto(`${base}/community`);
  await shot(page, "hotel-status-closed");
  await page.goto(`${base}/home/Admin-1`);
  check(
    "the habbo's home shows it offline",
    (await page.locator('img[alt="offline"]').count()) === 1 &&
      (await page.locator('img[alt="online"]').count()) === 0,
  );
  await page.goto(`${hk}/`);
  check(
    "the dashboard counts nobody online",
    /\(0 online\)/.test(await page.locator("tr", { hasText: "Members" }).innerText()),
  );

  // The closed hotel stays closed after a restart of the game.
  await t.restart("server");
  await closedHotel("the hotel closed after a restart");

  await save("hotel", "game.closed", false);
  await openHotel("the hotel opened");

  // The site's switch stops and starts the game too.
  await save("maintenance", "site.maintenance", true);
  check(
    "the site closed: the settings form says the game is stopped",
    (await hotelLine()) === "The game server is stopped.",
  );
  await save("maintenance", "site.maintenance", false);
  await openHotel("the site opened");

  // Opening the site leaves a closed hotel closed.
  await save("hotel", "game.closed", true);
  await save("maintenance", "site.maintenance", true);
  await save("maintenance", "site.maintenance", false);
  await closedHotel("the site opened while the hotel is closed");
  await save("hotel", "game.closed", false);
  await openHotel("the hotel opened after the site");

  check("no page errors", problems.length === 0, problems.join("; "));
  await context.close();
}
