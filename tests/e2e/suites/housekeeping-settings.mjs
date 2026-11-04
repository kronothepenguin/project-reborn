export const programs = ["cms", "housekeeping"];

export default async function ({ base, browser, check, hk, hkOrigin, shot }) {
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

  await page.goto(`${hk}/settings?section=site`);
  await page.fill('input[name="site.name"]', "Reborn <b>Palace</b>");
  await page.getByRole("button", { name: "Save Configuration" }).click();
  await page.waitForLoadState();
  check("the save redirects", page.url().includes("saved=1"), page.url());
  check(
    "Holo's message",
    (await page.getByRole("status").innerText()) ===
      "Settings saved successfully.",
  );
  check(
    "the name is escaped",
    (await page.inputValue('input[name="site.name"]')) ===
      "Reborn <b>Palace</b>",
  );

  await page.fill('input[name="site.shortName"]', "");
  await page.fill('input[name="site.url"]', "https://typed.example.com");
  const refused = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: "Save Configuration" }).click();
  check("a blank field answers 422", (await refused).status() === 422);
  await page.waitForLoadState();
  check(
    "Holo's refusal",
    (await page.getByRole("alert").innerText()).includes(
      "Please do not leave any fields blank. Settings not saved.",
    ),
  );
  check(
    "the typed address stays",
    (await page.inputValue('input[name="site.url"]')) ===
      "https://typed.example.com",
  );

  await page.goto(`${hk}/settings?section=mail`);
  await page.fill('input[name="mail.password"]', "hunter2-secret");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check("the password saved", page.url().includes("saved=1"));
  const html = await page.content();
  check("the password is not on the page", !html.includes("hunter2-secret"));
  check(
    "the password field is blank",
    (await page.inputValue('input[name="mail.password"]')) === "",
  );
  await shot(page, "mail");

  await page.goto(`${hk}/settings?section=auth`);
  await page.fill('input[name="auth.passwordMinLength"]', "30");
  await page.fill('input[name="auth.passwordMaxLength"]', "40");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check(
    "both limits rise together",
    (await page.inputValue('input[name="auth.passwordMaxLength"]')) === "40" &&
      (await page.inputValue('input[name="auth.passwordMinLength"]')) === "30",
  );
  await page.fill('input[name="auth.passwordMinLength"]', "6");
  await page.fill('input[name="auth.passwordMaxLength"]', "25");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.waitForLoadState();
  check(
    "both limits fall together",
    (await page.inputValue('input[name="auth.passwordMaxLength"]')) === "25",
  );

  await page.goto(`${hk}/logs`);
  const rows = await page.locator("main tbody tr").allInnerTexts();
  check("no log row names a secret", !rows.join(" ").includes("hunter2"));
  await shot(page, "logs");

  check("no page failed", errors.length === 0, errors.join(" | "));
}
