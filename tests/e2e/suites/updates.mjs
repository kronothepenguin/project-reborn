import { readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { root } from "../lib/hotel.mjs";
import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// Signing in makes its SSO ticket only once update 0008 gave sso_tickets its new
// form, and logs the failure while it waits (decision server/0043).
// The game server loads the navigator and the catalogue only once the updates
// are applied, when a player first needs them, and says so at both ends
// (decisions server/0064, server/0098 and reborn/0006).
export const logs = [
  /^cms: \S+ \S+ WARN auth: login: no SSO ticket err=".*sso_tickets has no column named session_id/,
  /^server: \S+ \S+ WARN server: the navigator and the catalogue wait for the database updates$/,
  /^server: \S+ \S+ INFO server: the navigator and the catalogue are loaded$/,
];

// Every update of the release, which waits on a hotel from before updates.
const updates = readdirSync(path.join(root, "packages/store/migrations")).filter((name) => name.endsWith(".sql")).length;

// The hotel is made like one installed before updates existed: its tables are
// the baseline's, with no migrations table and none of the tables and columns
// later updates add, and they hold the installed hotel's rows in the columns the
// baseline has. Its home store is empty, nobody holds housekeeping.database, and
// config.json lacks its proxy section.
export const prepare = ({ dir, sql }) => {
  seedStaff(sql);
  const file = path.join(dir, "habbo.db");
  const before = `${file}.before-updates`;
  const db = new DatabaseSync(before);
  db.exec(readFileSync(path.join(root, "packages/store/migrations/0001-baseline.sql"), "utf8"));
  db.exec("PRAGMA foreign_keys = OFF");
  db.prepare("ATTACH DATABASE ? AS installed").run(file);
  const tables = db
    .prepare("SELECT name FROM main.sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map(({ name }) => name);
  const columns = (table, schema) =>
    db.prepare("SELECT name FROM pragma_table_info(?, ?)").all(table, schema).map(({ name }) => name);
  for (const table of tables) {
    const installed = columns(table, "installed");
    const shared = columns(table, "main").filter((column) => installed.includes(column));
    if (shared.length === 0) continue;
    const list = shared.map((column) => `"${column}"`).join(", ");
    db.exec(`INSERT INTO main."${table}" (${list}) SELECT ${list} FROM installed."${table}"`);
  }
  db.exec("DETACH DATABASE installed");
  db.exec("DELETE FROM home_store_items");
  db.exec("DELETE FROM home_store_categories");
  db.exec("DELETE FROM access_group_attributes WHERE attribute = 'housekeeping.database'");
  db.close();
  for (const suffix of ["", "-wal", "-shm"]) rmSync(file + suffix, { force: true });
  renameSync(before, file);
  const config = JSON.parse(readFileSync(path.join(dir, "config.json"), "utf8"));
  delete config.proxy;
  writeFileSync(path.join(dir, "config.json"), `${JSON.stringify(config, null, 2)}\n`);
};

export default async function (t) {
  const { base, check, dir, hk, shot, sql } = t;

  {
    const { context, page } = await session(t);
    const response = await page.goto(`${base}/`);
    check(
      "a guest finds the hotel closed while updates wait",
      response.status() === 503 &&
        (await page.getByRole("button", { name: "Sign in" }).count()) === 1,
      String(response.status()),
    );
    await shot(page, "updates-maintenance");
    await context.close();
  }

  {
    const { context, page } = await session(t, "Helper");
    check(
      "a helper signs in and finds no way to the updates",
      (await page.getByRole("link", { name: "Apply them in housekeeping" }).count()) === 0,
    );
    const response = await page.goto(`${hk}/`);
    check(
      "housekeeping tells a helper that the hotel is being updated",
      response.status() === 503 &&
        (await page.getByText("is being updated").count()) === 1,
      String(response.status()),
    );
    await shot(page, "updates-helper");
    await context.close();
  }

  const { context, page, problems } = await session(t, "Admin-1");
  const apply = page.getByRole("link", { name: "Apply them in housekeeping" });
  check(
    "the administrator signs in and finds the way to the updates",
    (await apply.getAttribute("href")) === `${hk}/updates`,
    await apply.getAttribute("href"),
  );
  await shot(page, "updates-signed-in");
  await apply.click();
  await page.waitForURL("**/housekeeping/updates");
  const waiting = await page
    .locator("form[action='/housekeeping/updates'] tbody tr")
    .count();
  check("the update page lists every update", waiting === updates, String(waiting));
  check(
    "config.json's new keys are offered with their defaults",
    (await page.getByLabel("proxy.enabled").inputValue()) === "false" &&
      (await page.getByLabel("proxy.trusted").inputValue()) ===
        '["127.0.0.1","::1"]',
  );
  await shot(page, "updates-waiting");

  await page.getByRole("button", { name: "Apply Updates" }).click();
  await page.waitForURL((url) => url.searchParams.has("applied"));
  check(
    "the updates are applied",
    (await page
      .getByText("The database has every update of this release.")
      .count()) === 1,
  );
  const copies = readdirSync(dir).filter((file) =>
    file.startsWith("habbo.db.backup-"),
  );
  check("a copy of the database was saved first", copies.length === 1, copies.join(", "));
  const [[items]] = sql("SELECT COUNT(*) FROM home_store_items");
  check("the hotel received Holo's home store", Number(items) === 298, String(items));
  await shot(page, "updates-applied");

  await page.getByRole("button", { name: "Save config.json" }).click();
  await page.waitForURL((url) => url.searchParams.has("config"));
  const config = JSON.parse(readFileSync(`${dir}/config.json`, "utf8"));
  check(
    "config.json gains its proxy section",
    config.proxy?.enabled === false && config.proxy?.trusted?.length === 2,
    JSON.stringify(config),
  );
  check(
    "config.json has nothing left to offer",
    (await page.getByRole("button", { name: "Save config.json" }).count()) === 0,
  );
  await shot(page, "updates-config");

  const me = await page.goto(`${base}/me`);
  check("the hotel opens once the updates are applied", me.status() === 200, String(me.status()));
  const dashboard = await page.goto(`${hk}/`);
  check("housekeeping opens too", dashboard.status() === 200, String(dashboard.status()));
  check("no page failed", problems.length === 0, problems.join(", "));
  await context.close();
}
