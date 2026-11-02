import { readFileSync } from "node:fs";

export const emptyFolder = true;
export const programs = [];

// The walk across the three programs: the installer's forms, the session reaching
// housekeeping on its own port, and settings saved there reaching the CMS.
export default async function ({
  base,
  browser,
  check,
  dir,
  hk,
  installer,
  ports,
  restart,
  shot,
  sql,
  start,
  stop,
}) {
  const context = await browser.newContext({
    viewport: { width: 1000, height: 655 },
  });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });
  const tab = () =>
    page.getByRole("link", { name: "Housekeeping", exact: true }).first();
  const save = async (button) => {
    await page.click(`main button:has-text("${button}")`);
    await page.waitForLoadState();
    return page.locator('[role="status"], [role="alert"]').first().innerText();
  };

  await start("installer");
  await page.goto(`${installer}/config`);
  check(
    "the form has a Housekeeping port",
    await page.getByText("Housekeeping port").isVisible(),
  );
  check(
    "filled with the default",
    (await page.inputValue('input[name="housekeepingPort"]')) === "18465",
  );
  await page.fill('input[name="port"]', String(ports.cms));
  await page.fill('input[name="housekeepingPort"]', String(ports.housekeeping));
  await Promise.all([
    page.waitForURL("**/site"),
    page.click('button:has-text("Write configuration")'),
  ]);
  await page.goto(`${installer}/config`);
  const written = await page.locator("main, body").first().innerText();
  check(
    "the written page names both ports",
    written.includes(`on port ${ports.cms}`) &&
      written.includes(`housekeeping on port ${ports.housekeeping}`),
    written.slice(0, 200),
  );
  await page.goto(`${installer}/site`);
  check(
    "the site step offers housekeeping on the chosen port",
    (await page.inputValue('input[name="housekeepingUrl"]')) === hk,
    await page.inputValue('input[name="housekeepingUrl"]'),
  );
  await page.fill('input[name="name"]', "Reborn Hotel");
  await page.fill('input[name="shortName"]', "Reborn");
  await page.fill('input[name="url"]', base);
  await Promise.all([
    page.waitForURL("**/admin"),
    page.click('button:has-text("Save and continue")'),
  ]);
  await page.fill('input[name="name"]', "Admin-1");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="bornOn"]', "1990-05-01");
  await page.fill('input[name="password"]', "secret123");
  await page.fill('input[name="passwordConfirm"]', "secret123");
  await Promise.all([
    page.waitForURL("**/done"),
    page.click('button:has-text("Create administrator")'),
  ]);
  const config = JSON.parse(readFileSync(`${dir}/config.json`, "utf8"));
  check(
    "config.json holds both ports",
    config.cms.port === ports.cms &&
      config.housekeeping.port === ports.housekeeping,
    JSON.stringify(config),
  );
  await stop("installer");

  await start("cms");
  await start("housekeeping");
  await page.goto(`${base}/`);
  await page.fill('input[name="username"]', "Admin-1");
  await page.fill('input[name="password"]', "secret123");
  await Promise.all([
    page.waitForURL("**/me"),
    page.click('button[type="submit"]'),
  ]);
  check(
    "the tab starts at the installer's address",
    (await tab().getAttribute("href")) === hk,
    await tab().getAttribute("href"),
  );
  await page.goto(`${hk}/`);
  check(
    "the session reaches housekeeping on its own port",
    (await page.locator("header strong").first().innerText()) === "Admin-1",
    await page.locator("body").innerText(),
  );
  await shot(page, "together-dashboard");

  await page.goto(`${hk}/settings?section=site`);
  check(
    "Housekeeping Address is labelled",
    await page.getByText("Housekeeping Address", { exact: true }).isVisible(),
  );
  await shot(page, "together-settings");
  await page.fill('input[name="site.housekeepingUrl"]', "not an address");
  const refused = await save("Save Configuration");
  check(
    "a bad address is refused",
    refused.includes("must be a path or an http or https URL"),
    refused,
  );
  await page.fill('input[name="site.housekeepingUrl"]', `${hk}/`);
  check(
    "a good one is saved",
    (await save("Save Configuration")) === "Settings saved successfully.",
  );

  await page.goto(`${hk}/settings?section=registration`);
  check(
    "Habbos Per User is labelled",
    await page.getByText("Habbos Per User", { exact: true }).isVisible(),
  );
  await page.fill('input[name="registration.maxHabbosPerUser"]', "2");
  check(
    "the limit is saved",
    (await save("Save Settings")) === "Settings saved successfully.",
  );

  await page.goto(`${hk}/settings?section=features`);
  check(
    "the birthday setting has Holo's title",
    await page
      .getByText("Birthday Notifications Enabled", { exact: true })
      .isVisible(),
  );
  await page.selectOption('select[name="features.birthdayNotifications"]', "0");
  check(
    "it is switched off",
    (await save("Save Settings")) === "Settings saved successfully.",
  );

  await page.goto(`${hk}/logs`);
  const logs = await page.locator("main").innerText();
  check(
    "the log names all three",
    [
      "site.housekeepingUrl",
      "registration.maxHabbosPerUser",
      "features.birthdayNotifications",
    ].every((key) => logs.includes(key)),
    logs.slice(0, 300),
  );

  await page.goto(`${base}/me`);
  check(
    "a running CMS keeps its values until it restarts",
    (await tab().getAttribute("href")) === hk,
    await tab().getAttribute("href"),
  );

  await restart("cms");
  sql(
    "UPDATE users SET born_on = date('now', '-30 years') WHERE email = 'admin@example.com'",
  );
  await page.goto(`${base}/me`);
  check(
    "the tab follows the setting after the restart",
    (await tab().getAttribute("href")) === `${hk}/`,
    await tab().getAttribute("href"),
  );
  check(
    "the birthday message is off",
    !(await page.locator("main").innerText()).toLowerCase().includes("happy"),
  );
  await Promise.all([page.waitForURL(`${hk}/`), tab().click()]);
  check(
    "the tab opens housekeeping",
    (await page.locator("header strong").first().innerText()) === "Admin-1",
  );

  await page.goto(`${base}/account/habbos`);
  await page.waitForFunction(
    () => document.getElementById("habbo-figure")?.value !== "",
  );
  await page.fill(
    'form[action="/account/habbos"] input[name="name"]',
    "Second",
  );
  await page.click('button:has-text("Add habbo")');
  await page.getByText("Second is ready to use.").waitFor();
  check(
    "the limit from housekeeping stops the form",
    (await page.getByText("Add a habbo").count()) === 0,
  );
  const third = await page.evaluate(
    async () =>
      (
        await fetch("/account/habbos", {
          method: "POST",
          body: new URLSearchParams({ name: "Third" }),
        })
      ).status,
  );
  check("and the server refuses a third", third === 422, String(third));

  await page.click('li:has-text("Second") button:has-text("Switch")');
  await page.waitForURL("**/account/habbos");
  await page.goto(`${hk}/`);
  check(
    "housekeeping names the habbo switched to on the CMS",
    (await page.locator("header strong").first().innerText()) === "Second",
  );

  await page.goto(`${hk}/settings?section=features`);
  await page.selectOption('select[name="features.birthdayNotifications"]', "1");
  check(
    "the birthday setting is back on",
    (await save("Save Settings")) === "Settings saved successfully.",
  );

  await restart("cms");
  await page.goto(`${base}/me`);
  const main = await page.locator("main").innerText();
  check(
    "the birthday message is back",
    main.toLowerCase().includes("happy"),
    main.slice(0, 300),
  );
  await page.click('button:has-text("Sign Out")');
  await page.waitForLoadState();
  await page.goto(`${hk}/`);
  check(
    "signing out on the CMS ends housekeeping too",
    page.url().startsWith(base),
    page.url(),
  );

  check(
    "no script error and no 5xx",
    problems.length === 0,
    problems.join(" | "),
  );
}
