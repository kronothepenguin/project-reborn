export const emptyFolder = true;
export const programs = [];

// The installer's layout: every step on one column with the stepper, the row of
// buttons in one place, and the settings step's groups as tabs, with and
// without scripts.
export default async function ({ browser, check, installer, ports, shot, sql, start }) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 655 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
  });

  // The column of a step: the left and right edges of the stepper, of each
  // field and text, and of the row of buttons, whose last button is the main
  // one at the right end. Each edge is the stepper's.
  const column = (where) =>
    where.evaluate(() => {
      const box = (el) => el.getBoundingClientRect();
      const steps = box(document.querySelector('nav[aria-label="Steps"]'));
      const card = box(document.querySelector("main > div"));
      const visible = (el) => el.getClientRects().length > 0;
      const lefts = [...document.querySelectorAll("main p, main input:not([type=hidden]):not([type=checkbox]), main fieldset")]
        .filter(visible)
        .map((el) => Math.round(box(el).left - steps.left));
      const rights = [...document.querySelectorAll("main input:not([type=hidden]):not([type=checkbox])")]
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
        name: li.innerText.replace(/^\d+\s*/, "").trim(),
        link: li.querySelector("a")?.getAttribute("href") ?? null,
        current: li.querySelector('[aria-current="step"]') !== null,
        top: Math.round(li.getBoundingClientRect().top),
        left: Math.round(li.getBoundingClientRect().left),
      })),
    );

  await start("installer");
  await page.goto(`${installer}/`);
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
      (await page.locator('nav[aria-label="Steps"] svg').count()) === 4,
    JSON.stringify(first),
  );
  await oneColumn("config", ["Write configuration"]);
  await page.fill('input[name="port"]', String(ports.cms));
  await page.fill('input[name="housekeepingPort"]', String(ports.housekeeping));
  await Promise.all([page.waitForURL("**/site"), page.click('button:has-text("Write configuration")')]);
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

  // The settings step: tabs, one group at a time, every field in the one form.
  const tabs = page.getByRole("tab");
  await tabs.first().waitFor();
  const panels = page.locator("#settings-groups [data-tab]");
  check(
    "the settings step shows its groups as tabs, one at a time, with More settings last and its groups folded",
    JSON.stringify(await tabs.allInnerTexts()) ===
      JSON.stringify(["New players", "Password reset mail", "Avatar pictures", "Site features", "Prices", "Game ads", "More settings"]) &&
      (await page.getByRole("tab", { selected: true }).innerText()) === "New players" &&
      (await page.locator("#settings-groups [role=tabpanel]").count()) === 7 &&
      (await panels.evaluateAll((all) => all.filter((p) => !p.hidden).length)) === 1 &&
      (await page.locator("#settings-groups details[open]").count()) === 0 &&
      (await page.locator('form[action="/installer/settings"] input[name="homes.maxTags"]').count()) === 1,
  );
  await oneColumn("settings", ["Skip", "Save settings"]);
  await page.getByRole("tab", { name: "Site features" }).click();
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

  // A field under a hidden tab is refused: its tab opens and the form names it.
  await page.getByRole("tab", { name: "Prices" }).click();
  await page.fill('input[name="groups.price"]', "-1");
  await page.getByRole("tab", { name: "New players" }).click();
  const [refused] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/installer/settings") && r.request().method() === "POST"),
    page.click('button:has-text("Save settings")'),
  ]);
  await page.getByRole("tab").first().waitFor();
  check(
    "a field refused under a hidden tab opens its tab, and the form names it",
    refused.status() === 422 &&
      (await page.getByRole("tab", { selected: true }).innerText()) === "Prices" &&
      (await page.locator('input[name="groups.price"]').isVisible()) &&
      (await page.getByRole("alert").innerText()).startsWith("Group Price:"),
    await page.locator("main").innerText(),
  );

  // Changes under several tabs are saved together.
  await page.fill('input[name="groups.price"]', "35");
  await page.getByRole("tab", { name: "New players" }).click();
  await page.fill('input[name="referral.reward"]', "75");
  await page.getByRole("tab", { name: "More settings" }).click();
  await page.locator("summary", { hasText: "Homes" }).click();
  await page.fill('input[name="homes.maxTags"]', "9");
  await Promise.all([page.waitForURL("**/client"), page.click('button:has-text("Save settings")')]);
  const saved = Object.fromEntries(
    sql("SELECT key, value FROM settings WHERE key IN ('groups.price', 'referral.reward', 'homes.maxTags')"),
  );
  check(
    "changes under several tabs are all saved",
    String(saved["groups.price"]) === "35" &&
      String(saved["referral.reward"]) === "75" &&
      String(saved["homes.maxTags"]) === "9",
    JSON.stringify(saved),
  );
  await oneColumn("client", ["Skip", "Check again"]);
  await Promise.all([page.waitForURL("**/admin"), page.click('button:has-text("Skip")')]);
  await oneColumn("administrator", ["Create administrator"]);

  // With scripts off, the stepper's links work and every group shows.
  const plain = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1366, height: 655 } })).newPage();
  await plain.goto(`${installer}/settings`);
  check(
    "with scripts off, the settings step shows every group, one under the other, and no tabs",
    (await plain.getByRole("tab").count()) === 0 &&
      (await plain.locator("#settings-groups [data-tab]").evaluateAll((all) =>
        all.every((p) => !p.hidden && p.getClientRects().length > 0) &&
        all.every((p, i) => i === 0 || p.getBoundingClientRect().top > all[i - 1].getBoundingClientRect().bottom),
      )) &&
      (await plain.locator("#settings-groups legend").count()) === 6,
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
