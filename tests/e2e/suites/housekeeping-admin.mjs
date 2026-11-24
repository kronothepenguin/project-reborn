import { readdirSync } from "node:fs";
import path from "node:path";
import { root } from "../lib/hotel.mjs";
import { seedStaff, session } from "../lib/staff.mjs";

export const programs = ["cms", "housekeeping"];

export const prepare = ({ sql }) => seedStaff(sql);

// Every update of the release, which the installer applied.
const updates = readdirSync(path.join(root, "packages/store/migrations")).filter((name) => name.endsWith(".sql")).length;

export default async function (t) {
  const { base, check, hk, shot } = t;

  const { context, page, problems } = await session(t, "Admin-1");

  await page.goto(`${hk}/`);
  await page.getByRole("link", { name: "Database updates" }).click();
  await page.waitForURL("**/housekeeping/updates");
  await shot(page, "updates");
  check(
    "the administrator finds every update applied",
    (await page.getByRole("heading", { name: "Applied Updates" }).count()) === 1 &&
      (await page.getByText("The database has every update of this release.").count()) === 1 &&
      (await page.locator("tbody tr").count()) === updates,
    `${await page.locator("tbody tr").count()} rows for ${updates} updates`,
  );

  await page.goto(`${hk}/access-groups`);
  await shot(page, "groups");
  check(
    "the tab is active",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Users & Moderation",
  );

  await page.fill('input[name="name"]', "Trainers");
  await page.fill('input[name="description"]', 'They <moderate> & "care"');
  await page.getByRole("button", { name: "Create Group" }).click();
  await page.waitForURL(/access-groups\/\d+$/);
  const groupURL = page.url();
  check(
    "a new group opens its page",
    (await page.inputValue('input[name="description"]')) ===
      'They <moderate> & "care"',
  );
  // The fuse list beside it posts the same name; the router test proves it.
  const boxes = await page
    .locator("table")
    .filter({ has: page.getByRole("columnheader", { name: "Attribute", exact: true }) })
    .locator('input[name="attribute"]')
    .count();
  check(
    "every attribute of the catalogue has a checkbox",
    boxes === 22,
    String(boxes),
  );

  await page.check('input[name="attribute"][value="housekeeping.access"]');
  await page.check('input[name="attribute"][value="housekeeping.logs"]');
  await page.check('input[name="staffListed"]');
  await page.getByRole("button", { name: "Save Group" }).click();
  await page.waitForURL(/saved=1/);
  // The ticks and the flag come back through the real form's fields.
  check(
    "the ticks stay",
    await page.isChecked('input[name="attribute"][value="housekeeping.logs"]'),
  );
  check(
    "the staff flag stays",
    await page.isChecked('input[name="staffListed"]'),
  );

  await page.fill('input[name="habbo"]', "Frank");
  await page.getByRole("button", { name: "Find User" }).click();
  await page.waitForLoadState();
  const options = await page
    .locator('select[name="habbo"]')
    .last()
    .locator("option")
    .allInnerTexts();
  check(
    "both of Frank's habbos are offered",
    options.join() === "Frank,FrankStaff",
    options.join(),
  );
  await page.locator("#found-habbo").selectOption({ label: "FrankStaff" });
  await shot(page, "group");
  await page.getByRole("button", { name: "Add To Group" }).click();
  await page.waitForURL(/saved=1/);
  const members = await page.locator("main section").nth(1).innerText();
  check(
    "Frank is a member under his display habbo",
    members.includes("FrankStaff (ID:"),
    members.replace(/\s+/g, " ").slice(0, 120),
  );

  await page
    .locator("main section")
    .nth(1)
    .locator('select[name="habbo"]')
    .selectOption({ label: "Frank" });
  await page
    .locator("main section")
    .nth(1)
    .getByRole("button", { name: "Save" })
    .click();
  await page.waitForURL(/saved=1/);
  check(
    "the display habbo changed",
    (await page.locator("main section").nth(1).innerText()).includes(
      "Frank (ID:",
    ),
  );

  await page
    .locator("main section")
    .nth(1)
    .getByRole("button", { name: "Remove" })
    .click();
  await page.waitForURL(/saved=1/);
  check(
    "Frank left",
    (await page.locator("main section").nth(1).innerText()).includes(
      "This group has no members.",
    ),
  );

  await page.goto(groupURL);
  await page.check('input[name="confirm"]');
  await page.getByRole("button", { name: "Delete Group" }).click();
  await page.waitForURL(/deleted=1/);

  await page.goto(`${hk}/access-groups`);
  await page.getByRole("link", { name: "Administrator", exact: true }).click();
  await page.waitForURL(/access-groups\/\d+$/);
  await page.uncheck(
    'input[name="attribute"][value="housekeeping.accessGroups"]',
  );
  await page.getByRole("button", { name: "Save Group" }).click();
  await page.waitForLoadState();
  check(
    "EXIT: the attribute stays ticked",
    await page.isChecked(
      'input[name="attribute"][value="housekeeping.accessGroups"]',
    ),
  );
  await shot(page, "refused");

  await page
    .locator("main section")
    .nth(1)
    .getByRole("button", { name: "Remove" })
    .click();
  await page.waitForLoadState();
  check(
    "the last manager is still a member",
    (await page.locator("main section").nth(1).innerText()).includes(
      "Admin-1 (ID:",
    ),
  );

  await page.goto(`${hk}/logs`);
  await shot(page, "logs");

  const hrefs = await page
    .locator("aside a, nav a")
    .evaluateAll((all) => all.map((a) => a.href));
  for (const href of new Set(hrefs)) {
    const response = await page.goto(href);
    check(`link ${new URL(href).pathname} works`, response.status() === 200);
  }

  // Today's sizes: 16px in Verdana, and every page fits a 1366px screen.
  await page.setViewportSize({ width: 1366, height: 768 });
  const wide = [];
  for (const href of new Set(hrefs)) {
    await page.goto(href);
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
    if (!fits) wide.push(new URL(href).pathname + new URL(href).search);
  }
  check(
    "staff open any page of housekeeping on a 1366px screen: nothing scrolls sideways",
    wide.length === 0,
    wide.join(", "),
  );
  await page.goto(`${hk}/`);
  const text = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return { size: body.fontSize, font: body.fontFamily };
  });
  check(
    "staff open housekeeping: its text is 16px in Verdana",
    text.size === "16px" && text.font.startsWith("Verdana"),
    JSON.stringify(text),
  );
  const own = await page.evaluate(() => {
    const color = (selector) => getComputedStyle(document.querySelector(selector)).backgroundColor;
    return {
      bar: color("header"),
      tab: color('nav a:not([aria-current="page"])'),
      active: color('nav a[aria-current="page"]'),
      list: color("main h2"),
      tabWidth: document.querySelector("nav a").getBoundingClientRect().width,
    };
  });
  check(
    "staff open housekeeping at the new sizes: the grey bar, the navy tabs with the active one apart, and the gold lists stay",
    new Set([own.bar, own.tab, own.active, own.list]).size === 4 && own.tabWidth === 224,
    JSON.stringify(own),
  );
  await shot(page, "dashboard-1366");
  await page.goto(`${hk}/settings?section=site`);
  await shot(page, "settings-1366");
  await page.goto(`${hk}/logs`);
  await shot(page, "logs-1366");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${hk}/`);
  await shot(page, "dashboard-1920");
  await page.goto(`${hk}/settings?section=site`);
  await shot(page, "settings-1920");
  await page.goto(`${hk}/logs`);
  await shot(page, "logs-1920");
  await page.setViewportSize({ width: 1000, height: 655 });

  await page.goto(`${hk}/`);
  const style = await page.evaluate(() => ({
    padding: getComputedStyle(document.querySelector("main td")).paddingLeft,
    even: getComputedStyle(document.querySelector("main tbody tr:nth-child(2)"))
      .backgroundColor,
    odd: getComputedStyle(document.querySelector("main tbody tr:nth-child(1)"))
      .backgroundColor,
  }));
  check(
    "a served table has its padding and its stripes",
    style.padding === "4px" && style.even !== style.odd,
    JSON.stringify(style),
  );
  const look = await page.evaluate(() => {
    const color = (selector) =>
      getComputedStyle(document.querySelector(selector)).backgroundColor;
    return { title: color("main h2"), menu: color("aside h2") };
  });
  check(
    "a data list is gold and the navigation is blue",
    look.title !== look.menu,
    JSON.stringify(look),
  );
  await shot(page, "dashboard");

  await page.goto(`${hk}/settings?section=site`);
  await shot(page, "settings");
  const form = await page.evaluate(() => ({
    title: getComputedStyle(document.querySelector("main h2")).backgroundColor,
    menu: getComputedStyle(document.querySelector("aside h2")).backgroundColor,
    even: getComputedStyle(document.querySelector("main tbody tr:nth-child(2)"))
      .backgroundColor,
    odd: getComputedStyle(document.querySelector("main tbody tr:nth-child(1)"))
      .backgroundColor,
  }));
  check(
    "a form is blue with plain rows",
    form.title === form.menu && form.even === form.odd,
    JSON.stringify(form),
  );

  const before = await page.locator("#clock-server-time").innerText();
  check(
    "the clock shows both times",
    (await page.locator("#clock-local-time").innerText()).includes("GMT") &&
      before.includes("(UTC)"),
    before,
  );
  await page.waitForTimeout(1200);
  check(
    "the clock ticks",
    (await page.locator("#clock-server-time").innerText()) !== before,
  );

  check(
    "no page failed for the administrator",
    problems.length === 0,
    problems.join(", "),
  );
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(`${base}/`);
  await page.goto(`${hk}/`);
  check(
    "Log out ends the shared session",
    page.url() === `${base}/`,
    page.url(),
  );
  await context.close();
}
