import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { enter } from "../lib/game.mjs";
import { freePort, portBusy } from "../lib/hotel.mjs";

export const emptyFolder = true;
export const programs = ["reborn"];

// reborn logs that it installs a new hotel, its move to the new port and the
// end of the installation (decision reborn/0004, packages/reborn's run.md).
// The game logs each login, here of the habbo that Ctrl-C logs out.
export const logs = [
  /^reborn: \S+ \S+ INFO reborn installs a new hotel under \/installer\/$/,
  /^reborn: \S+ \S+ INFO reborn moves to http:\/\/localhost:\d+$/,
  /^reborn: \S+ \S+ INFO reborn: the hotel is installed config=\S+ database=\S+$/,
  /^reborn: \S+ \S+ INFO game: habbo \d+ Admin-1 logged in$/,
];

// The folder holds only the address of reborn and of the game, on free ports,
// so the run leaves the default ports to a development server.
export function prepare({ dir, ports }) {
  const config = {
    reborn: { host: "localhost", port: ports.reborn },
    server: {
      info: { host: "localhost", port: ports.info },
      mus: { host: "localhost", port: ports.mus },
    },
  };
  writeFileSync(path.join(dir, "config.json"), `${JSON.stringify(config, null, 2)}\n`);
}

// The whole hotel in one process: the installer from an empty folder, the move
// to a new port, the site and housekeeping on that port, the game's doors, a
// second start, and Ctrl-C logging the habbo inside out.
export default async function ({ browser, check, dir, eventually, ports, shot, sql, start, stop }) {
  const first = `http://localhost:${ports.reborn}`;
  const port = await freePort();
  const base = `http://localhost:${port}`;
  const context = await browser.newContext();
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });

  // The installer, from an empty folder.
  await page.goto(`${first}/`);
  check("/ sends a new hotel to /installer/", page.url() === `${first}/installer/`, page.url());
  await page.goto(`${first}/installer/config`);
  check(
    "the config step asks one host and one port",
    (await page.locator('input[name="host"]').count()) === 1 &&
      (await page.locator('input[name="port"]').count()) === 1 &&
      (await page.locator('input[name="housekeepingPort"]').count()) === 0,
  );
  await page.fill('input[name="port"]', String(port));
  // The move redirects to the same path on the new port, so the browser lands
  // on the config step there, with the new port saved.
  await Promise.all([
    page.waitForURL(`${base}/installer/config`),
    page.getByRole("button", { name: "Save address" }).click(),
  ]);
  check("the config step lands on the new port", page.url() === `${base}/installer/config`, page.url());
  check(
    "the old port refuses connections",
    await eventually(async () => !(await portBusy(ports.reborn))),
  );
  const config = JSON.parse(readFileSync(path.join(dir, "config.json"), "utf8"));
  check("config.json holds the new port", config.reborn.port === port, JSON.stringify(config.reborn));
  check(
    "the form on the new port shows the new port",
    (await page.inputValue('input[name="port"]')) === String(port),
    await page.inputValue('input[name="port"]'),
  );
  // A save with the same port stays on the same server and goes on.
  await Promise.all([
    page.waitForURL(`${base}/installer/site`),
    page.getByRole("button", { name: "Save address" }).click(),
  ]);
  check("a save with the same port goes on to the site step", page.url() === `${base}/installer/site`, page.url());

  check(
    "the site step asks no housekeeping address",
    (await page.locator('input[name="housekeepingUrl"]').count()) === 0,
  );
  await page.fill('input[name="name"]', "Reborn Hotel");
  await page.fill('input[name="shortName"]', "Reborn");
  await page.fill('input[name="url"]', base);
  await Promise.all([
    page.waitForURL(`${base}/installer/settings`),
    page.click('button:has-text("Save and continue")'),
  ]);
  await Promise.all([
    page.waitForURL(`${base}/installer/client`),
    page.click('button:has-text("Skip")'),
  ]);
  check(
    "the client files step follows the site step",
    (await page.getByText("missing", { exact: true }).count()) === 2,
    await page.locator("body").innerText(),
  );
  await Promise.all([
    page.waitForURL(`${base}/installer/admin`),
    page.click('button:has-text("Skip")'),
  ]);
  await page.fill('input[name="name"]', "Admin-1");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="bornOn"]', "1990-05-01");
  await page.fill('input[name="password"]', "secret123");
  await page.fill('input[name="passwordConfirm"]', "secret123");
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/installer/admin")),
    page.click('button:has-text("Create administrator")'),
  ]);
  check(
    "Create administrator ends on the site's front page",
    page.url() === `${base}/` && (await page.locator('input[name="username"]').count()) === 1,
    page.url(),
  );
  if (page.url() !== `${base}/`) await page.goto(`${base}/`);
  await shot(page, "reborn-front");
  const gone = await page.goto(`${base}/installer/`);
  check("/installer/ answers 404 once installed", gone.status() === 404, String(gone.status()));

  // The administrator signs in on the site and opens housekeeping.
  await page.goto(`${base}/`);
  await page.fill('input[name="username"]', "Admin-1");
  await page.fill('input[name="password"]', "secret123");
  await Promise.all([page.waitForURL(`${base}/me`), page.click('button[type="submit"]')]);
  check("the administrator signs in", page.url() === `${base}/me`, page.url());
  await page.goto(`${base}/housekeeping/`);
  check(
    "the administrator opens housekeeping on the same port",
    (await page.locator("header strong").first().innerText()) === "Admin-1",
    await page.locator("body").innerText(),
  );
  await shot(page, "reborn-housekeeping");

  // The game's doors are open.
  check("the game listens on its info port", await eventually(() => portBusy(ports.info)));
  const habbo = await enter(page, base, ports.info);
  check("a WebSocket on the info port receives the game's first message", (await habbo.until(0)).id === 0);
  habbo.leave();
  await habbo.closed;

  // A second start in the same folder goes straight to the hotel.
  await stop("reborn");
  await start("reborn");
  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  const front = await guest.goto(`${base}/`);
  check(
    "a second start serves the site at /",
    front.status() === 200 && guest.url() === `${base}/` && (await guest.locator('input[name="username"]').count()) === 1,
    `${front.status()} ${guest.url()}`,
  );
  const again = await guest.goto(`${base}/installer/`);
  check("a second start answers 404 at /installer/", again.status() === 404, String(again.status()));
  await guestContext.close();
  check("the game listens again", await eventually(() => portBusy(ports.info)));

  // Ctrl-C logs the habbo inside out, with the closing notice held 5 seconds.
  const inside = await enter(page, base, ports.info);
  sql(`UPDATE avatar_game_data SET last_online_at = NULL`);
  const stopping = stop("reborn", "SIGINT");
  let notice;
  try {
    notice = await inside.until(292);
  } catch {
    notice = null;
  }
  check("Ctrl-C sends the habbo inside the closing notice", notice?.body === "HHI", notice?.body);
  await inside.closed;
  check(
    "its connection closes 5 seconds after the notice",
    notice && inside.closedAt - notice.at >= 4500 && inside.closedAt - notice.at < 7000,
    notice && `${inside.closedAt - notice.at} ms`,
  );
  const code = await stopping;
  check("reborn ends with status 0", code === 0, String(code));
  const [[online]] = sql(
    `SELECT g.last_online_at FROM avatar_game_data g JOIN avatars a ON a.id = g.avatar_id WHERE a.name = 'Admin-1'`,
  );
  check("Ctrl-C saves the habbo's last time online", online !== null, String(online));
  check("the site and the game ports close", !(await portBusy(port)) && !(await portBusy(ports.info)));

  check("no page error and no server error", problems.length === 0, problems.join("; "));
  await context.close();
}
