import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

// The hotel is made like one installed before updates existed: no migrations
// table, an empty home store and no housekeeping.database, with a config.json
// that lacks its proxy section.
export const prepare = ({ dir, sql }) => {
  seedStaff(sql);
  sql("DROP TABLE migrations");
  sql("DELETE FROM home_store_items");
  sql("DELETE FROM home_store_categories");
  sql("DELETE FROM access_group_attributes WHERE attribute = 'housekeeping.database'");
  const file = `${dir}/config.json`;
  const config = JSON.parse(readFileSync(file, "utf8"));
  delete config.proxy;
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
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
  check("the update page lists every update", waiting === 4, String(waiting));
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
