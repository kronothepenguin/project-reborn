export const programs = ["cms", "housekeeping"];

export default async function ({ base, browser, check, hk, hkOrigin, shot, sql }) {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 655 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on(
    "console",
    (m) =>
      m.type() === "error" &&
      !m.text().includes("422") &&
      errors.push(`console: ${m.text()}`),
  );
  page.on(
    "response",
    (r) =>
      r.status() >= 400 &&
      r.status() !== 422 &&
      errors.push(`${r.status()} ${r.url()}`),
  );

  await page.goto(`${base}/`);
  await page.fill('input[name="username"]', "Admin-1");
  await page.fill('input[name="password"]', "secret123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/me");

  await page.goto(`${hk}/settings`);
  check(
    "the tab is active",
    (await page.locator('nav a[aria-current="page"]').innerText()) ===
      "Site & Content",
  );
  await shot(page, "settings");

  const links = await page
    .locator('aside a[href*="/settings?section="]')
    .evaluateAll((all) => all.map((a) => a.getAttribute("href")));
  check("the menu lists the settings sections", links.length >= 8, String(links.length));
  for (const href of links) {
    const response = await page.goto(`${hkOrigin}${href}`);
    const heading = await page.locator("main h2").first().innerText();
    const inputs = await page.locator("main input, main select").count();
    check(
      `section ${new URL(href, "http://x").searchParams.get("section")}`,
      response.status() === 200 && inputs > 0,
      `${heading}, ${inputs} inputs`,
    );
  }

  await page.goto(`${hk}/settings?section=staffPage`);
  const box1 = page.getByRole("textbox", { name: "Staff Content Box 1", exact: true });
  check(
    "the two staff boxes are written in the BBCode editor, named by their labels, and the other fields stay plain",
    (await page.getByRole("toolbar", { name: "Formatting" }).count()) === 2 &&
      !(await page.locator('textarea[name="staffPage.box1Body"]').isVisible()) &&
      (await box1.isVisible()) &&
      (await page.getByRole("textbox", { name: "Staff Content Box 2", exact: true }).isVisible()) &&
      (await page.locator('input[name="staffPage.box1Heading"]').isVisible()) &&
      (await page.getByRole("button", { name: "Smiley :)" }).count()) === 0,
  );
  await box1.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Need help?");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Ask us.");
  await box1.evaluate((area) => {
    const text = area.firstChild;
    document.getSelection().setBaseAndExtent(text, 0, text, "Need help?".length);
  });
  await box1.locator("xpath=..").getByRole("button", { name: "Bold" }).click();
  await page.selectOption('select[name="staffPage.box1Color"]', "red");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check(
    "the staff module keeps a multi-line body written in the editor, and a colour",
    (await page.inputValue('textarea[name="staffPage.box1Body"]')) ===
      "[b]Need help?[/b]\nAsk us." &&
      (await page.inputValue('select[name="staffPage.box1Color"]')) === "red" &&
      (await box1.locator("strong").innerText()) === "Need help?",
    await page.inputValue('textarea[name="staffPage.box1Body"]'),
  );
  await shot(page, "settings-staff");
  let staffPage = "";
  for (let i = 0; i < 20 && !staffPage.includes("<strong>Need help?</strong><br />"); i++) {
    if (i > 0) await page.waitForTimeout(250);
    staffPage = await (await page.request.get(`${base}/staff`)).text();
  }
  check(
    "the staff page shows the box as it was written",
    staffPage.includes("<strong>Need help?</strong><br />") && staffPage.includes("Ask us."),
  );
  const plain = await browser.newContext({ javaScriptEnabled: false });
  await plain.addCookies(await page.context().cookies());
  const plainPage = await plain.newPage();
  await plainPage.goto(`${hk}/settings?section=staffPage`);
  check(
    "without JavaScript the staff boxes are plain fields",
    (await plainPage.locator('textarea[name="staffPage.box1Body"]').isVisible()) &&
      (await plainPage.getByRole("toolbar", { name: "Formatting" }).count()) === 0,
  );
  await plain.close();

  await page.goto(`${hk}/settings?section=features`);
  check(
    "Group Purchasing Enabled and HC Months Limit of 6 join the content options, and Smilies Enabled leaves them",
    (await page.locator("main label").allInnerTexts()).join("|") ===
      "Landing Promo Enabled|Birthday Notifications Enabled|Tag Fight Enabled|Group Purchasing Enabled|HC Months Limit" &&
      (await page.inputValue('input[name="club.maxMonths"]')) === "6",
    (await page.locator("main label").allInnerTexts()).join("|"),
  );
  await page.goto(`${hk}/settings?section=homes`);
  check(
    "Wardrobe Slots joins the Homes form with Holo's 5",
    (await page.locator("main label").allInnerTexts()).join("|") ===
      "Items Per Home|Note Length|Tags Per Habbo|Wardrobe Slots" &&
      (await page.inputValue('input[name="homes.wardrobeSlots"]')) === "5",
    (await page.locator("main label").allInnerTexts()).join("|"),
  );

  await page.goto(`${hk}/settings?section=creditsPage`);
  const credits2 = page.getByRole("textbox", { name: "Credits Content Box 2", exact: true });
  await credits2.locator("strong").waitFor();
  const ways = (await credits2.innerText()).split("\n").filter((line) => line.startsWith("* "));
  check(
    "the two credits boxes are written in the BBCode editor, the second with credits in bold and Holo's four ways on lines of their own",
    (await page.getByRole("toolbar", { name: "Formatting" }).count()) === 2 &&
      !(await page.locator('textarea[name="creditsPage.box2Body"]').isVisible()) &&
      (await page.getByRole("textbox", { name: "Credits Content Box 1", exact: true }).isVisible()) &&
      (await credits2.locator("strong").innerText()) === "credits" &&
      ways.length === 4,
    ways.join(" | "),
  );
  await shot(page, "settings-credits");
  await credits2.click();
  await page.keyboard.type("x");
  await page.keyboard.press("Backspace");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  const creditsRows = sql("SELECT key, value FROM settings WHERE key LIKE 'creditsPage.%'");
  check(
    "a box typed in and saved keeps Holo's text as it was declared",
    page.url().includes("saved=1") && creditsRows.length === 0,
    JSON.stringify(creditsRows),
  );

  await page.goto(`${hk}/settings?section=site`);
  await page.fill('input[name="site.name"]', "Reborn <b>Palace</b>");
  await page.getByRole("button", { name: "Save Configuration" }).click();
  await page.waitForLoadState();
  check(
    "the name is escaped",
    (await page.inputValue('input[name="site.name"]')) ===
      "Reborn <b>Palace</b>",
  );

  check("no page failed", errors.length === 0, errors.join(" | "));
}
