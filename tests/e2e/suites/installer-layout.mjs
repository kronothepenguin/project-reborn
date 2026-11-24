export const emptyFolder = true;
export const programs = [];

// The installer's layout: every step on one column with the stepper, the row of
// buttons in one place, and the settings step's groups as sections that open
// and close, with and without scripts.
export default async function ({ browser, check, installer, ports, shot, sql, start }) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 655 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });

  // The column of a step: the left and right edges of the stepper, of each
  // field, text and section title, and of the row of buttons, whose last
  // button is the main one at the right end. Each edge is the stepper's, but
  // the right edge of a field marked data-short, which fits its short value.
  const column = (where) =>
    where.evaluate(() => {
      const box = (el) => el.getBoundingClientRect();
      const steps = box(document.querySelector('nav[aria-label="Steps"]'));
      const card = box(document.querySelector("main > div"));
      const visible = (el) => el.checkVisibility();
      const lefts = [...document.querySelectorAll("main p, main input:not([type=hidden]):not([type=checkbox]), main summary")]
        .filter(visible)
        .map((el) => Math.round(box(el).left - steps.left));
      const rights = [...document.querySelectorAll("main input:not([type=hidden]):not([type=checkbox]):not([data-short]), main summary")]
        .filter(visible)
        .map((el) => Math.round(steps.right - box(el).right));
      const buttons = [...document.querySelectorAll("main a, main button")].filter((el) =>
        el.closest(".sticky"),
      );
      const main = buttons[0] && box(buttons[0]);
      return {
        lefts: [...new Set(lefts)],
        rights: [...new Set(rights)],
        mainRight: main ? Math.round(steps.right - main.right) : null,
        order: buttons.map((el) => [Math.round(box(el).left), el.innerText.trim()]).sort((a, b) => a[0] - b[0]).map((b) => b[1]),
        sides: [Math.round(steps.left - card.left), Math.round(card.right - steps.right)],
      };
    });
  const oneColumn = async (name, buttons) => {
    const c = await column(page);
    check(
      `the ${name} step shares one left edge and one width, with its buttons at the right end in order`,
      c.lefts.every((left) => left === 0) &&
        c.rights.every((right) => right === 0) &&
        c.mainRight === 0 &&
        c.sides[0] === c.sides[1] &&
        JSON.stringify(c.order) === JSON.stringify(buttons),
      JSON.stringify(c),
    );
  };
  const stepper = () =>
    page.locator('nav[aria-label="Steps"] li').evaluateAll((items) =>
      items.map((li) => ({
        name: li.innerText.trim(),
        link: li.querySelector("a")?.getAttribute("href") ?? null,
        current: li.querySelector('[aria-current="step"]') !== null,
        top: Math.round(li.getBoundingClientRect().top),
        left: Math.round(li.getBoundingClientRect().left),
      })),
    );

  await start("installer");
  await page.goto(`${installer}/`);
  const text = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const steps = document.querySelector('nav[aria-label="Steps"]').getBoundingClientRect();
    return { size: body.fontSize, font: body.fontFamily, column: Math.round(steps.width) };
  });
  check(
    "an administrator opens the installer: its text is 12px in Verdana, the site's size, on a column fitted to it",
    text.size === "12px" && text.font.startsWith("Verdana") && text.column === 574,
    JSON.stringify(text),
  );
  await shot(page, "installer-status-1366");
  await oneColumn("status", ["Start"]);
  await page.goto(`${installer}/config`);
  const first = await stepper();
  check(
    "the steps show in one row, in order, from the left edge, the current one marked",
    JSON.stringify(first.map((s) => s.name)) ===
      JSON.stringify(["Configuration", "Site", "Settings", "Client files", "Administrator"]) &&
      new Set(first.map((s) => s.top)).size === 1 &&
      first.every((s, i) => i === 0 || s.left > first[i - 1].left) &&
      first.findIndex((s) => s.current) === 0 &&
      JSON.stringify(
        await page.locator('nav[aria-label="Steps"] li').evaluateAll((items) =>
          items.map((li) => getComputedStyle(li, "::after").display !== "none"),
        ),
      ) === JSON.stringify([true, true, true, true, false]),
    JSON.stringify(first),
  );
  await shot(page, "installer-config-1366");
  await oneColumn("config", ["Write configuration"]);
  await page.fill('input[name="port"]', String(ports.cms));
  await page.fill('input[name="housekeepingPort"]', String(ports.housekeeping));
  await Promise.all([page.waitForURL("**/site"), page.click('button:has-text("Write configuration")')]);
  await shot(page, "installer-site-1366");
  await oneColumn("site", ["Save and continue"]);
  await page.fill('input[name="name"]', "Reborn Hotel");
  await page.fill('input[name="shortName"]', "Reborn");
  await Promise.all([page.waitForURL("**/settings"), page.click('button:has-text("Save and continue")')]);

  const settings = await stepper();
  check(
    "a step passed is a link to it, the current one and a step to come are plain",
    JSON.stringify(settings.map((s) => s.link)) ===
      JSON.stringify(["/installer/config", "/installer/site", null, null, null]) &&
      settings[2].current,
    JSON.stringify(settings),
  );
  await Promise.all([page.waitForURL("**/site"), page.getByRole("link", { name: "Site", exact: true }).click()]);
  check(
    "a link of the stepper opens the step passed",
    (await page.inputValue('input[name="name"]')) === "Reborn Hotel",
    page.url(),
  );
  await page.goto(`${installer}/settings`);

  // The settings step: sections, the first open, every field in the one form.
  const titles = page.locator("#settings-sections > details > summary");
  const open = () =>
    page.locator("#settings-sections details[open] > summary").evaluateAll((all) => all.filter((s) => s.checkVisibility()).map((s) => s.innerText.trim()));
  const toggle = (title) => page.locator(`#settings-sections summary:text-is("${title}")`).click();
  check(
    "the settings step shows its groups as sections, the first open, with More settings last and closed",
    JSON.stringify(await titles.allInnerTexts()) ===
      JSON.stringify(["New players", "Password reset mail", "Avatar pictures", "Site features", "Prices", "Game ads", "More settings"]) &&
      JSON.stringify(await open()) === JSON.stringify(["New players"]) &&
      (await page.locator('input[name="referral.reward"]').isVisible()) &&
      !(await page.locator('input[name="groups.price"]').isVisible()) &&
      (await page.locator('form[action="/installer/settings"] input[name="homes.maxTags"]').count()) === 1 &&
      (await page.locator("astro-island, script[src]").count()) === 0,
    JSON.stringify(await open()),
  );
  await toggle("Prices");
  await toggle("New players");
  check(
    "a click on a section's title opens it, and another click closes it",
    JSON.stringify(await open()) === JSON.stringify(["Prices"]) &&
      (await page.locator('input[name="groups.price"]').isVisible()),
    JSON.stringify(await open()),
  );
  await toggle("New players");
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "installer-settings-1366");
  await oneColumn("settings", ["Skip", "Save settings"]);
  const short = await page.locator("main input[data-short]").evaluateAll((all) =>
    all.filter((el) => el.checkVisibility()).map((el) => [el.name, Math.round(el.getBoundingClientRect().width), el.scrollWidth <= el.clientWidth]),
  );
  check(
    "a field of a short value is narrow and shows its whole value",
    short.length === 6 && short.every(([, width, fits]) => width < 200 && fits),
    JSON.stringify(short),
  );
  await toggle("Site features");
  await page.evaluate(() => window.scrollTo(0, 0));
  const inSight = await page.evaluate(() =>
    ["Skip", "Save settings"].every((name) => {
      const button = [...document.querySelectorAll("main button")].find((b) => b.innerText.trim() === name);
      const r = button.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    }),
  );
  check(
    "on a step taller than the screen, Skip and Save settings stay in sight",
    inSight && (await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)),
  );
  await shot(page, "installer-layout-settings");

  // A field in a closed section is refused: its section opens and the form names it.
  await page.fill('input[name="groups.price"]', "-1");
  await toggle("Prices");
  const save = () =>
    Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/installer/settings") && r.request().method() === "POST"),
      page.click('button:has-text("Save settings")'),
    ]).then(([response]) => response);
  let refused = await save();
  await page.getByRole("alert").waitFor();
  check(
    "a field refused in a closed section opens its section, and the form names it",
    refused.status() === 422 &&
      JSON.stringify(await open()) === JSON.stringify(["Prices"]) &&
      (await page.locator('input[name="groups.price"]').isVisible()) &&
      (await page.getByRole("alert").innerText()).startsWith("Group Price:"),
    JSON.stringify(await open()),
  );
  await page.fill('input[name="groups.price"]', "35");
  await page.evaluate(() => (document.querySelector('input[name="homes.maxTags"]').value = "0"));
  refused = await save();
  await page.getByRole("alert").waitFor();
  check(
    "a field refused in a closed group of More settings opens More settings and that group",
    refused.status() === 422 &&
      JSON.stringify(await open()) === JSON.stringify(["More settings", "Homes"]) &&
      (await page.locator('input[name="homes.maxTags"]').isVisible()),
    JSON.stringify(await open()),
  );

  // Changes in several sections are saved together, also from closed ones.
  await page.fill('input[name="homes.maxTags"]', "9");
  await toggle("More settings");
  await toggle("New players");
  await page.fill('input[name="referral.reward"]', "75");
  await toggle("New players");
  check("the changed sections are closed", JSON.stringify(await open()) === "[]", JSON.stringify(await open()));
  await Promise.all([page.waitForURL("**/client"), page.click('button:has-text("Save settings")')]);
  const saved = Object.fromEntries(
    sql("SELECT key, value FROM settings WHERE key IN ('groups.price', 'referral.reward', 'homes.maxTags')"),
  );
  check(
    "changes in several sections are all saved, also from closed sections",
    String(saved["groups.price"]) === "35" &&
      String(saved["referral.reward"]) === "75" &&
      String(saved["homes.maxTags"]) === "9",
    JSON.stringify(saved),
  );
  await shot(page, "installer-client-1366");
  await oneColumn("client", ["Skip", "Check again"]);
  await Promise.all([page.waitForURL("**/admin"), page.click('button:has-text("Skip")')]);
  await shot(page, "installer-admin-1366");
  await oneColumn("administrator", ["Create administrator"]);
  await page.setViewportSize({ width: 375, height: 667 });
  await shot(page, "installer-admin-375");
  await page.goto(`${installer}/settings`);
  await shot(page, "installer-settings-375");

  // With scripts off, the stepper's links work and the sections open and close.
  const plain = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1366, height: 655 } })).newPage();
  await plain.goto(`${installer}/settings`);
  const plainOpen = () =>
    plain.locator("#settings-sections details[open] > summary").evaluateAll((all) => all.filter((s) => s.checkVisibility()).map((s) => s.innerText.trim()));
  const opened = await plainOpen();
  await plain.locator('#settings-sections summary:text-is("Prices")').click();
  const prices = await plainOpen();
  await plain.locator('#settings-sections summary:text-is("Prices")').click();
  check(
    "with scripts off, the sections open and close as with scripts on",
    JSON.stringify(opened) === JSON.stringify(["New players"]) &&
      JSON.stringify(prices) === JSON.stringify(["New players", "Prices"]) &&
      JSON.stringify(await plainOpen()) === JSON.stringify(["New players"]),
    JSON.stringify([opened, prices]),
  );
  await Promise.all([plain.waitForURL("**/site"), plain.getByRole("link", { name: "Site", exact: true }).click()]);
  check(
    "with scripts off, the stepper shows and its links open their step",
    (await plain.locator('nav[aria-label="Steps"] li').count()) === 5 &&
      (await plain.inputValue('input[name="name"]')) === "Reborn Hotel",
    plain.url(),
  );

  check("no page errors", problems.length === 0, problems.join("\n"));
}
